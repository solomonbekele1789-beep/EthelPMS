# EthelPMS — Identity Module Backend Plan

**Version:** 1.0
**Date:** October 17, 2026
**Owner:** Developer A (Backend lead)
**Phase:** 1 (Weeks 3-4)

> Covers: User management, authentication endpoints, roles/permissions, offices, locations, organizations.
> Prerequisites: Phase 0A/0B infrastructure must be complete.
> Cross-references: `shared/AUTHENTICATION.md`, `shared/AUTHORIZATION-RBAC.md`

---

## 1. Requirements Covered

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-AUTH-001–006 | Login, logout, refresh, password setup/forgot/reset | Must |
| REQ-AUTH-007–009 | Mobile detection, token expiry, refresh cookie | Must |
| REQ-AUTH-010 | Account lockout after failed attempts | Should |
| REQ-AUTH-011 | Branded email templates | Should |
| REQ-RBAC-001–008 | Roles, permissions, role templates, ABAC | Must |
| REQ-ORG-001–010 | Organization profile, settings, branding | Must |
| REQ-GEO-001–005 | Regions, zones, woredas, kebeles reference data | Must |
| REQ-LOC-001–003 | Office locations, cascade selection | Must |

---

## 2. Domain Entities

### 2.1 `User.cs`

**File:** `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/User.cs`

```csharp
namespace NGO.PMS.Identity.Domain.Entities;

public class User : AuditableEntity, IMultiTenant, ISoftDeletable
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool EmailConfirmed { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutEnd { get; private set; }
    public Guid? OfficeId { get; private set; }
    public Guid OrganizationId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }

    // Navigation
    public ICollection<UserRole> UserRoles { get; private set; } = [];
    public Office? Office { get; private set; }

    public string FullName => $"{FirstName} {LastName}";

    public static User Create(string email, string firstName, string lastName, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email required");
        return new User
        {
            Email = email.ToLowerInvariant().Trim(),
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            OrganizationId = orgId
        };
    }

    public void SetPassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        EmailConfirmed = true;
        FailedLoginAttempts = 0;
        LockoutEnd = null;
    }

    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= 5)
            LockoutEnd = DateTime.UtcNow.AddMinutes(15);
    }

    public void RecordSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LockoutEnd = null;
    }

    public bool IsLockedOut => LockoutEnd.HasValue && LockoutEnd > DateTime.UtcNow;

    public void Deactivate() { IsActive = false; AddDomainEvent(new UserDeactivatedEvent(Id)); }
    public void Activate() { IsActive = true; }
    public void UpdateProfile(string firstName, string lastName, string? phone, Guid? officeId)
    {
        FirstName = firstName; LastName = lastName; Phone = phone; OfficeId = officeId;
    }
}
```

### 2.2 Other Entities

| Entity | File | Key Properties |
|--------|------|---------------|
| `Role` | `Domain/Entities/Role.cs` | Name, Description, IsSystemRole, OrganizationId, `ICollection<RolePermission>` |
| `Permission` | `Domain/Entities/Permission.cs` | Code, DisplayName, Module, Resource, Action |
| `RolePermission` | `Domain/Entities/RolePermission.cs` | RoleId, PermissionId (junction) |
| `UserRole` | `Domain/Entities/UserRole.cs` | UserId, RoleId, AssignedAt, AssignedBy |
| `RefreshToken` | `Domain/Entities/RefreshToken.cs` | UserId, TokenHash, DeviceInfo, ExpiresAt, RevokedAt |
| `PasswordResetToken` | `Domain/Entities/PasswordResetToken.cs` | UserId, TokenHash, ExpiresAt, UsedAt |
| `Organization` | `Domain/Entities/Organization.cs` | Name, Slug, LogoUrl, Timezone, CalendarPreference, Settings (jsonb) |
| `Office` | `Domain/Entities/Office.cs` | Name, Code, ParentOfficeId (hierarchy), LocationId, OrganizationId |
| `Location` | `Domain/Entities/Location.cs` | Name, NameAm, Level (Region/Zone/Woreda/Kebele), ParentId, Code |
| `AttributeRule` | `Domain/Entities/AttributeRule.cs` | PermissionId, AttributeName, Operator, AttributeValue, OrganizationId |

