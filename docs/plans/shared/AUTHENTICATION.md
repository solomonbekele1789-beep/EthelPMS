# EthelPMS -- Authentication Plan

**Version:** 1.0
**Date:** October 15, 2026
**Owner:** Developer A (Backend lead) + Developer B (Frontend lead)
**Status:** Implementation-ready

> This document is the single source of truth for authentication in EthelPMS.
> Referenced by: `00-MASTER-PLAN.md` (Phase 0B task #17, Phase 1 backend tasks)

---

## Requirements Covered

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| REQ-AUTH-001 | User login with email/password, return JWT access + refresh tokens | Must | Pending |
| REQ-AUTH-002 | User logout with token revocation | Must | Pending |
| REQ-AUTH-003 | Token refresh using HttpOnly cookie (web) or body (mobile) | Must | Pending |
| REQ-AUTH-004 | Password setup via email invitation token for new users | Must | Pending |
| REQ-AUTH-005 | Forgot password -- send reset email with time-limited token | Must | Pending |
| REQ-AUTH-006 | Reset password via email token | Must | Pending |
| REQ-AUTH-007 | Mobile client detection (User-Agent/header) for token-in-body response | Must | Pending |
| REQ-AUTH-008 | JWT access token with 6-hour expiry | Must | Pending |
| REQ-AUTH-009 | Refresh token with 7-day expiry, stored as HttpOnly cookie | Must | Pending |
| REQ-AUTH-010 | Account lockout after repeated failed login attempts | Should | Pending |
| REQ-AUTH-011 | Branded email templates for account setup, password reset, role assignment | Should | Pending |
| REQ-AUTH-012 | Optional SSO integration (future extensibility) | Could | Deferred |

---

## 1. Authentication Strategy

### 1.1 Dual Token Delivery

EthelPMS serves both web browsers and mobile clients. The token delivery mechanism adapts based on client type:

| Client | Detection Method | Access Token Delivery | Refresh Token Delivery |
|--------|-----------------|----------------------|----------------------|
| **Web (browser)** | Default (no `X-Client-Type` header) | HttpOnly cookie | HttpOnly cookie |
| **Mobile (Flutter)** | `X-Client-Type: mobile` header | JSON response body | JSON response body |

The server determines the client type using a single check in this priority order:

1. If `X-Client-Type: mobile` header is present, treat as mobile
2. Otherwise, treat as web (browser)

### 1.2 Token Specifications

| Property | Access Token | Refresh Token |
|----------|-------------|---------------|
| **Format** | JWT (signed with HMAC-SHA256) | 256-bit cryptographically random string (Base64URL) |
| **Expiry** | 6 hours | 7 days |
| **Storage (web)** | HttpOnly cookie `__Host-access-token` | HttpOnly cookie `__Host-refresh-token` |
| **Storage (mobile)** | Client-managed (Flutter `flutter_secure_storage`) | Client-managed (Flutter `flutter_secure_storage`) |
| **Database storage** | Not stored (stateless, validated by signature) | Stored as SHA256 hash in `identity.refresh_tokens` |
| **Rotation** | New token on every refresh | Rotated on every refresh (old token revoked) |

### 1.3 Access Token Claims

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.org",
  "tenant_id": "org-merha-ethiopia",
  "org_name": "MERHA Ethiopia",
  "roles": ["ProjectManager", "ReportApprover"],
  "permissions": ["projects.create", "projects.read", "reports.approve"],
  "iat": 1729000000,
  "exp": 1729021600,
  "iss": "ethelpms",
  "aud": "ethelpms-api"
}
```

**Notes:**
- `sub` is the user's UUID primary key (not email)
- `tenant_id` is the Finbuckle tenant identifier, used by `ITenantInfo` resolution
- `permissions` is a flat array of permission strings; if the count exceeds 20, the backend falls back to a `perm_hash` claim (SHA256 of sorted permissions) and the authorization handler re-fetches from the database
- `roles` is included for display purposes; authorization is always permission-based, never role-based

### 1.4 Cookie Configuration (Web Clients)

```csharp
// Applied in JwtTokenService when setting cookies
var cookieOptions = new CookieOptions
{
    HttpOnly = true,           // Not accessible via JavaScript
    Secure = true,             // HTTPS only (always, even in dev via reverse proxy)
    SameSite = SameSiteMode.Strict, // No cross-site requests
    Path = "/api",             // Only sent to API routes
    Domain = null,             // Defaults to current host
    IsEssential = true         // Not affected by cookie consent (functional cookie)
};

// Access token cookie
Response.Cookies.Append("__Host-access-token", accessToken, new CookieOptions
{
    ...cookieOptions,
    MaxAge = TimeSpan.FromHours(6)
});

// Refresh token cookie
Response.Cookies.Append("__Host-refresh-token", refreshToken, new CookieOptions
{
    ...cookieOptions,
    Path = "/api/v1/auth/refresh",  // Only sent to the refresh endpoint
    MaxAge = TimeSpan.FromDays(7)
});
```

### 1.5 XSRF Protection (Web Clients)

Since cookies are sent automatically by the browser, XSRF protection is required:

- The server generates an XSRF token on login and returns it as a **non-HttpOnly** cookie named `XSRF-TOKEN`
- Angular's built-in `HttpClientXsrfModule` reads this cookie automatically
- Angular attaches the value as the `X-XSRF-TOKEN` header on every mutating request (POST, PUT, DELETE)
- The server validates the header matches the cookie value via ASP.NET Core's `[ValidateAntiForgeryToken]` or the anti-forgery middleware

---

## 2. Database Schema (`identity` schema)

All authentication tables live in the `identity` PostgreSQL schema, managed by the `IdentityDbContext`.

### 2.1 `identity.users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | User primary key |
| `email` | `varchar(256)` | NOT NULL, UNIQUE within org (see `uq_users_email_org`) | Login email |
| `normalized_email` | `varchar(256)` | NOT NULL | Uppercase email for lookups |
| `password_hash` | `varchar(512)` | NULL (null until password setup) | PBKDF2 hash (ASP.NET Core Identity) |
| `first_name` | `varchar(100)` | NOT NULL | First name |
| `last_name` | `varchar(100)` | NOT NULL | Last name |
| `phone` | `varchar(20)` | NULL | Phone number |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Soft disable (admin can deactivate) |
| `email_confirmed` | `boolean` | NOT NULL, DEFAULT `false` | Set true after password setup |
| `organization_id` | `uuid` | NOT NULL, FK -> `identity.organizations(id)` | Tenant/org this user belongs to |
| `failed_access_count` | `int` | NOT NULL, DEFAULT `0` | Failed login counter |
| `lockout_end` | `timestamptz` | NULL | Lockout expiry (null = not locked) |
| `security_stamp` | `varchar(256)` | NOT NULL | Changed on password change to invalidate tokens |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last modification timestamp |
| `deleted_at` | `timestamptz` | NULL | Soft delete timestamp (ISoftDeletable) |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `pk_users` | `id` | Primary Key |
| `uq_users_email_org` | `normalized_email, organization_id` | Unique (email unique per org) |
| `ix_users_organization` | `organization_id` | B-tree |
| `ix_users_email` | `normalized_email` | B-tree |

**RLS Policy:**

```sql
ALTER TABLE identity.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_org_isolation ON identity.users
    USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### 2.2 `identity.refresh_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Token record ID |
| `user_id` | `uuid` | NOT NULL, FK -> `identity.users(id)` ON DELETE CASCADE | Owner |
| `token_hash` | `varchar(128)` | NOT NULL | SHA256 hash of the raw token |
| `device_info` | `varchar(512)` | NULL | User-Agent or device identifier |
| `expires_at` | `timestamptz` | NOT NULL | Token expiry (7 days from creation) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When token was issued |
| `revoked_at` | `timestamptz` | NULL | When token was revoked (null = active) |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `pk_refresh_tokens` | `id` | Primary Key |
| `ix_refresh_tokens_user` | `user_id` | B-tree |
| `ix_refresh_tokens_hash` | `token_hash` | B-tree (for fast lookup during refresh) |

**Constraints:**
- One active (non-revoked, non-expired) refresh token per user per device is enforced at the application level: when a new refresh token is created for the same user + device_info, the previous one is revoked.

### 2.3 `identity.password_reset_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Token record ID |
| `user_id` | `uuid` | NOT NULL, FK -> `identity.users(id)` ON DELETE CASCADE | Owner |
| `token_hash` | `varchar(128)` | NOT NULL | SHA256 hash of the raw token |
| `purpose` | `varchar(50)` | NOT NULL | `'password_reset'` or `'password_setup'` |
| `expires_at` | `timestamptz` | NOT NULL | 24 hours for setup, 1 hour for reset |
| `used_at` | `timestamptz` | NULL | When token was consumed (null = unused) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When token was generated |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `pk_password_reset_tokens` | `id` | Primary Key |
| `ix_password_reset_tokens_hash` | `token_hash` | B-tree |
| `ix_password_reset_tokens_user` | `user_id` | B-tree |

### 2.4 EF Core Migration SQL (Reference)

```sql
-- Run by EF Core migration in IdentityDbContext
CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE identity.users (
    id                  uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    email               varchar(256)    NOT NULL,
    normalized_email    varchar(256)    NOT NULL,
    password_hash       varchar(512),
    first_name          varchar(100)    NOT NULL,
    last_name           varchar(100)    NOT NULL,
    phone               varchar(20),
    is_active           boolean         NOT NULL DEFAULT true,
    email_confirmed     boolean         NOT NULL DEFAULT false,
    organization_id     uuid            NOT NULL,
    failed_access_count int             NOT NULL DEFAULT 0,
    lockout_end         timestamptz,
    security_stamp      varchar(256)    NOT NULL,
    created_at          timestamptz     NOT NULL DEFAULT now(),
    updated_at          timestamptz     NOT NULL DEFAULT now(),
    deleted_at          timestamptz
);

CREATE UNIQUE INDEX uq_users_email_org ON identity.users (normalized_email, organization_id);
CREATE INDEX ix_users_organization ON identity.users (organization_id);
CREATE INDEX ix_users_email ON identity.users (normalized_email);

CREATE TABLE identity.refresh_tokens (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid            NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    token_hash      varchar(128)    NOT NULL,
    device_info     varchar(512),
    expires_at      timestamptz     NOT NULL,
    created_at      timestamptz     NOT NULL DEFAULT now(),
    revoked_at      timestamptz
);

CREATE INDEX ix_refresh_tokens_user ON identity.refresh_tokens (user_id);
CREATE INDEX ix_refresh_tokens_hash ON identity.refresh_tokens (token_hash);

CREATE TABLE identity.password_reset_tokens (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid            NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    token_hash      varchar(128)    NOT NULL,
    purpose         varchar(50)     NOT NULL,
    expires_at      timestamptz     NOT NULL,
    used_at         timestamptz,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX ix_password_reset_tokens_hash ON identity.password_reset_tokens (token_hash);
CREATE INDEX ix_password_reset_tokens_user ON identity.password_reset_tokens (user_id);
```

---

## 3. Backend Implementation

### 3.1 Domain Entities

#### `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/User.cs`

```csharp
using NGO.PMS.SharedKernel;

namespace NGO.PMS.Identity.Domain.Entities;

/// <summary>
/// Application user entity. Extends ASP.NET Core IdentityUser with
/// EthelPMS-specific properties. Maps to identity.users table.
/// </summary>
public sealed class User : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public string Email { get; private set; } = default!;
    public string NormalizedEmail { get; private set; } = default!;
    public string? PasswordHash { get; private set; }
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string? Phone { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool EmailConfirmed { get; private set; }
    public Guid OrganizationId { get; private set; }
    public int FailedAccessCount { get; private set; }
    public DateTimeOffset? LockoutEnd { get; private set; }
    public string SecurityStamp { get; private set; } = default!;
    public DateTimeOffset? DeletedAt { get; private set; }

    // Navigation
    public ICollection<RefreshToken> RefreshTokens { get; private set; } = [];

    public string FullName => $"{FirstName} {LastName}";

    // ── Factory ──────────────────────────────────────────────
    /// <summary>
    /// Creates a new user (invited, no password yet).
    /// </summary>
    public static User Create(
        string email,
        string firstName,
        string lastName,
        Guid organizationId,
        string? phone = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(firstName);
        ArgumentException.ThrowIfNullOrWhiteSpace(lastName);

        var user = new User
        {
            Id = Guid.CreateVersion7(),
            Email = email.Trim(),
            NormalizedEmail = email.Trim().ToUpperInvariant(),
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Phone = phone?.Trim(),
            OrganizationId = organizationId,
            SecurityStamp = Guid.NewGuid().ToString("N"),
            EmailConfirmed = false,
            IsActive = true,
            FailedAccessCount = 0
        };

        user.AddDomainEvent(new UserCreatedEvent(user.Id, user.Email, organizationId));
        return user;
    }

    // ── Behaviors ────────────────────────────────────────────
    public void SetPasswordHash(string passwordHash)
    {
        PasswordHash = passwordHash;
        EmailConfirmed = true;
        SecurityStamp = Guid.NewGuid().ToString("N");
        AddDomainEvent(new UserPasswordSetEvent(Id));
    }

    public void ChangePasswordHash(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        SecurityStamp = Guid.NewGuid().ToString("N");
        FailedAccessCount = 0;
        LockoutEnd = null;
        AddDomainEvent(new UserPasswordChangedEvent(Id));
    }

    public void RecordFailedLogin()
    {
        FailedAccessCount++;
        if (FailedAccessCount >= 5)
        {
            LockoutEnd = DateTimeOffset.UtcNow.AddMinutes(15);
            AddDomainEvent(new UserLockedOutEvent(Id, LockoutEnd.Value));
        }
    }

    public void RecordSuccessfulLogin()
    {
        FailedAccessCount = 0;
        LockoutEnd = null;
    }

    public bool IsLockedOut =>
        LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;

    public void Deactivate()
    {
        IsActive = false;
        AddDomainEvent(new UserDeactivatedEvent(Id));
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void SoftDelete()
    {
        DeletedAt = DateTimeOffset.UtcNow;
        IsActive = false;
    }

    public void UpdateProfile(string firstName, string lastName, string? phone)
    {
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Phone = phone?.Trim();
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/RefreshToken.cs`

```csharp
namespace NGO.PMS.Identity.Domain.Entities;

/// <summary>
/// Refresh token entity. Stored as SHA256 hash. Maps to identity.refresh_tokens table.
/// One active token per user per device.
/// </summary>
public sealed class RefreshToken
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = default!;
    public string? DeviceInfo { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }

    // Navigation
    public User User { get; private set; } = default!;

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTimeOffset.UtcNow;
    public bool IsExpired => ExpiresAt <= DateTimeOffset.UtcNow;
    public bool IsRevoked => RevokedAt is not null;

    public static RefreshToken Create(
        Guid userId,
        string tokenHash,
        string? deviceInfo,
        TimeSpan lifetime)
    {
        return new RefreshToken
        {
            Id = Guid.CreateVersion7(),
            UserId = userId,
            TokenHash = tokenHash,
            DeviceInfo = deviceInfo,
            ExpiresAt = DateTimeOffset.UtcNow.Add(lifetime),
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Revoke()
    {
        RevokedAt = DateTimeOffset.UtcNow;
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/PasswordResetToken.cs`

```csharp
namespace NGO.PMS.Identity.Domain.Entities;

/// <summary>
/// Time-limited token for password reset and new-user password setup.
/// Maps to identity.password_reset_tokens table.
/// </summary>
public sealed class PasswordResetToken
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = default!;
    public string Purpose { get; private set; } = default!;  // "password_reset" | "password_setup"
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? UsedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    // Navigation
    public User User { get; private set; } = default!;

    public bool IsValid => UsedAt is null && ExpiresAt > DateTimeOffset.UtcNow;

    public static class Purposes
    {
        public const string PasswordReset = "password_reset";
        public const string PasswordSetup = "password_setup";
    }

    public static PasswordResetToken Create(
        Guid userId,
        string tokenHash,
        string purpose,
        TimeSpan lifetime)
    {
        return new PasswordResetToken
        {
            Id = Guid.CreateVersion7(),
            UserId = userId,
            TokenHash = tokenHash,
            Purpose = purpose,
            ExpiresAt = DateTimeOffset.UtcNow.Add(lifetime),
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void MarkUsed()
    {
        UsedAt = DateTimeOffset.UtcNow;
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Domain/Events/` (Domain Events)

```csharp
// UserCreatedEvent.cs
namespace NGO.PMS.Identity.Domain.Entities;

public sealed record UserCreatedEvent(
    Guid UserId,
    string Email,
    Guid OrganizationId) : IDomainEvent;

// UserPasswordSetEvent.cs
public sealed record UserPasswordSetEvent(Guid UserId) : IDomainEvent;

// UserPasswordChangedEvent.cs
public sealed record UserPasswordChangedEvent(Guid UserId) : IDomainEvent;

// UserLockedOutEvent.cs
public sealed record UserLockedOutEvent(
    Guid UserId,
    DateTimeOffset LockoutEnd) : IDomainEvent;

// UserDeactivatedEvent.cs
public sealed record UserDeactivatedEvent(Guid UserId) : IDomainEvent;
```

### 3.2 Application Layer -- Commands & Queries