### 2.3 Domain Events

```csharp
// Domain/Events/
public record UserCreatedEvent(Guid UserId, string Email) : IDomainEvent;
public record UserDeactivatedEvent(Guid UserId) : IDomainEvent;
public record RoleAssignedEvent(Guid UserId, Guid RoleId) : IDomainEvent;
public record PasswordChangedEvent(Guid UserId) : IDomainEvent;
```

### 2.4 Enums

```csharp
// Domain/Enums/
public enum LocationLevel { Region, Zone, Woreda, Kebele }
public enum CalendarPreference { Gregorian, Ethiopian }
```

---

## 3. Application Layer — Commands

### Auth Commands

| Command | Handler Logic | Validator Rules |
|---------|--------------|-----------------|
| `LoginCommand(Email, Password, DeviceInfo)` | Verify credentials, check lockout, generate tokens, record login | Email required, password required |
| `LogoutCommand` | Revoke current refresh token | — |
| `RefreshTokenCommand(RefreshToken)` | Validate token, rotate, return new pair | Token required |
| `ForgotPasswordCommand(Email)` | Generate reset token, send email | Valid email format |
| `ResetPasswordCommand(Token, NewPassword)` | Validate token, hash password, set on user | Token required, password min 8 chars |
| `SetupPasswordCommand(Token, Password)` | First-time password for invited users | Token required, password min 8 chars |

### User Commands

| Command | Handler Logic | Validator Rules |
|---------|--------------|-----------------|
| `CreateUserCommand(Email, FirstName, LastName, Phone?, OfficeId?, RoleIds[])` | Create user, assign roles, generate setup token, send invitation | Email unique per org, firstName/lastName required |
| `UpdateUserCommand(Id, FirstName, LastName, Phone?, OfficeId?, IsActive)` | Update profile fields | Id required |
| `DeactivateUserCommand(Id)` | Set IsActive=false, revoke tokens, publish event | Cannot deactivate self |
| `ActivateUserCommand(Id)` | Set IsActive=true | — |
| `ChangeUserPasswordCommand(CurrentPassword, NewPassword)` | Verify current, hash new, set | Both required, new min 8 |

### Role Commands

| Command | Handler Logic | Validator Rules |
|---------|--------------|-----------------|
| `CreateRoleCommand(Name, Description?, PermissionIds[])` | Create role with permissions | Name unique per org, ≥1 permission |
| `UpdateRoleCommand(Id, Name, Description?, PermissionIds[])` | Update role, replace permissions | Cannot edit system roles |
| `DeleteRoleCommand(Id)` | Soft-delete, unassign from users | Cannot delete system roles |
| `AssignRoleToUserCommand(UserId, RoleId)` | Add user_roles record | Both exist |
| `RemoveRoleFromUserCommand(UserId, RoleId)` | Remove user_roles record | — |

### Office Commands

| Command | Handler Logic | Validator Rules |
|---------|--------------|-----------------|
| `CreateOfficeCommand(Name, Code, ParentOfficeId?, LocationId?)` | Create office in org hierarchy | Code unique per org |
| `UpdateOfficeCommand(Id, Name, Code, ParentOfficeId?, LocationId?)` | Update office | — |
| `DeleteOfficeCommand(Id)` | Soft-delete, reassign users | Cannot delete if users assigned |

### Organization Commands

| Command | Handler Logic | Validator Rules |
|---------|--------------|-----------------|
| `UpdateOrganizationCommand(Name, LogoUrl?, Timezone?, CalendarPreference?)` | Update org settings | Name required |