All commands and queries follow the vertical slice pattern defined in `00-CODING-STANDARDS.md`.

#### `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/Login/`

```csharp
// LoginCommand.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.Login;

/// <summary>
/// Authenticates a user with email + password. Returns tokens.
/// </summary>
public sealed record LoginCommand(
    string Email,
    string Password,
    string? DeviceInfo) : IRequest<LoginResponse>;

public sealed record LoginResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string[] Roles,
    string[] Permissions,
    // Only populated for mobile clients (web uses cookies)
    string? AccessToken,
    string? RefreshToken);
```

```csharp
// LoginCommandHandler.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.Login;

public sealed class LoginCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IPermissionService permissionService,
    ILogger<LoginCommandHandler> logger)
    : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Find user by email (across all orgs -- email+org is unique)
        var user = await userRepository.GetByEmailAsync(
            request.Email, cancellationToken);

        if (user is null || !user.IsActive || user.DeletedAt is not null)
            throw new AuthenticationException("Invalid email or password.");

        // 2. Check lockout
        if (user.IsLockedOut)
            throw new AuthenticationException(
                "Account is locked. Try again after 15 minutes.");

        // 3. Verify password
        if (!passwordHasher.Verify(request.Password, user.PasswordHash!))
        {
            user.RecordFailedLogin();
            await userRepository.UpdateAsync(user, cancellationToken);
            throw new AuthenticationException("Invalid email or password.");
        }

        // 4. Record successful login
        user.RecordSuccessfulLogin();

        // 5. Get permissions for the user
        var permissions = await permissionService
            .GetUserPermissionsAsync(user.Id, cancellationToken);
        var roles = await permissionService
            .GetUserRolesAsync(user.Id, cancellationToken);

        // 6. Generate tokens
        var accessToken = jwtTokenService.GenerateAccessToken(
            user, permissions);
        var refreshTokenRaw = jwtTokenService.GenerateRefreshToken();

        // 7. Store refresh token (revokes previous token for same device)
        await jwtTokenService.StoreRefreshTokenAsync(
            user.Id, refreshTokenRaw, request.DeviceInfo, cancellationToken);

        await userRepository.UpdateAsync(user, cancellationToken);

        logger.LogInformation(
            "User {UserId} logged in successfully", user.Id);

        return new LoginResponse(
            UserId: user.Id,
            Email: user.Email,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Roles: roles,
            Permissions: permissions,
            AccessToken: accessToken,    // Controller decides if sent in body or cookie
            RefreshToken: refreshTokenRaw);
    }
}
```

```csharp
// LoginCommandValidator.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.Login;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/Logout/`

```csharp
// LogoutCommand.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.Logout;

/// <summary>
/// Revokes the current refresh token, effectively logging the user out.
/// </summary>
public sealed record LogoutCommand(string? RefreshToken) : IRequest<Unit>;
```

```csharp
// LogoutCommandHandler.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.Logout;

public sealed class LogoutCommandHandler(
    IJwtTokenService jwtTokenService,
    ICurrentUserService currentUser,
    ILogger<LogoutCommandHandler> logger)
    : IRequestHandler<LogoutCommand, Unit>
{
    public async Task<Unit> Handle(
        LogoutCommand request,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(request.RefreshToken))
        {
            await jwtTokenService.RevokeRefreshTokenAsync(
                request.RefreshToken, cancellationToken);
        }

        logger.LogInformation(
            "User {UserId} logged out", currentUser.UserId);

        return Unit.Value;
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/RefreshToken/`

```csharp
// RefreshTokenCommand.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.RefreshToken;

/// <summary>
/// Exchanges a valid refresh token for a new access + refresh token pair.
/// Implements token rotation: the old refresh token is revoked.
/// </summary>
public sealed record RefreshTokenCommand(
    string RefreshToken,
    string? DeviceInfo) : IRequest<RefreshTokenResponse>;

public sealed record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken);
```

```csharp
// RefreshTokenCommandHandler.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.RefreshToken;

public sealed class RefreshTokenCommandHandler(
    IJwtTokenService jwtTokenService,
    IUserRepository userRepository,
    IPermissionService permissionService,
    ILogger<RefreshTokenCommandHandler> logger)
    : IRequestHandler<RefreshTokenCommand, RefreshTokenResponse>
{
    public async Task<RefreshTokenResponse> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Validate and find the refresh token
        var storedToken = await jwtTokenService.ValidateRefreshTokenAsync(
            request.RefreshToken, cancellationToken);

        if (storedToken is null)
            throw new AuthenticationException("Invalid or expired refresh token.");

        // 2. Load user
        var user = await userRepository.GetByIdAsync(
            storedToken.UserId, cancellationToken)
            ?? throw new AuthenticationException("User not found.");

        if (!user.IsActive || user.DeletedAt is not null)
            throw new AuthenticationException("User account is inactive.");

        // 3. Revoke old refresh token (rotation)
        storedToken.Revoke();

        // 4. Get current permissions
        var permissions = await permissionService
            .GetUserPermissionsAsync(user.Id, cancellationToken);

        // 5. Generate new token pair
        var newAccessToken = jwtTokenService.GenerateAccessToken(
            user, permissions);
        var newRefreshTokenRaw = jwtTokenService.GenerateRefreshToken();

        // 6. Store new refresh token
        await jwtTokenService.StoreRefreshTokenAsync(
            user.Id, newRefreshTokenRaw, request.DeviceInfo, cancellationToken);

        logger.LogInformation(
            "Tokens refreshed for user {UserId}", user.Id);

        return new RefreshTokenResponse(newAccessToken, newRefreshTokenRaw);
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/ForgotPassword/`

```csharp
// ForgotPasswordCommand.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.ForgotPassword;

/// <summary>
/// Sends a password reset email. Always returns success (no user enumeration).
/// </summary>
public sealed record ForgotPasswordCommand(string Email) : IRequest<Unit>;
```

```csharp
// ForgotPasswordCommandHandler.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.ForgotPassword;

public sealed class ForgotPasswordCommandHandler(
    IUserRepository userRepository,
    IPasswordResetTokenRepository tokenRepository,
    IEmailService emailService,
    ILogger<ForgotPasswordCommandHandler> logger)
    : IRequestHandler<ForgotPasswordCommand, Unit>
{
    public async Task<Unit> Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(
            request.Email, cancellationToken);

        // Always return success to prevent user enumeration
        if (user is null || !user.IsActive)
            return Unit.Value;

        // Generate raw token and hash for storage
        var rawToken = Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(32));
        var tokenHash = HashToken(rawToken);

        // Invalidate any previous reset tokens for this user
        await tokenRepository.InvalidateAllForUserAsync(
            user.Id,
            PasswordResetToken.Purposes.PasswordReset,
            cancellationToken);

        // Create and store new token (1-hour expiry)
        var resetToken = PasswordResetToken.Create(
            user.Id,
            tokenHash,
            PasswordResetToken.Purposes.PasswordReset,
            TimeSpan.FromHours(1));

        await tokenRepository.AddAsync(resetToken, cancellationToken);

        // Send email with reset link
        await emailService.SendPasswordResetEmailAsync(
            user.Email,
            user.FullName,
            rawToken,
            cancellationToken);

        logger.LogInformation(
            "Password reset email sent for user {UserId}", user.Id);

        return Unit.Value;
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexStringLower(bytes);
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/ResetPassword/`

```csharp
// ResetPasswordCommand.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.ResetPassword;

/// <summary>
/// Resets the user's password using a valid reset token.
/// </summary>
public sealed record ResetPasswordCommand(
    string Token,
    string NewPassword,
    string ConfirmPassword) : IRequest<Unit>;
```

```csharp
// ResetPasswordCommandHandler.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.ResetPassword;

public sealed class ResetPasswordCommandHandler(
    IPasswordResetTokenRepository tokenRepository,
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    ILogger<ResetPasswordCommandHandler> logger)
    : IRequestHandler<ResetPasswordCommand, Unit>
{
    public async Task<Unit> Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Hash the incoming token and look it up
        var tokenHash = HashToken(request.Token);
        var storedToken = await tokenRepository.GetByHashAsync(
            tokenHash,
            PasswordResetToken.Purposes.PasswordReset,
            cancellationToken);

        if (storedToken is null || !storedToken.IsValid)
            throw new ValidationException("Invalid or expired reset token.");

        // 2. Load the user
        var user = await userRepository.GetByIdAsync(
            storedToken.UserId, cancellationToken)
            ?? throw new ValidationException("User not found.");

        // 3. Hash and set new password
        var newHash = passwordHasher.Hash(request.NewPassword);
        user.ChangePasswordHash(newHash);

        // 4. Mark token as used
        storedToken.MarkUsed();

        // 5. Revoke all refresh tokens (force re-login on all devices)
        await jwtTokenService.RevokeAllUserTokensAsync(
            user.Id, cancellationToken);

        await userRepository.UpdateAsync(user, cancellationToken);
        await tokenRepository.UpdateAsync(storedToken, cancellationToken);

        logger.LogInformation(
            "Password reset completed for user {UserId}", user.Id);

        return Unit.Value;
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexStringLower(bytes);
    }
}
```

```csharp
// ResetPasswordCommandValidator.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.ResetPassword;

public sealed class ResetPasswordCommandValidator
    : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Reset token is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain a lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain a special character.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/SetupPassword/`

```csharp
// SetupPasswordCommand.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.SetupPassword;

/// <summary>
/// Sets the password for a newly invited user using the setup token from their invitation email.
/// </summary>
public sealed record SetupPasswordCommand(
    string Token,
    string Password,
    string ConfirmPassword) : IRequest<Unit>;
```

```csharp
// SetupPasswordCommandHandler.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.SetupPassword;

public sealed class SetupPasswordCommandHandler(
    IPasswordResetTokenRepository tokenRepository,
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ILogger<SetupPasswordCommandHandler> logger)
    : IRequestHandler<SetupPasswordCommand, Unit>
{
    public async Task<Unit> Handle(
        SetupPasswordCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Hash the incoming token and look it up
        var tokenHash = HashToken(request.Token);
        var storedToken = await tokenRepository.GetByHashAsync(
            tokenHash,
            PasswordResetToken.Purposes.PasswordSetup,
            cancellationToken);

        if (storedToken is null || !storedToken.IsValid)
            throw new ValidationException(
                "Invalid or expired setup token. Ask your admin to resend the invitation.");

        // 2. Load the user
        var user = await userRepository.GetByIdAsync(
            storedToken.UserId, cancellationToken)
            ?? throw new ValidationException("User not found.");

        if (user.EmailConfirmed)
            throw new ValidationException(
                "Password has already been set up. Use 'Forgot Password' if you need to reset it.");

        // 3. Hash and set password
        var hash = passwordHasher.Hash(request.Password);
        user.SetPasswordHash(hash);

        // 4. Mark token as used
        storedToken.MarkUsed();

        await userRepository.UpdateAsync(user, cancellationToken);
        await tokenRepository.UpdateAsync(storedToken, cancellationToken);

        logger.LogInformation(
            "Password setup completed for user {UserId}", user.Id);

        return Unit.Value;
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexStringLower(bytes);
    }
}
```

```csharp
// SetupPasswordCommandValidator.cs
namespace NGO.PMS.Identity.Application.Auth.Commands.SetupPassword;

public sealed class SetupPasswordCommandValidator
    : AbstractValidator<SetupPasswordCommand>
{
    public SetupPasswordCommandValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Setup token is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain a lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain a special character.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}
```

### 3.3 Infrastructure Layer -- Services

#### `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/JwtTokenService.cs`

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace NGO.PMS.Identity.Infrastructure.Services;

/// <summary>
/// Generates, validates, and manages JWT access tokens and refresh tokens.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generates a signed JWT access token containing the user's claims.
    /// </summary>
    string GenerateAccessToken(User user, string[] permissions);

    /// <summary>
    /// Generates a cryptographically random refresh token (Base64URL, 256-bit).
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Validates a raw refresh token against stored hashes.
    /// Returns the stored token entity if valid, null otherwise.
    /// </summary>
    Task<RefreshToken?> ValidateRefreshTokenAsync(
        string rawToken,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Hashes and stores a new refresh token, revoking any previous
    /// active token for the same user + device.
    /// </summary>
    Task StoreRefreshTokenAsync(
        Guid userId,
        string rawToken,
        string? deviceInfo,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Revokes a specific refresh token.
    /// </summary>
    Task RevokeRefreshTokenAsync(
        string rawToken,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Revokes all refresh tokens for a user (e.g., on password change).
    /// </summary>
    Task RevokeAllUserTokensAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}

public sealed class JwtTokenService(
    IOptions<JwtSettings> jwtSettings,
    IRefreshTokenRepository refreshTokenRepository,
    ILogger<JwtTokenService> logger)
    : IJwtTokenService
{
    private readonly JwtSettings _settings = jwtSettings.Value;

    public string GenerateAccessToken(User user, string[] permissions)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("tenant_id", user.OrganizationId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Add permissions (or hash if too many)
        if (permissions.Length <= 20)
        {
            foreach (var permission in permissions)
                claims.Add(new Claim("permissions", permission));
        }
        else
        {
            var sorted = string.Join(",", permissions.OrderBy(p => p));
            var hash = Convert.ToHexStringLower(
                SHA256.HashData(Encoding.UTF8.GetBytes(sorted)));
            claims.Add(new Claim("perm_hash", hash));
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_settings.Secret));
        var credentials = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_settings.AccessTokenExpiryHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32); // 256-bit
        return Convert.ToBase64String(bytes);
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(
        string rawToken,
        CancellationToken cancellationToken)
    {
        var hash = HashToken(rawToken);
        var storedToken = await refreshTokenRepository
            .GetByHashAsync(hash, cancellationToken);

        if (storedToken is null || !storedToken.IsActive)
        {
            // If token exists but is revoked, this may be a reuse attack.
            // Revoke all tokens for the user as a precaution.
            if (storedToken is { IsRevoked: true })
            {
                logger.LogWarning(
                    "Refresh token reuse detected for user {UserId}. " +
                    "Revoking all tokens.",
                    storedToken.UserId);

                await RevokeAllUserTokensAsync(
                    storedToken.UserId, cancellationToken);
            }

            return null;
        }

        return storedToken;
    }

    public async Task StoreRefreshTokenAsync(
        Guid userId,
        string rawToken,
        string? deviceInfo,
        CancellationToken cancellationToken)
    {
        // Revoke existing active token for same user + device
        await refreshTokenRepository
            .RevokeActiveForDeviceAsync(userId, deviceInfo, cancellationToken);

        var hash = HashToken(rawToken);
        var token = RefreshToken.Create(
            userId,
            hash,
            deviceInfo,
            TimeSpan.FromDays(_settings.RefreshTokenExpiryDays));

        await refreshTokenRepository.AddAsync(token, cancellationToken);
    }

    public async Task RevokeRefreshTokenAsync(
        string rawToken,
        CancellationToken cancellationToken)
    {
        var hash = HashToken(rawToken);
        var storedToken = await refreshTokenRepository
            .GetByHashAsync(hash, cancellationToken);

        if (storedToken is not null && storedToken.IsActive)
        {
            storedToken.Revoke();
            await refreshTokenRepository.UpdateAsync(
                storedToken, cancellationToken);
        }
    }

    public async Task RevokeAllUserTokensAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        await refreshTokenRepository
            .RevokeAllForUserAsync(userId, cancellationToken);
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexStringLower(bytes);
    }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/JwtSettings.cs`

```csharp
namespace NGO.PMS.Identity.Infrastructure.Services;

/// <summary>
/// JWT configuration bound from appsettings.json section "Jwt".
/// </summary>
public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Secret { get; init; } = default!;         // Min 256-bit key
    public string Issuer { get; init; } = "ethelpms";
    public string Audience { get; init; } = "ethelpms-api";
    public int AccessTokenExpiryHours { get; init; } = 6;
    public int RefreshTokenExpiryDays { get; init; } = 7;
}
```

**`appsettings.json` section (secrets via `dotnet user-secrets`):**

```json
{
  "Jwt": {
    "Secret": "STORED-IN-USER-SECRETS-NOT-IN-APPSETTINGS",
    "Issuer": "ethelpms",
    "Audience": "ethelpms-api",
    "AccessTokenExpiryHours": 6,
    "RefreshTokenExpiryDays": 7
  }
}
```

#### `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/CurrentUserService.cs`

```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace NGO.PMS.Identity.Infrastructure.Services;

/// <summary>
/// Extracts current user context from the JWT claims in the HTTP request.
/// Implements ICurrentUserService from SharedKernel.
/// Registered as Scoped in DI.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    Guid? OrganizationId { get; }
    string[] Roles { get; }
    string[] Permissions { get; }
    bool IsAuthenticated { get; }
}