---

## 4. Application Layer — Queries

| Query | Returns | Notes |
|-------|---------|-------|
| `GetUserQuery(Id)` | `UserDto` | Includes roles, office |
| `ListUsersQuery(Page, PageSize, Search?, OfficeId?, IsActive?)` | `PagedResponse<UserListItemDto>` | Filterable |
| `GetCurrentUserQuery` | `CurrentUserDto` | From ICurrentUserService |
| `GetRoleQuery(Id)` | `RoleDto` | Includes permissions |
| `ListRolesQuery(Page, PageSize, Search?)` | `PagedResponse<RoleListItemDto>` | — |
| `ListPermissionsQuery(Module?)` | `List<PermissionDto>` | Grouped by module |
| `GetUserPermissionsQuery(UserId)` | `List<string>` | Flat permission codes |
| `GetOfficeQuery(Id)` | `OfficeDto` | Includes location |
| `ListOfficesQuery(Page, PageSize, Search?)` | `PagedResponse<OfficeListItemDto>` | Tree-capable |
| `GetOrganizationQuery` | `OrganizationDto` | Current org |
| `ListLocationsQuery(Level?, ParentId?)` | `List<LocationDto>` | Cascade: regions → zones → woredas → kebeles |

---

## 5. DTOs

```csharp
// Application/Users/DTOs/
public record UserDto(Guid Id, string Email, string FirstName, string LastName,
    string? Phone, bool IsActive, bool EmailConfirmed, Guid? OfficeId,
    string? OfficeName, List<string> Roles, DateTime CreatedAt);

public record UserListItemDto(Guid Id, string Email, string FullName,
    bool IsActive, string? OfficeName, List<string> Roles, DateTime CreatedAt);

public record CurrentUserDto(Guid Id, string Email, string FirstName, string LastName,
    Guid OrganizationId, string OrganizationName, List<string> Permissions,
    List<string> Roles, TenantInfoDto Tenant);

public record CreateUserRequest(string Email, string FirstName, string LastName,
    string? Phone, Guid? OfficeId, List<Guid> RoleIds);

// Application/Roles/DTOs/
public record RoleDto(Guid Id, string Name, string? Description, bool IsSystemRole,
    List<PermissionDto> Permissions, DateTime CreatedAt);

public record RoleListItemDto(Guid Id, string Name, string? Description,
    bool IsSystemRole, int PermissionCount, int UserCount);

public record PermissionDto(Guid Id, string Code, string DisplayName,
    string Module, string Resource, string Action);

// Application/Offices/DTOs/
public record OfficeDto(Guid Id, string Name, string Code, Guid? ParentOfficeId,
    string? ParentOfficeName, Guid? LocationId, string? LocationName);

public record OfficeListItemDto(Guid Id, string Name, string Code,
    string? ParentOfficeName, int UserCount);

// Application/Locations/DTOs/
public record LocationDto(Guid Id, string Name, string? NameAm,
    string Level, Guid? ParentId);

// Application/Organizations/DTOs/
public record OrganizationDto(Guid Id, string Name, string Slug, string? LogoUrl,
    string Timezone, string CalendarPreference, int UserCount, int OfficeCount);
```

---

## 6. Infrastructure — IdentityDbContext

**File:** `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Persistence/IdentityDbContext.cs`

```csharp
namespace NGO.PMS.Identity.Infrastructure.Persistence;

public class IdentityDbContext : MultiTenantDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Office> Offices => Set<Office>();
    public DbSet<AttributeRule> AttributeRules => Set<AttributeRule>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);
    }
}
```

**Note:** `Permission` entity is NOT tenant-filtered (global data). Override in entity config:

```csharp
public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.HasQueryFilter(p => true); // Override tenant filter — permissions are global
        builder.HasIndex(p => p.Code).IsUnique();
    }
}
```

---

## 7. Infrastructure — Services

### JwtTokenService