public sealed class CurrentUserService(
    IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var sub = User?.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User?.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public string? Email =>
        User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue("email");

    public Guid? OrganizationId
    {
        get
        {
            var tenantId = User?.FindFirstValue("tenant_id");
            return Guid.TryParse(tenantId, out var id) ? id : null;
        }
    }

    public string[] Roles =>
        User?.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray() ?? [];

    public string[] Permissions =>
        User?.FindAll("permissions")
            .Select(c => c.Value)
            .ToArray() ?? [];

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated ?? false;
}
```

### 3.4 API Layer -- Auth Controller

#### `src/Modules/Identity/NGO.PMS.Identity.API/Controllers/AuthController.cs`

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NGO.PMS.Identity.API.Controllers;

/// <summary>
/// Authentication endpoints: login, logout, refresh, password management.
/// </summary>
[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Authenticates user with email + password.
    /// Web clients receive tokens in HttpOnly cookies.
    /// Mobile clients (X-Client-Type: mobile) receive tokens in the response body.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var deviceInfo = Request.Headers.UserAgent.ToString();
        var command = new LoginCommand(
            request.Email, request.Password, deviceInfo);

        var result = await mediator.Send(command, cancellationToken);

        if (IsMobileClient())
        {
            // Mobile: return tokens in body
            return Ok(ApiResponse.Success(result));
        }

        // Web: set tokens as HttpOnly cookies, return user info only
        SetAccessTokenCookie(result.AccessToken!);
        SetRefreshTokenCookie(result.RefreshToken!);
        SetXsrfTokenCookie();

        return Ok(ApiResponse.Success(new
        {
            result.UserId,
            result.Email,
            result.FirstName,
            result.LastName,
            result.Roles,
            result.Permissions
        }));
    }

    /// <summary>
    /// Logs out the current user by revoking their refresh token.
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        string? refreshToken = IsMobileClient()
            ? Request.Headers["X-Refresh-Token"].FirstOrDefault()
            : Request.Cookies["__Host-refresh-token"];

        await mediator.Send(
            new LogoutCommand(refreshToken), cancellationToken);

        if (!IsMobileClient())
        {
            // Clear cookies
            Response.Cookies.Delete("__Host-access-token", CookiePathApi());
            Response.Cookies.Delete("__Host-refresh-token", CookiePathRefresh());
            Response.Cookies.Delete("XSRF-TOKEN");
        }

        return Ok(ApiResponse.Success("Logged out successfully."));
    }

    /// <summary>
    /// Exchanges a valid refresh token for new access + refresh tokens.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        string? refreshToken = IsMobileClient()
            ? Request.Headers["X-Refresh-Token"].FirstOrDefault()
            : Request.Cookies["__Host-refresh-token"];

        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(ApiResponse.Fail("No refresh token provided."));

        var deviceInfo = Request.Headers.UserAgent.ToString();
        var result = await mediator.Send(
            new RefreshTokenCommand(refreshToken, deviceInfo),
            cancellationToken);

        if (IsMobileClient())
        {
            return Ok(ApiResponse.Success(result));
        }

        SetAccessTokenCookie(result.AccessToken);
        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(ApiResponse.Success("Tokens refreshed."));
    }

    /// <summary>
    /// Sends a password reset email (always returns 200 to prevent user enumeration).
    /// </summary>
    [AllowAnonymous]
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(
            new ForgotPasswordCommand(request.Email), cancellationToken);

        return Ok(ApiResponse.Success(
            "If the email exists, a reset link has been sent."));
    }

    /// <summary>
    /// Resets the user's password using a valid reset token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new ResetPasswordCommand(
            request.Token,
            request.NewPassword,
            request.ConfirmPassword), cancellationToken);

        return Ok(ApiResponse.Success("Password has been reset. Please login."));
    }

    /// <summary>
    /// Sets the initial password for a newly invited user.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("setup-password")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<IActionResult> SetupPassword(
        [FromBody] SetupPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new SetupPasswordCommand(
            request.Token,
            request.Password,
            request.ConfirmPassword), cancellationToken);

        return Ok(ApiResponse.Success(
            "Password set successfully. You can now login."));
    }

    // ── Helpers ──────────────────────────────────────────────

    private bool IsMobileClient() =>
        Request.Headers["X-Client-Type"].FirstOrDefault()
            ?.Equals("mobile", StringComparison.OrdinalIgnoreCase) == true;

    private void SetAccessTokenCookie(string token)
    {
        Response.Cookies.Append("__Host-access-token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api",
            MaxAge = TimeSpan.FromHours(6),
            IsEssential = true
        });
    }

    private void SetRefreshTokenCookie(string token)
    {
        Response.Cookies.Append("__Host-refresh-token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth/refresh",
            MaxAge = TimeSpan.FromDays(7),
            IsEssential = true
        });
    }

    private void SetXsrfTokenCookie()
    {
        var xsrfToken = Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(32));
        Response.Cookies.Append("XSRF-TOKEN", xsrfToken, new CookieOptions
        {
            HttpOnly = false,    // Must be readable by JavaScript
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            MaxAge = TimeSpan.FromHours(6)
        });
    }

    private static CookieOptions CookiePathApi() => new() { Path = "/api" };
    private static CookieOptions CookiePathRefresh() =>
        new() { Path = "/api/v1/auth/refresh" };
}
```

#### API Request DTOs

```csharp
// src/Modules/Identity/NGO.PMS.Identity.Application/Auth/DTOs/

public sealed record LoginRequest(string Email, string Password);
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(
    string Token, string NewPassword, string ConfirmPassword);
public sealed record SetupPasswordRequest(
    string Token, string Password, string ConfirmPassword);
```

### 3.5 Host API Registration

Add to `src/Host/NGO.PMS.API/Program.cs`:

```csharp
// ── Authentication (JWT Bearer from cookie or header) ────
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName).Get<JwtSettings>()!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30) // Minimal clock skew
    };

    // Read JWT from cookie for web clients, header for mobile
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Check cookie first (web clients)
            var accessToken = context.Request.Cookies["__Host-access-token"];
            if (!string.IsNullOrEmpty(accessToken))
            {
                context.Token = accessToken;
            }
            // Otherwise fall through to default Authorization header check
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ── Identity Module Services ─────────────────────────────
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddHttpContextAccessor();

// ── Anti-Forgery (XSRF for cookie auth) ─────────────────
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = "XSRF-VALIDATION";
    options.Cookie.HttpOnly = true;
    options.Cookie.Secure = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
});
```

---

## 4. Frontend Implementation

### 4.1 Auth Service

#### `client/libs/shared/core/src/lib/services/auth.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth.actions';
import { ApiResponse } from '../models/api-response.model';
import { UserProfile, LoginRequest } from '../models/auth.model';

/**
 * Handles all authentication HTTP calls.
 * Web clients use HttpOnly cookies (set automatically by the server).
 * No tokens are stored in localStorage or sessionStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly baseUrl = '/api/v1/auth';

  /**
   * Authenticates with email + password.
   * Server sets HttpOnly cookies. Response body contains user info only.
   */
  login(email: string, password: string): Observable<ApiResponse<UserProfile>> {
    return this.http.post<ApiResponse<UserProfile>>(
      `${this.baseUrl}/login`,
      { email, password } satisfies LoginRequest,
      { withCredentials: true }
    );
  }

  /**
   * Revokes the refresh token and clears cookies server-side.
   */
  logout(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.store.dispatch(AuthActions.logoutSuccess());
        this.router.navigate(['/auth/login']);
      })
    );
  }

  /**
   * Requests new tokens using the refresh token cookie.
   * Called automatically by the auth interceptor on 401.
   */
  refreshToken(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/refresh`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Sends a password reset email.
   */
  forgotPassword(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/forgot-password`,
      { email }
    );
  }

  /**
   * Resets password using the token from the reset email.
   */
  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/reset-password`,
      { token, newPassword, confirmPassword }
    );
  }

  /**
   * Sets the initial password for a newly invited user.
   */
  setupPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/setup-password`,
      { token, password, confirmPassword }
    );
  }
}
```

### 4.2 Auth Models

#### `client/libs/shared/core/src/lib/models/auth.model.ts`

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};
```

### 4.3 NgRx Auth Store

#### `client/libs/shared/core/src/lib/store/auth.actions.ts`

```typescript
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserProfile } from '../models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ user: UserProfile }>(),
    'Login Failure': props<{ error: string }>(),

    'Logout': emptyProps(),
    'Logout Success': emptyProps(),

    'Refresh Token': emptyProps(),
    'Refresh Token Success': emptyProps(),
    'Refresh Token Failure': props<{ error: string }>(),

    'Session Expired': emptyProps(),

    'Load User From Storage': emptyProps(),
    'Set User': props<{ user: UserProfile }>(),
    'Clear User': emptyProps(),
  },
});
```

#### `client/libs/shared/core/src/lib/store/auth.reducer.ts`

```typescript
import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from '../models/auth.model';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state): AuthState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user }): AuthState => ({
    ...state,
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }): AuthState => ({
    ...state,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error,
  })),

  on(AuthActions.logoutSuccess, (): AuthState => ({
    ...initialAuthState,
  })),

  on(AuthActions.sessionExpired, (): AuthState => ({
    ...initialAuthState,
    error: 'Session expired. Please login again.',
  })),

  on(AuthActions.setUser, (state, { user }): AuthState => ({
    ...state,
    user,
    isAuthenticated: true,
    isLoading: false,
  })),

  on(AuthActions.clearUser, (): AuthState => ({
    ...initialAuthState,
  })),
);
```