**File:** `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/JwtTokenService.cs`

See `shared/AUTHENTICATION.md` section 3.3 for full implementation. Key methods:
- `GenerateAccessToken(User user, IReadOnlyList<string> permissions, IReadOnlyList<string> roles)` → JWT string
- `GenerateRefreshToken()` → random 64-byte base64 string
- `ValidateRefreshTokenAsync(string token)` → RefreshToken? entity
- `StoreRefreshTokenAsync(Guid userId, string token, string deviceInfo)` → void
- `RevokeRefreshTokenAsync(string tokenHash)` → void
- `RevokeAllUserTokensAsync(Guid userId)` → void

### PermissionService

**File:** `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/PermissionService.cs`

See `shared/AUTHORIZATION-RBAC.md` section 3.4. Uses Dapper for fast reads.

### CurrentUserService

**File:** `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/CurrentUserService.cs`

```csharp
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor) => _accessor = accessor;

    public Guid UserId => Guid.TryParse(
        _accessor.HttpContext?.User.FindFirstValue("sub"), out var id) ? id : Guid.Empty;

    public Guid OrganizationId => Guid.TryParse(
        _accessor.HttpContext?.User.FindFirstValue("tenant_id"), out var id) ? id : Guid.Empty;

    public string Email =>
        _accessor.HttpContext?.User.FindFirstValue("email") ?? string.Empty;

    public IReadOnlyList<string> Permissions =>
        _accessor.HttpContext?.User.FindAll("permissions").Select(c => c.Value).ToList()
        ?? [];

    public IReadOnlyList<string> Roles =>
        _accessor.HttpContext?.User.FindAll("roles").Select(c => c.Value).ToList()
        ?? [];
}
```

### EmailService

**File:** `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/EmailService.cs`

```csharp
public interface IEmailService
{
    Task SendPasswordSetupEmailAsync(string email, string firstName, string token, CancellationToken ct);
    Task SendPasswordResetEmailAsync(string email, string firstName, string token, CancellationToken ct);
    Task SendWelcomeEmailAsync(string email, string firstName, string organizationName, CancellationToken ct);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    { _config = config; _logger = logger; }

    public async Task SendPasswordSetupEmailAsync(string email, string firstName, string token, CancellationToken ct)
    {
        var baseUrl = _config["App:FrontendUrl"] ?? "http://localhost:4200";
        var link = $"{baseUrl}/auth/setup-password?token={token}";
        var subject = "Welcome to EthelPMS — Set Up Your Password";
        var body = $"""
            <h2>Welcome, {firstName}!</h2>
            <p>You've been invited to EthelPMS. Click below to set your password:</p>
            <a href="{link}" style="padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
                Set Up Password
            </a>
            <p>This link expires in 48 hours.</p>
            """;
        await SendAsync(email, subject, body, ct);
    }

    // SendPasswordResetEmailAsync, SendWelcomeEmailAsync follow same pattern

    private async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct)
    {
        using var smtp = new MailKit.Net.Smtp.SmtpClient();
        await smtp.ConnectAsync(_config["Email:SmtpHost"], int.Parse(_config["Email:SmtpPort"]!),
            MailKit.Security.SecureSocketOptions.StartTls, ct);
        await smtp.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"], ct);

        var message = new MimeKit.MimeMessage();
        message.From.Add(new MimeKit.MailboxAddress("EthelPMS", _config["Email:From"]));
        message.To.Add(MimeKit.MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new MimeKit.TextPart("html") { Text = htmlBody };

        await smtp.SendAsync(message, ct);
        await smtp.DisconnectAsync(true, ct);
        _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
    }
}
```

---

## 8. API Layer — Controllers

### AuthController

**File:** `src/Modules/Identity/NGO.PMS.Identity.API/Controllers/AuthController.cs`

```csharp
[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;
    public AuthController(ISender mediator) => _mediator = mediator;

    [HttpPost("login")]       [AllowAnonymous] → LoginCommand
    [HttpPost("logout")]      [Authorize]      → LogoutCommand
    [HttpPost("refresh")]     [AllowAnonymous] → RefreshTokenCommand
    [HttpPost("forgot-password")] [AllowAnonymous] → ForgotPasswordCommand
    [HttpPost("reset-password")]  [AllowAnonymous] → ResetPasswordCommand
    [HttpPost("setup-password")]  [AllowAnonymous] → SetupPasswordCommand
}
```

### UsersController

**File:** `src/Modules/Identity/NGO.PMS.Identity.API/Controllers/UsersController.cs`

```csharp
[ApiController]
[Route("api/v1/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ISender _mediator;
    public UsersController(ISender mediator) => _mediator = mediator;

    [HttpGet]                [RequirePermission("identity.users.read")]     → ListUsersQuery
    [HttpGet("{id:guid}")]   [RequirePermission("identity.users.read")]     → GetUserQuery
    [HttpGet("me")]          [Authorize]                                     → GetCurrentUserQuery
    [HttpPost]               [RequirePermission("identity.users.create")]   → CreateUserCommand
    [HttpPut("{id:guid}")]   [RequirePermission("identity.users.update")]   → UpdateUserCommand
    [HttpPost("{id:guid}/deactivate")]  [RequirePermission("identity.users.manage")]  → DeactivateUserCommand
    [HttpPost("{id:guid}/activate")]    [RequirePermission("identity.users.manage")]  → ActivateUserCommand
    [HttpPost("{id:guid}/roles")]       [RequirePermission("identity.users.manage")]  → AssignRoleToUserCommand
    [HttpDelete("{id:guid}/roles/{roleId:guid}")] [RequirePermission("identity.users.manage")] → RemoveRoleFromUserCommand
    [HttpPost("me/change-password")]  [Authorize]                                     → ChangeUserPasswordCommand
}
```

### RolesController

```csharp
[Route("api/v1/roles")]
[HttpGet]                [RequirePermission("identity.roles.read")]     → ListRolesQuery
[HttpGet("{id:guid}")]   [RequirePermission("identity.roles.read")]     → GetRoleQuery
[HttpGet("permissions")] [RequirePermission("identity.roles.read")]     → ListPermissionsQuery
[HttpPost]               [RequirePermission("identity.roles.create")]   → CreateRoleCommand
[HttpPut("{id:guid}")]   [RequirePermission("identity.roles.update")]   → UpdateRoleCommand
[HttpDelete("{id:guid}")] [RequirePermission("identity.roles.delete")]  → DeleteRoleCommand
```

### OfficesController

```csharp
[Route("api/v1/offices")]
[HttpGet]                [RequirePermission("identity.offices.read")]   → ListOfficesQuery
[HttpGet("{id:guid}")]   [RequirePermission("identity.offices.read")]   → GetOfficeQuery
[HttpPost]               [RequirePermission("identity.offices.create")] → CreateOfficeCommand
[HttpPut("{id:guid}")]   [RequirePermission("identity.offices.update")] → UpdateOfficeCommand
[HttpDelete("{id:guid}")] [RequirePermission("identity.offices.delete")] → DeleteOfficeCommand
```

### LocationsController

```csharp
[Route("api/v1/locations")]
[HttpGet("regions")]                       [Authorize] → ListLocationsQuery(Level: Region)
[HttpGet("regions/{id:guid}/zones")]       [Authorize] → ListLocationsQuery(Level: Zone, ParentId)
[HttpGet("zones/{id:guid}/woredas")]       [Authorize] → ListLocationsQuery(Level: Woreda, ParentId)
[HttpGet("woredas/{id:guid}/kebeles")]     [Authorize] → ListLocationsQuery(Level: Kebele, ParentId)
```

### OrganizationsController