#### `client/libs/shared/core/src/lib/store/auth.selectors.ts`

```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../models/auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectIsAuthLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectPermissions = createSelector(
  selectCurrentUser,
  (user) => user?.permissions ?? []
);

export const selectUserRoles = createSelector(
  selectCurrentUser,
  (user) => user?.roles ?? []
);

export const selectHasPermission = (permission: string) =>
  createSelector(
    selectPermissions,
    (permissions) => permissions.includes(permission)
  );
```

#### `client/libs/shared/core/src/lib/store/auth.effects.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) =>
            AuthActions.loginSuccess({ user: response.data })
          ),
          catchError((error) =>
            of(AuthActions.loginFailure({
              error: error?.error?.errors?.[0] ?? 'Login failed',
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          // Store user info (NOT tokens) in sessionStorage for page refreshes
          sessionStorage.setItem('ethelpms_user', JSON.stringify(user));
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          sessionStorage.removeItem('ethelpms_user');
        })
      ),
    { dispatch: false }
  );

  sessionExpired$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.sessionExpired),
        tap(() => {
          sessionStorage.removeItem('ethelpms_user');
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  loadUserFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromStorage),
      map(() => {
        const stored = sessionStorage.getItem('ethelpms_user');
        if (stored) {
          return AuthActions.setUser({ user: JSON.parse(stored) });
        }
        return AuthActions.clearUser();
      })
    )
  );
}
```

### 4.4 Auth Interceptor

#### `client/libs/shared/core/src/lib/interceptors/auth.interceptor.ts`

```typescript
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthService } from '../services/auth.service';
import { AuthActions } from '../store/auth.actions';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Functional HTTP interceptor for authentication.
 *
 * Responsibilities:
 * 1. Ensures withCredentials is set (so browser sends HttpOnly cookies)
 * 2. Reads the XSRF-TOKEN cookie and attaches it as X-XSRF-TOKEN header
 * 3. On 401: attempts a single token refresh, then retries the original request
 * 4. On second 401: dispatches sessionExpired and redirects to login
 */
let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const store = inject(Store);

  // Skip auth logic for auth endpoints (except logout)
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password') ||
    req.url.includes('/auth/setup-password');

  // Always send cookies with API requests
  let authReq = req.clone({ withCredentials: true });

  // Attach XSRF token for mutating requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      authReq = authReq.clone({
        setHeaders: { 'X-XSRF-TOKEN': xsrfToken },
      });
    }
  }

  if (isAuthEndpoint) {
    return next(authReq);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            // Retry the original request (cookies are updated by the server)
            return next(authReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            store.dispatch(AuthActions.sessionExpired());
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp('(^| )' + name + '=([^;]+)')
  );
  return match ? decodeURIComponent(match[2]) : null;
}
```

### 4.5 Auth Guard

#### `client/libs/shared/core/src/lib/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../store/auth.selectors';

/**
 * Functional route guard. Redirects to /auth/login if not authenticated.
 * Checks NgRx auth state, not cookies (cookies are HttpOnly and unreadable).
 */
export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }

      // Check sessionStorage for page refresh scenario
      const stored = sessionStorage.getItem('ethelpms_user');
      if (stored) {
        return true; // The app initializer will restore the user
      }

      return router.createUrlTree(['/auth/login']);
    })
  );
};
```

#### `client/libs/shared/core/src/lib/guards/permission.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectPermissions } from '../store/auth.selectors';

/**
 * Functional route guard that checks if the user has the required permission.
 * Usage in routes:
 *   { path: 'create', canActivate: [permissionGuard], data: { permission: 'projects.create' } }
 */
export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const store = inject(Store);
  const router = inject(Router);
  const requiredPermission = route.data['permission'] as string;

  if (!requiredPermission) {
    console.error('permissionGuard: No permission specified in route data.');
    return router.createUrlTree(['/unauthorized']);
  }

  return store.select(selectPermissions).pipe(
    take(1),
    map((permissions) => {
      if (permissions.includes(requiredPermission)) {
        return true;
      }
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
```

### 4.6 App Initialization

#### Register in `client/apps/web/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authInterceptor } from '@ethelpms/shared/core';
import { authReducer } from '@ethelpms/shared/core';
import { AuthEffects } from '@ethelpms/shared/core';
import { AuthActions } from '@ethelpms/shared/core';
import { Store } from '@ngrx/store';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    // Restore user from sessionStorage on page refresh
    provideAppInitializer(() => {
      const store = inject(Store);
      store.dispatch(AuthActions.loadUserFromStorage());
    }),
  ],
};
```

---

## 5. Auth Flow Diagrams

### 5.1 Login Flow (Web Client)

```
Browser                          Angular App                       ASP.NET Core API                Database
  |                                   |                                   |                          |
  |  1. User enters email + password  |                                   |                          |
  |---------------------------------->|                                   |                          |
  |                                   |  2. POST /api/v1/auth/login       |                          |
  |                                   |   { email, password }             |                          |
  |                                   |   withCredentials: true           |                          |
  |                                   |---------------------------------->|                          |
  |                                   |                                   |  3. SELECT user by email  |
  |                                   |                                   |------------------------->|
  |                                   |                                   |  4. User record           |
  |                                   |                                   |<-------------------------|
  |                                   |                                   |                          |
  |                                   |                                   |  5. Check lockout         |
  |                                   |                                   |  6. Verify password hash  |
  |                                   |                                   |  7. Load permissions      |
  |                                   |                                   |  8. Generate JWT access   |
  |                                   |                                   |     token (6h)            |
  |                                   |                                   |  9. Generate refresh      |
  |                                   |                                   |     token (7d)            |
  |                                   |                                   | 10. SHA256 hash refresh   |
  |                                   |                                   |     token, store in DB    |
  |                                   |                                   |------------------------->|
  |                                   |                                   |                          |
  |                                   |  11. Set-Cookie: __Host-access-token (HttpOnly, Secure)      |
  |                                   |      Set-Cookie: __Host-refresh-token (HttpOnly, Secure)     |
  |                                   |      Set-Cookie: XSRF-TOKEN (readable by JS)                |
  |                                   |      Body: { user info, roles, permissions }                 |
  |                                   |<----------------------------------------------------------------|
  |                                   |                                   |                          |
  |                                   | 12. Dispatch loginSuccess(user)   |                          |
  |                                   | 13. Store user info in            |                          |
  |                                   |     sessionStorage                |                          |
  |                                   | 14. Navigate to /dashboard       |                          |
  |  15. Dashboard loads              |                                   |                          |
  |<----------------------------------|                                   |                          |
```

### 5.2 Token Refresh Flow

```
Browser                          Angular App                       ASP.NET Core API                Database
  |                                   |                                   |                          |
  |  1. API call returns 401          |                                   |                          |
  |<----------------------------------|                                   |                          |
  |                                   |                                   |                          |
  |                                   |  2. authInterceptor catches 401   |                          |
  |                                   |  3. POST /api/v1/auth/refresh     |                          |
  |                                   |     Cookie: __Host-refresh-token  |                          |
  |                                   |---------------------------------->|                          |
  |                                   |                                   |  4. SHA256 hash token     |
  |                                   |                                   |  5. Lookup by hash        |
  |                                   |                                   |------------------------->|
  |                                   |                                   |  6. Verify: active,       |
  |                                   |                                   |     not expired,          |
  |                                   |                                   |     not revoked           |
  |                                   |                                   |                          |
  |                                   |                                   |  7. Revoke old refresh    |
  |                                   |                                   |     token (rotation)      |
  |                                   |                                   |------------------------->|
  |                                   |                                   |  8. Generate new          |
  |                                   |                                   |     access + refresh      |
  |                                   |                                   |  9. Store new refresh     |
  |                                   |                                   |     token hash            |
  |                                   |                                   |------------------------->|
  |                                   |                                   |                          |
  |                                   |  10. Set-Cookie: new access token |                          |
  |                                   |      Set-Cookie: new refresh token|                          |
  |                                   |<----------------------------------------------------------------|
  |                                   |                                   |                          |
  |                                   | 11. Retry original request        |                          |
  |                                   |     (cookies updated automatically)|                         |
  |                                   |---------------------------------->|                          |
  |                                   |                                   |                          |
  |  12. Original response            |                                   |                          |
  |<----------------------------------|                                   |                          |
  |                                   |                                   |                          |
  --- If refresh also fails (401): ---|                                   |                          |
  |                                   | 13. Dispatch sessionExpired       |                          |
  |                                   | 14. Clear sessionStorage          |                          |
  |                                   | 15. Navigate to /auth/login       |                          |
  |  16. Login page with message      |                                   |                          |
  |<----------------------------------|                                   |                          |