```csharp
[Route("api/v1/organizations")]
[HttpGet]          [RequirePermission("orgsetup.organization.read")]   → GetOrganizationQuery
[HttpPut]          [RequirePermission("orgsetup.organization.update")] → UpdateOrganizationCommand
```

---

## 9. Module Registration

**File:** `src/Modules/Identity/NGO.PMS.Identity.API/IdentityModuleExtensions.cs`

```csharp
public static class IdentityModuleExtensions
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        // Application
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
            typeof(LoginCommandHandler).Assembly));
        services.AddValidatorsFromAssembly(typeof(LoginCommandValidator).Assembly);
        services.AddAutoMapper(typeof(UserMappingProfile).Assembly);

        // Infrastructure
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddHttpContextAccessor();

        return services;
    }
}
```

---

## 10. Database Migration

### EF Core Migration (schema)

```bash
cd src/Host/NGO.PMS.API
dotnet ef migrations add Identity_Initial \
  --context IdentityDbContext \
  --project ../../Modules/Identity/NGO.PMS.Identity.Infrastructure \
  --output-dir Migrations
dotnet ef database update --context IdentityDbContext
```

### DbUp Scripts (RLS, seeds)

| Script | Content |
|--------|---------|
| `0003_identity_schema.sql` | `CREATE SCHEMA IF NOT EXISTS identity;` |
| `0006_seed_permissions.sql` | ~195 permissions (3-part codes) |
| `0007_seed_role_templates.sql` | 7 default role templates |
| `0010_rls_identity.sql` | RLS policies for identity tables |

---

## 11. Integration Events Published

| Event | Trigger | Consumers |
|-------|---------|-----------|
| `UserCreatedIntegrationEvent` | CreateUserCommand | Notifications |
| `UserDeactivatedIntegrationEvent` | DeactivateUserCommand | Tasks, Chat |
| `RoleChangedIntegrationEvent` | AssignRole/RemoveRole | Audit |
| `OrganizationUpdatedIntegrationEvent` | UpdateOrganization | All (cache) |

---

## 12. Testing Checklist

### Unit Tests (`tests/NGO.PMS.Identity.Tests/`)

| Test | Type |
|------|------|
| `User_Create_ShouldSetEmailLowercase` | Domain |
| `User_RecordFailedLogin_ShouldLockAfter5` | Domain |
| `User_IsLockedOut_ShouldReturnTrue_WhenLocked` | Domain |
| `LoginCommandHandler_ShouldReturnTokens_WhenValid` | Application |
| `LoginCommandHandler_ShouldFail_WhenLockedOut` | Application |
| `LoginCommandHandler_ShouldFail_WhenWrongPassword` | Application |
| `CreateUserCommandHandler_ShouldCreateAndSendEmail` | Application |
| `CreateUserCommandValidator_ShouldFail_WhenEmailEmpty` | Application |
| `CreateRoleCommandHandler_ShouldCreateWithPermissions` | Application |
| `PermissionService_GetUserPermissions_ShouldReturnCodes` | Infrastructure |

### Integration Tests (`tests/NGO.PMS.API.Tests/`)

| Test | Endpoint |
|------|----------|
| `Login_ShouldReturn200_WithTokens` | POST /api/v1/auth/login |
| `Login_ShouldReturn401_WithBadPassword` | POST /api/v1/auth/login |
| `Refresh_ShouldReturnNewTokens` | POST /api/v1/auth/refresh |
| `ListUsers_ShouldReturn200_WithPagination` | GET /api/v1/users |
| `CreateUser_ShouldReturn201_AndSendEmail` | POST /api/v1/users |
| `ListUsers_ShouldNotReturnOtherOrgUsers` | GET /api/v1/users (RLS) |
| `ListRoles_ShouldReturn200` | GET /api/v1/roles |
| `LocationCascade_ShouldReturnZonesForRegion` | GET /api/v1/locations/regions/{id}/zones |

---

## 13. Complete File Index