```

### 5.3 Password Setup Flow (New User Invitation)

```
Admin                            ASP.NET Core API                Database              Email Service
  |                                   |                            |                        |
  |  1. POST /api/v1/users            |                            |                        |
  |   { email, firstName, lastName }  |                            |                        |
  |---------------------------------->|                            |                        |
  |                                   |  2. Create User record     |                        |
  |                                   |     (password_hash = NULL) |                        |
  |                                   |--------------------------->|                        |
  |                                   |  3. Generate setup token   |                        |
  |                                   |     (24h expiry)           |                        |
  |                                   |  4. SHA256 hash, store     |                        |
  |                                   |--------------------------->|                        |
  |                                   |  5. Send invitation email  |                        |
  |                                   |     with setup link:       |                        |
  |                                   |     /auth/setup?token=xxx  |                        |
  |                                   |----------------------------------------------->|
  |  6. 201 Created                   |                            |                        |
  |<----------------------------------|                            |                        |

New User                         Angular App                       ASP.NET Core API                Database
  |                                   |                                   |                          |
  |  7. Clicks link in email          |                                   |                          |
  |   /auth/setup?token=abc123        |                                   |                          |
  |---------------------------------->|                                   |                          |
  |                                   |  8. Shows setup password form     |                          |
  |  9. Enters password + confirm     |                                   |                          |
  |---------------------------------->|                                   |                          |
  |                                   | 10. POST /api/v1/auth/            |                          |
  |                                   |     setup-password                |                          |
  |                                   |   { token, password, confirm }    |                          |
  |                                   |---------------------------------->|                          |
  |                                   |                                   | 11. Hash token, lookup   |
  |                                   |                                   |------------------------->|
  |                                   |                                   | 12. Verify: valid,       |
  |                                   |                                   |     not used, not expired|
  |                                   |                                   | 13. Hash password (PBKDF2)|
  |                                   |                                   | 14. Set password_hash    |
  |                                   |                                   | 15. Set email_confirmed  |
  |                                   |                                   |     = true               |
  |                                   |                                   | 16. Mark token used      |
  |                                   |                                   |------------------------->|
  |                                   | 17. 200 OK                       |                          |
  |                                   |<----------------------------------|                          |
  |                                   | 18. Navigate to /auth/login       |                          |
  | 19. Login page with success msg   |                                   |                          |
  |<----------------------------------|                                   |                          |
```

### 5.4 Password Reset Flow

```
User                             Angular App                       ASP.NET Core API                Database
  |                                   |                                   |                          |
  |  1. Clicks "Forgot Password"      |                                   |                          |
  |---------------------------------->|                                   |                          |
  |  2. Enters email                  |                                   |                          |
  |---------------------------------->|                                   |                          |
  |                                   |  3. POST /api/v1/auth/            |                          |
  |                                   |     forgot-password               |                          |
  |                                   |   { email }                       |                          |
  |                                   |---------------------------------->|                          |
  |                                   |                                   |  4. Lookup user by email  |
  |                                   |                                   |------------------------->|
  |                                   |                                   |  5. If found:            |
  |                                   |                                   |     Generate reset token  |
  |                                   |                                   |     (1h expiry)          |
  |                                   |                                   |     Invalidate previous  |
  |                                   |                                   |     reset tokens         |
  |                                   |                                   |     Store hash in DB     |
  |                                   |                                   |------------------------->|
  |                                   |                                   |     Send reset email     |
  |                                   |                                   |                          |
  |                                   |  6. 200 OK (always, even if       |                          |
  |                                   |     email not found)              |                          |
  |                                   |<----------------------------------|                          |
  |  7. "If the email exists, a       |                                   |                          |
  |     reset link has been sent"     |                                   |                          |
  |<----------------------------------|                                   |                          |
  |                                   |                                   |                          |
  |  8. User opens email, clicks link |                                   |                          |
  |   /auth/reset-password?token=xyz  |                                   |                          |
  |---------------------------------->|                                   |                          |
  |                                   |  9. Shows reset password form     |                          |
  | 10. Enters new password + confirm |                                   |                          |
  |---------------------------------->|                                   |                          |
  |                                   | 11. POST /api/v1/auth/            |                          |
  |                                   |     reset-password                |                          |
  |                                   |   { token, newPassword, confirm } |                          |
  |                                   |---------------------------------->|                          |
  |                                   |                                   | 12. Hash token, lookup   |
  |                                   |                                   |------------------------->|
  |                                   |                                   | 13. Verify: valid,       |
  |                                   |                                   |     not used, not expired|
  |                                   |                                   | 14. Hash new password    |
  |                                   |                                   | 15. Update user          |
  |                                   |                                   | 16. Revoke ALL refresh   |
  |                                   |                                   |     tokens for user      |
  |                                   |                                   | 17. Mark token used      |
  |                                   |                                   |------------------------->|
  |                                   | 18. 200 OK                       |                          |
  |                                   |<----------------------------------|                          |
  |                                   | 19. Navigate to /auth/login       |                          |
  | 20. Login page with success msg   |                                   |                          |
  |<----------------------------------|                                   |                          |
```

---

## 6. Security Considerations

### 6.1 Brute Force Protection

| Mechanism | Configuration | Implementation |
|-----------|--------------|----------------|
| **Account lockout** | 5 failed attempts, 15-minute lockout | `User.RecordFailedLogin()` increments counter, sets `LockoutEnd` |
| **Lockout reset** | On successful login | `User.RecordSuccessfulLogin()` resets counter and lockout |
| **Lockout check** | Before password verification | `LoginCommandHandler` checks `user.IsLockedOut` before `passwordHasher.Verify()` |
| **Domain event** | On lockout trigger | `UserLockedOutEvent` raised (can trigger admin notification) |

### 6.2 Rate Limiting

Applied via ASP.NET Core rate limiting middleware on auth endpoints:

```csharp
// In Host Program.cs
builder.Services.AddRateLimiter(options =>
{
    // Auth endpoints: 10 requests per minute per IP
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 10;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0; // Reject immediately
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// In middleware pipeline (before auth)
app.UseRateLimiter();
```

```csharp
// On AuthController
[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting("auth")]
public sealed class AuthController : ControllerBase
```

### 6.3 Token Security

| Concern | Mitigation |
|---------|-----------|
| **Token theft (XSS)** | Tokens in HttpOnly cookies (inaccessible to JavaScript) |
| **Token theft (CSRF)** | SameSite=Strict cookies + XSRF token validation |
| **Token replay** | Refresh token rotation -- old token invalidated on each refresh |
| **Token reuse detection** | If a revoked token is presented, ALL user tokens are revoked (see `JwtTokenService.ValidateRefreshTokenAsync`) |
| **Token storage at rest** | Refresh tokens stored as SHA256 hashes (raw token never in DB) |
| **Token length** | 256-bit refresh tokens (cryptographically random) |
| **Signing key** | JWT secret stored in `dotnet user-secrets` (dev) / environment variable (prod), never in `appsettings.json` |
| **Algorithm confusion** | `TokenValidationParameters` explicitly sets expected algorithm |

### 6.4 Password Security

| Concern | Mitigation |
|---------|-----------|
| **Hashing** | ASP.NET Core Identity PBKDF2 (default: SHA256, 100K iterations) |
| **Complexity** | Minimum 8 chars, uppercase, lowercase, digit, special character (FluentValidation) |
| **Enumeration** | `forgot-password` always returns 200 regardless of whether email exists |
| **Reset token expiry** | 1 hour for password reset, 24 hours for initial setup |
| **Reset token single-use** | `used_at` column prevents reuse |
| **Password change side effects** | All refresh tokens revoked, security stamp rotated |

### 6.5 Cookie Hardening

| Flag | Value | Purpose |
|------|-------|---------|
| `HttpOnly` | `true` | Prevents JavaScript access (XSS mitigation) |
| `Secure` | `true` | HTTPS only (even in dev, via reverse proxy or localhost exception) |
| `SameSite` | `Strict` | No cross-site cookie transmission (CSRF mitigation) |
| `Path` | `/api` (access) / `/api/v1/auth/refresh` (refresh) | Minimize cookie exposure surface |
| `__Host-` prefix | Required | Enforces Secure + no Domain + Path=/ at browser level |
| `MaxAge` | 6h / 7d | Matches token expiry |

### 6.6 CORS Configuration

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",   // Angular dev
                "https://app.ethelpms.com" // Production
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Required for cookie auth
    });
});
```

### 6.7 Audit Trail

All authentication events are logged to the `audit` schema via Audit.NET:

| Event | Logged Fields |
|-------|--------------|
| Login success | user_id, ip_address, user_agent, timestamp |
| Login failure | email_attempted, ip_address, user_agent, failure_reason, timestamp |
| Logout | user_id, ip_address, timestamp |
| Token refresh | user_id, ip_address, timestamp |
| Password setup | user_id, ip_address, timestamp |
| Password reset | user_id, ip_address, timestamp |
| Account lockout | user_id, ip_address, failed_count, lockout_until, timestamp |

---

## 7. API Endpoint Summary

| Method | Endpoint | Auth | Rate Limit | Request Body | Success Response |
|--------|----------|------|-----------|-------------|-----------------|
| `POST` | `/api/v1/auth/login` | Anonymous | 10/min/IP | `{ email, password }` | `200` + cookies + user info |
| `POST` | `/api/v1/auth/logout` | Bearer | 10/min/IP | (none) | `200` + clear cookies |
| `POST` | `/api/v1/auth/refresh` | Anonymous (cookie) | 10/min/IP | (none, cookie) | `200` + new cookies |
| `POST` | `/api/v1/auth/forgot-password` | Anonymous | 10/min/IP | `{ email }` | `200` (always) |
| `POST` | `/api/v1/auth/reset-password` | Anonymous | 10/min/IP | `{ token, newPassword, confirmPassword }` | `200` |
| `POST` | `/api/v1/auth/setup-password` | Anonymous | 10/min/IP | `{ token, password, confirmPassword }` | `200` |

---

## 8. Configuration Checklist

Before starting implementation, ensure these are in place:

- [ ] `dotnet user-secrets set "Jwt:Secret" "<256-bit-key>"` in Host API project
- [ ] `appsettings.json` has `Jwt` section with Issuer, Audience, expiry values
- [ ] NuGet package `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.12 added to Host
- [ ] `Microsoft.AspNetCore.Identity.EntityFrameworkCore` 10.0.12 in Identity.Infrastructure
- [ ] CORS origins list updated for all environments
- [ ] MailKit configured for email sending (SMTP credentials in user-secrets)
- [ ] `identity` schema created in PostgreSQL via EF Core migration
- [ ] Rate limiter middleware registered before authentication middleware

---

## 9. Testing Requirements

### Unit Tests (in `tests/NGO.PMS.Identity.Tests/`)

| Test | What It Verifies |
|------|-----------------|
| `LoginCommandHandler_ShouldReturnSuccess_WhenValidCredentials` | Happy path login |
| `LoginCommandHandler_ShouldThrowAuthException_WhenInvalidPassword` | Wrong password |
| `LoginCommandHandler_ShouldThrowAuthException_WhenUserLocked` | Lockout enforcement |
| `LoginCommandHandler_ShouldLockAccount_WhenFifthFailedAttempt` | Lockout threshold |
| `RefreshTokenCommandHandler_ShouldRotateTokens_WhenValid` | Token rotation |
| `RefreshTokenCommandHandler_ShouldRevokeAll_WhenReusedToken` | Reuse detection |
| `ForgotPasswordCommandHandler_ShouldReturn_WhenEmailNotFound` | No user enumeration |
| `SetupPasswordCommandHandler_ShouldReject_WhenPasswordAlreadySet` | Double-setup prevention |
| `ResetPasswordCommandHandler_ShouldRevokeAllTokens_WhenSuccess` | Force re-login on reset |
| `JwtTokenService_ShouldGenerateValidJwt_WithCorrectClaims` | Token structure |
| `JwtTokenService_ShouldFallbackToPermHash_WhenOver20Permissions` | Permission hash fallback |
| `User_ShouldRaiseDomainEvent_WhenCreated` | Domain event raised |
| `User_ShouldResetLockout_WhenSuccessfulLogin` | Lockout reset |

### Integration Tests (in `tests/NGO.PMS.API.Tests/`)

| Test | What It Verifies |
|------|-----------------|
| `POST /auth/login` returns 200 + cookies for valid credentials | End-to-end login |
| `POST /auth/login` returns 401 for invalid credentials | Rejection |
| `POST /auth/refresh` returns new cookies when valid refresh cookie present | Token rotation |
| `POST /auth/refresh` returns 401 when expired/revoked refresh token | Expired token rejection |
| `POST /auth/logout` clears cookies | Cookie cleanup |
| `Authenticated endpoint returns 401 without cookie` | Auth enforcement |
| `Rate limiter returns 429 after 10 rapid requests` | Rate limiting |

---

## 10. File Index

All files created or modified by this plan:

### New Files (Backend)

| File | Layer |
|------|-------|
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/User.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/RefreshToken.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/PasswordResetToken.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Events/UserCreatedEvent.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Events/UserPasswordSetEvent.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Events/UserPasswordChangedEvent.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Events/UserLockedOutEvent.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Events/UserDeactivatedEvent.cs` | Domain |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/Login/LoginCommand.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/Login/LoginCommandHandler.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/Login/LoginCommandValidator.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/Logout/LogoutCommand.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/Logout/LogoutCommandHandler.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/RefreshToken/RefreshTokenCommand.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/RefreshToken/RefreshTokenCommandHandler.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/ForgotPassword/ForgotPasswordCommand.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/ForgotPassword/ForgotPasswordCommandHandler.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/ResetPassword/ResetPasswordCommand.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/ResetPassword/ResetPasswordCommandHandler.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/ResetPassword/ResetPasswordCommandValidator.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/SetupPassword/SetupPasswordCommand.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/SetupPassword/SetupPasswordCommandHandler.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/Commands/SetupPassword/SetupPasswordCommandValidator.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/DTOs/LoginRequest.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/DTOs/ForgotPasswordRequest.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/DTOs/ResetPasswordRequest.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Auth/DTOs/SetupPasswordRequest.cs` | Application |
| `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/JwtTokenService.cs` | Infrastructure |
| `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/JwtSettings.cs` | Infrastructure |
| `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/CurrentUserService.cs` | Infrastructure |
| `src/Modules/Identity/NGO.PMS.Identity.API/Controllers/AuthController.cs` | API |

### New Files (Frontend)

| File | Library |
|------|---------|
| `client/libs/shared/core/src/lib/services/auth.service.ts` | shared/core |
| `client/libs/shared/core/src/lib/models/auth.model.ts` | shared/core |
| `client/libs/shared/core/src/lib/store/auth.actions.ts` | shared/core |
| `client/libs/shared/core/src/lib/store/auth.reducer.ts` | shared/core |
| `client/libs/shared/core/src/lib/store/auth.selectors.ts` | shared/core |
| `client/libs/shared/core/src/lib/store/auth.effects.ts` | shared/core |
| `client/libs/shared/core/src/lib/interceptors/auth.interceptor.ts` | shared/core |
| `client/libs/shared/core/src/lib/guards/auth.guard.ts` | shared/core |
| `client/libs/shared/core/src/lib/guards/permission.guard.ts` | shared/core |

### Modified Files

| File | Change |
|------|--------|
| `src/Host/NGO.PMS.API/Program.cs` | Add JWT Bearer auth, anti-forgery, rate limiter, Identity module DI |
| `client/apps/web/src/app/app.config.ts` | Add auth interceptor, NgRx store, effects, app initializer |

---

## 11. Dependencies on Other Plans

| This Plan Needs | From Plan | Status |
|----------------|-----------|--------|
| `AuditableEntity`, `ISoftDeletable`, `IMultiTenant`, `IDomainEvent` base types | `shared/DATABASE-ARCHITECTURE.md` | Not yet created |
| `ICurrentUserService` interface in SharedKernel | This plan defines the implementation; interface goes in SharedKernel | Defined here |
| `ApiResponse<T>` envelope class | `shared/API-CONVENTIONS.md` | Not yet created |
| Finbuckle tenant resolution from JWT `tenant_id` claim | `shared/MULTI-TENANCY.md` | Not yet created |
| Permission seeding and `IPermissionService` | `shared/AUTHORIZATION-RBAC.md` | Not yet created |
| `IEmailService` for password reset/setup emails | Backend implementation (Phase 1) | Not yet created |

---

## 12. SSO Extensibility (Deferred -- REQ-AUTH-012)

The architecture supports future SSO by:

1. `User.PasswordHash` is nullable (external auth users have no local password)
2. ASP.NET Core authentication supports multiple schemes -- an `AddOpenIdConnect()` or `AddGoogle()` scheme can be added alongside `AddJwtBearer()` without changing the existing flow
3. The `LoginCommand` can be extended with a `LoginWithExternalProviderCommand` that accepts an external token and maps to a local user
4. The `ICurrentUserService` reads claims from `ClaimsPrincipal`, which works regardless of how the user was authenticated

This is explicitly deferred to post-MVP (Phase 12+). No code should be written for SSO until the feature is prioritized.