| File | Action |
|------|--------|
| `Domain/Entities/User.cs` | Create |
| `Domain/Entities/Role.cs` | Create |
| `Domain/Entities/Permission.cs` | Create |
| `Domain/Entities/RolePermission.cs` | Create |
| `Domain/Entities/UserRole.cs` | Create |
| `Domain/Entities/RefreshToken.cs` | Create |
| `Domain/Entities/PasswordResetToken.cs` | Create |
| `Domain/Entities/Organization.cs` | Create |
| `Domain/Entities/Office.cs` | Create |
| `Domain/Entities/Location.cs` | Create |
| `Domain/Entities/AttributeRule.cs` | Create |
| `Domain/Enums/LocationLevel.cs` | Create |
| `Domain/Enums/CalendarPreference.cs` | Create |
| `Domain/Events/UserCreatedEvent.cs` | Create |
| `Domain/Events/UserDeactivatedEvent.cs` | Create |
| `Domain/Repositories/IUserRepository.cs` | Create |
| `Application/Auth/Commands/Login/*` (3 files) | Create |
| `Application/Auth/Commands/Logout/*` (2 files) | Create |
| `Application/Auth/Commands/RefreshToken/*` (2 files) | Create |
| `Application/Auth/Commands/ForgotPassword/*` (3 files) | Create |
| `Application/Auth/Commands/ResetPassword/*` (3 files) | Create |
| `Application/Auth/Commands/SetupPassword/*` (3 files) | Create |
| `Application/Users/Commands/CreateUser/*` (3 files) | Create |
| `Application/Users/Commands/UpdateUser/*` (3 files) | Create |
| `Application/Users/Commands/DeactivateUser/*` (2 files) | Create |
| `Application/Users/Commands/ActivateUser/*` (2 files) | Create |
| `Application/Users/Commands/ChangeUserPassword/*` (3 files) | Create |
| `Application/Users/Queries/GetUser/*` (2 files) | Create |
| `Application/Users/Queries/ListUsers/*` (2 files) | Create |
| `Application/Users/Queries/GetCurrentUser/*` (2 files) | Create |
| `Application/Roles/Commands/*` (5 commands × 3 files) | Create |
| `Application/Roles/Queries/*` (4 queries × 2 files) | Create |
| `Application/Offices/Commands/*` (3 commands × 3 files) | Create |
| `Application/Offices/Queries/*` (2 queries × 2 files) | Create |
| `Application/Organizations/Commands/UpdateOrganization/*` (3 files) | Create |
| `Application/Organizations/Queries/GetOrganization/*` (2 files) | Create |
| `Application/Locations/Queries/ListLocations/*` (2 files) | Create |
| `Application/Users/DTOs/*.cs` (5 files) | Create |
| `Application/Roles/DTOs/*.cs` (3 files) | Create |
| `Application/Offices/DTOs/*.cs` (2 files) | Create |
| `Application/Mappings/UserMappingProfile.cs` | Create |
| `Application/Mappings/RoleMappingProfile.cs` | Create |
| `Infrastructure/Persistence/IdentityDbContext.cs` | Create |
| `Infrastructure/Persistence/Configurations/*.cs` (10 files) | Create |
| `Infrastructure/Services/JwtTokenService.cs` | Create |
| `Infrastructure/Services/CurrentUserService.cs` | Create |
| `Infrastructure/Services/PermissionService.cs` | Create |
| `Infrastructure/Services/EmailService.cs` | Create |
| `API/Controllers/AuthController.cs` | Create |
| `API/Controllers/UsersController.cs` | Create |
| `API/Controllers/RolesController.cs` | Create |
| `API/Controllers/OfficesController.cs` | Create |
| `API/Controllers/LocationsController.cs` | Create |
| `API/Controllers/OrganizationsController.cs` | Create |
| `API/IdentityModuleExtensions.cs` | Create |

**Total: ~90 files for Identity backend**
