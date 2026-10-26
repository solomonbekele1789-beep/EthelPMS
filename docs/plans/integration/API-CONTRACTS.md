# EthelPMS — Phase 1 API Contracts

**Version:** 1.0
**Date:** October 17, 2026
**Owners:** Developer A (Backend) + Developer B (Frontend)
**Phase:** 1 (Weeks 3-4)

> This is the handshake document between backend and frontend.
> Every endpoint listed here is the contract both sides code against.
> Changes require both developers to agree and update this doc.
> Cross-references: `shared/API-CONVENTIONS.md`, `backend/identity/IDENTITY-BACKEND.md`, `backend/platformadmin/PLATFORMADMIN-BACKEND.md`

---

## Conventions

- **Base URL:** `http://localhost:5205/api/v1` (dev), `https://api.ethelpms.com/api/v1` (prod)
- **All responses** wrapped in `ApiResponse<T>`: `{ success: bool, data: T, message?: string, errors?: string[] }`
- **Paginated responses** use `PagedResponse<T>`: `{ success, data: T[], totalCount, page, pageSize, totalPages }`
- **Dates** in ISO 8601 UTC: `"2026-10-17T12:00:00Z"`
- **IDs** are UUID v4 strings
- **Auth:** JWT in `Authorization: Bearer <token>` header OR `__Host-access_token` HttpOnly cookie
- **Tenant:** Resolved from JWT `tenant_id` claim (no header needed)
- **Correlation:** `X-Correlation-Id` header on every request/response

---

## 1. Authentication Endpoints

### POST `/auth/login`

**Auth:** None (public)
**Rate limit:** 10 requests/min/IP

```
Request:
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",            // Only if X-Client-Type: mobile
    "expiresIn": 21600,                 // 6 hours in seconds
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "Solomon",
      "lastName": "Bekele",
      "organizationId": "uuid",
      "organizationName": "Hope Ethiopia",
      "permissions": ["identity.users.read", "identity.users.create", ...],
      "roles": ["OrgAdmin"],
      "tenant": {
        "id": "uuid",
        "name": "Hope Ethiopia",
        "slug": "hope-ethiopia",
        "modules": ["identity", "projects", "reporting"]
      }
    }
  }
}

// For web clients (X-Client-Type: web or missing):
// - accessToken omitted from response body
// - Set-Cookie: __Host-access_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=21600
// - Set-Cookie: __Host-refresh_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800

Response 401:
{
  "success": false,
  "message": "Invalid email or password.",
  "errors": ["INVALID_CREDENTIALS"]
}

Response 423:
{
  "success": false,
  "message": "Account locked. Try again in 15 minutes.",
  "errors": ["ACCOUNT_LOCKED"]
}
```

### POST `/auth/logout`

**Auth:** Required

```
Request: (empty body)

Response 200:
{ "success": true, "message": "Logged out successfully." }

// Clears __Host-access_token and __Host-refresh_token cookies
```

### POST `/auth/refresh`

**Auth:** None (uses refresh token cookie or body)

```
Request (mobile):
{ "refreshToken": "base64-token-string" }

Request (web): (empty body, token from cookie)

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",              // Only for mobile
    "expiresIn": 21600
  }
}
// Web: new cookies set automatically

Response 401:
{ "success": false, "message": "Refresh token expired or revoked.", "errors": ["TOKEN_EXPIRED"] }
```

### POST `/auth/forgot-password`

**Auth:** None

```
Request:
{ "email": "user@example.com" }

Response 200 (always, even if email not found):
{ "success": true, "message": "If an account with that email exists, we sent a reset link." }
```

### POST `/auth/reset-password`

**Auth:** None

```
Request:
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecure123!"
}

Response 200:
{ "success": true, "message": "Password reset successfully." }

Response 400:
{ "success": false, "message": "Invalid or expired token.", "errors": ["INVALID_TOKEN"] }
```

### POST `/auth/setup-password`

**Auth:** None

```
Request:
{
  "token": "setup-token-from-email",
  "password": "FirstLogin123!"
}

Response 200:
{ "success": true, "message": "Password set successfully. You can now log in." }

Response 400:
{ "success": false, "message": "Invalid or expired token.", "errors": ["INVALID_TOKEN"] }
```

---

## 2. User Endpoints

### GET `/users`

**Auth:** Required
**Permission:** `identity.users.read`

```
Query params:
  page=1 (default 1)
  pageSize=20 (default 20, max 100)
  search=solomon (searches email, firstName, lastName)
  isActive=true (optional filter)
  officeId=uuid (optional filter)
  sortBy=createdAt (firstName, lastName, email, createdAt)
  sortDirection=desc (asc|desc)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@org.com",
      "fullName": "Solomon Bekele",
      "isActive": true,
      "officeName": "Addis Ababa HQ",
      "roles": ["OrgAdmin", "ProjectManager"],
      "createdAt": "2026-10-17T12:00:00Z"
    }
  ],
  "totalCount": 47,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

### GET `/users/{id}`

**Auth:** Required
**Permission:** `identity.users.read`

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@org.com",
    "firstName": "Solomon",
    "lastName": "Bekele",
    "phone": "+251911234567",
    "isActive": true,
    "emailConfirmed": true,
    "officeId": "uuid",
    "officeName": "Addis Ababa HQ",
    "roles": ["OrgAdmin"],
    "createdAt": "2026-10-17T12:00:00Z"
  }
}

Response 404:
{ "success": false, "message": "User not found.", "errors": ["NOT_FOUND"] }
```

### GET `/users/me`

**Auth:** Required (any authenticated user)

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@org.com",
    "firstName": "Solomon",
    "lastName": "Bekele",
    "organizationId": "uuid",
    "organizationName": "Hope Ethiopia",
    "permissions": ["identity.users.read", "identity.users.create", "projects.projects.read"],
    "roles": ["OrgAdmin"],
    "tenant": {
      "id": "uuid",
      "name": "Hope Ethiopia",
      "slug": "hope-ethiopia",
      "modules": ["identity", "projects", "reporting"]
    }
  }
}
```

### POST `/users`

**Auth:** Required
**Permission:** `identity.users.create`

```
Request:
{
  "email": "newuser@org.com",
  "firstName": "Abebe",
  "lastName": "Kebede",
  "phone": "+251922345678",
  "officeId": "uuid",
  "roleIds": ["uuid-orgadmin-role", "uuid-pm-role"]
}

Response 201:
{
  "success": true,
  "data": { /* UserDto */ },
  "message": "User created. Invitation email sent."
}

Response 409:
{ "success": false, "message": "A user with this email already exists.", "errors": ["DUPLICATE_EMAIL"] }
```

### PUT `/users/{id}`

**Auth:** Required
**Permission:** `identity.users.update`

```
Request:
{
  "firstName": "Abebe",
  "lastName": "Kebede",
  "phone": "+251922345678",
  "officeId": "uuid",
  "isActive": true
}

Response 200:
{ "success": true, "data": { /* UserDto */ } }
```

### POST `/users/me/change-password`

**Auth:** Required (any authenticated user)

```
Request:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecure456!"
}

Response 200:
{ "success": true, "message": "Password changed successfully." }

Response 400:
{ "success": false, "message": "Current password is incorrect.", "errors": ["INVALID_PASSWORD"] }
```

### POST `/users/{id}/deactivate`

**Auth:** Required
**Permission:** `identity.users.manage`

```
Request: (empty body)
Response 200:
{ "success": true, "message": "User deactivated." }

Response 400:
{ "success": false, "message": "Cannot deactivate yourself.", "errors": ["SELF_DEACTIVATION"] }
```

### POST `/users/{id}/activate`

**Auth:** Required
**Permission:** `identity.users.manage`

```
Request: (empty body)
Response 200:
{ "success": true, "message": "User activated." }
```

### POST `/users/{id}/roles`

**Auth:** Required
**Permission:** `identity.users.manage`

```
Request:
{ "roleId": "uuid" }

Response 200:
{ "success": true, "message": "Role assigned." }
```

### DELETE `/users/{id}/roles/{roleId}`

**Auth:** Required
**Permission:** `identity.users.manage`

```
Response 200:
{ "success": true, "message": "Role removed." }
```

---

## 3. Role Endpoints

### GET `/roles`

**Auth:** Required
**Permission:** `identity.roles.read`

```
Query params: page, pageSize, search

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "OrgAdmin",
      "description": "Full organization admin",
      "isSystemRole": true,
      "permissionCount": 42,
      "userCount": 3
    }
  ],
  "totalCount": 7,
  "page": 1, "pageSize": 20, "totalPages": 1
}
```

### GET `/roles/{id}`

**Auth:** Required
**Permission:** `identity.roles.read`

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ProjectManager",
    "description": "Can manage projects, plans, and reports",
    "isSystemRole": true,
    "permissions": [
      { "id": "uuid", "code": "projects.projects.create", "displayName": "Create Projects",
        "module": "projects", "resource": "projects", "action": "create" },
      ...
    ],
    "createdAt": "2026-10-17T12:00:00Z"
  }
}
```

### GET `/roles/permissions`

**Auth:** Required
**Permission:** `identity.roles.read`

```
Query params: module=identity (optional filter by module)

Response 200:
{
  "success": true,
  "data": [
    { "id": "uuid", "code": "identity.users.create", "displayName": "Create Users",
      "module": "identity", "resource": "users", "action": "create" },
    { "id": "uuid", "code": "identity.users.read", "displayName": "View Users",
      "module": "identity", "resource": "users", "action": "read" },
    ...
  ]
}
```

### POST `/roles`

**Auth:** Required
**Permission:** `identity.roles.create`

```
Request:
{
  "name": "Custom MEAL Officer",
  "description": "Can view MEAL data and manage evaluations",
  "permissionIds": ["uuid1", "uuid2", "uuid3"]
}

Response 201:
{ "success": true, "data": { /* RoleDto with permissions */ } }

Response 409:
{ "success": false, "message": "A role with this name already exists.", "errors": ["DUPLICATE_NAME"] }
```

### PUT `/roles/{id}`

**Auth:** Required
**Permission:** `identity.roles.update`

```
Request:
{
  "name": "Custom MEAL Officer",
  "description": "Updated description",
  "permissionIds": ["uuid1", "uuid2", "uuid3", "uuid4"]
}

Response 200:
{ "success": true, "data": { /* RoleDto */ } }

Response 400 (system role):
{ "success": false, "message": "System roles cannot be modified.", "errors": ["SYSTEM_ROLE"] }
```

### DELETE `/roles/{id}`

**Auth:** Required
**Permission:** `identity.roles.delete`

```
Response 200:
{ "success": true, "message": "Role deleted." }

Response 400:
{ "success": false, "message": "Cannot delete system roles.", "errors": ["SYSTEM_ROLE"] }
```

---

## 4. Office Endpoints

### GET `/offices`

**Auth:** Required
**Permission:** `identity.offices.read`

```
Query params: page, pageSize, search

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Addis Ababa HQ",
      "code": "AA-HQ",
      "parentOfficeName": null,
      "userCount": 12
    }
  ],
  "totalCount": 5, "page": 1, "pageSize": 20, "totalPages": 1
}
```

### GET `/offices/{id}`

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Addis Ababa HQ",
    "code": "AA-HQ",
    "parentOfficeId": null,
    "parentOfficeName": null,
    "locationId": "uuid",
    "locationName": "Addis Ababa"
  }
}
```

### POST `/offices`

**Auth:** Required
**Permission:** `identity.offices.create`

```
Request:
{
  "name": "South Gondar Field Office",
  "code": "SG-FO",
  "parentOfficeId": "uuid-of-amhara-office",
  "locationId": "uuid-of-south-gondar-zone"
}

Response 201:
{ "success": true, "data": { /* OfficeDto */ } }
```

### PUT `/offices/{id}`

**Permission:** `identity.offices.update`

Same shape as POST. Response 200.

### DELETE `/offices/{id}`

**Permission:** `identity.offices.delete`

```
Response 200:
{ "success": true, "message": "Office deleted." }

Response 400:
{ "success": false, "message": "Cannot delete office with assigned users.", "errors": ["HAS_USERS"] }
```

---

## 5. Location Endpoints

### GET `/locations/regions`

**Auth:** Required (no special permission — reference data)

```
Response 200:
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Amhara", "nameAm": "አማራ", "level": "Region", "parentId": null },
    { "id": "uuid", "name": "Oromia", "nameAm": "ኦሮሚያ", "level": "Region", "parentId": null },
    ...
  ]
}
```

### GET `/locations/regions/{regionId}/zones`

```
Response 200:
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "South Gondar", "nameAm": "ደቡብ ጎንደር", "level": "Zone", "parentId": "uuid-amhara" },
    ...
  ]
}
```

### GET `/locations/zones/{zoneId}/woredas`

Same structure with `"level": "Woreda"`.

### GET `/locations/woredas/{woredaId}/kebeles`

Same structure with `"level": "Kebele"`.

---

## 6. Organization Endpoints

### GET `/organizations`

**Auth:** Required
**Permission:** `orgsetup.organization.read`

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Hope Ethiopia",
    "slug": "hope-ethiopia",
    "logoUrl": "https://cdn.ethelpms.com/logos/hope.png",
    "timezone": "Africa/Addis_Ababa",
    "calendarPreference": "Ethiopian",
    "userCount": 47,
    "officeCount": 5
  }
}
```

### PUT `/organizations`

**Auth:** Required
**Permission:** `orgsetup.organization.update`

```
Request:
{
  "name": "Hope Ethiopia International",
  "logoUrl": "https://cdn.ethelpms.com/logos/hope-new.png",
  "timezone": "Africa/Addis_Ababa",
  "calendarPreference": "Ethiopian"
}

Response 200:
{ "success": true, "data": { /* OrganizationDto */ } }
```

---

## 7. Platform Admin Endpoints

All endpoints in this section require SuperAdmin role.

### GET `/platform/tenants`

```
Query params: page, pageSize, search, status (Active|Pending|Suspended)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Hope Ethiopia",
      "slug": "hope-ethiopia",
      "status": "Active",
      "subscriptionName": "Pro",
      "userCount": 47,
      "projectCount": 12,
      "createdAt": "2026-10-01T00:00:00Z"
    }
  ],
  "totalCount": 15, "page": 1, "pageSize": 20, "totalPages": 1
}
```

### GET `/platform/tenants/{id}`

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Hope Ethiopia",
    "slug": "hope-ethiopia",
    "adminEmail": "admin@hope.org",
    "status": "Active",
    "logoUrl": null,
    "primaryColor": null,
    "maxUsers": 100,
    "maxProjects": 50,
    "timezone": "Africa/Addis_Ababa",
    "subscription": {
      "id": "uuid", "name": "Pro", "maxUsers": 100, "maxProjects": 50,
      "priceMonthlyUsd": 49.99,
      "includedModules": ["identity", "projects", "results-framework", ...]
    },
    "modules": [
      { "moduleName": "identity", "isEnabled": true, "enabledAt": "2026-10-01T..." },
      { "moduleName": "projects", "isEnabled": true, "enabledAt": "2026-10-01T..." },
      { "moduleName": "chat", "isEnabled": false, "enabledAt": null }
    ],
    "createdAt": "2026-10-01T00:00:00Z",
    "activatedAt": "2026-10-01T00:05:00Z",
    "suspendedAt": null,
    "suspensionReason": null
  }
}
```

### POST `/platform/tenants`

```
Request:
{
  "name": "New NGO",
  "slug": "new-ngo",
  "adminEmail": "admin@newngo.org",
  "subscriptionPackageId": "uuid"
}

Response 201:
{ "success": true, "data": { /* TenantDetailDto with status: "Pending" */ } }
```

### POST `/platform/tenants/{id}/provision`

```
Request: (empty body)
Response 202:
{ "success": true, "message": "Provisioning started." }
```

### POST `/platform/tenants/{id}/activate`

```
Response 200:
{ "success": true, "message": "Tenant activated." }
```

### POST `/platform/tenants/{id}/suspend`

```
Request:
{ "reason": "Non-payment" }

Response 200:
{ "success": true, "message": "Tenant suspended." }
```

### POST `/platform/tenants/{id}/reactivate`

```
Response 200:
{ "success": true, "message": "Tenant reactivated." }
```

### PUT `/platform/tenants/{id}`

```
Request:
{ "name": "Updated Name", "maxUsers": 200, "maxProjects": 100, "timezone": "UTC" }

Response 200:
{ "success": true, "data": { /* TenantDetailDto */ } }
```

### PUT `/platform/tenants/{id}/branding`

```
Request:
{ "logoUrl": "https://cdn.ethelpms.com/logos/org.png", "primaryColor": "#2563eb" }

Response 200:
{ "success": true, "data": { /* TenantDetailDto */ } }
```

### PUT `/platform/tenants/{id}/subscription`

```
Request:
{ "subscriptionPackageId": "uuid-of-enterprise-package" }

Response 200:
{ "success": true, "data": { /* TenantDetailDto with updated modules */ } }
```

### GET `/platform/tenants/{id}/usage`

```
Response 200:
{
  "success": true,
  "data": {
    "currentUsers": 47,
    "maxUsers": 100,
    "currentProjects": 12,
    "maxProjects": 50,
    "storageUsedBytes": 1073741824
  }
}
```

### GET `/platform/tenants/{id}/provisioning`

```
Response 200:
{
  "success": true,
  "data": [
    { "step": "CreateOrganization", "status": "Completed", "message": null,
      "startedAt": "2026-10-01T00:00:01Z", "completedAt": "2026-10-01T00:00:02Z" },
    { "step": "EnableRLS", "status": "Completed", ... },
    { "step": "SeedPermissions", "status": "Completed", ... },
    { "step": "CreateDefaultRoles", "status": "Completed", ... },
    { "step": "CreateAdminUser", "status": "Completed", ... },
    { "step": "EnableModules", "status": "Completed", ... },
    { "step": "RegisterFinbuckle", "status": "Completed", ... }
  ]
}
```

### GET `/platform/tenants/{id}/modules`

```
Response 200:
{
  "success": true,
  "data": [
    { "moduleName": "identity", "isEnabled": true, "enabledAt": "2026-10-01T..." },
    ...
  ]
}
```

### PUT `/platform/tenants/{tenantId}/modules/{moduleName}`

```
Request:
{ "enabled": false }

Response 200:
{ "success": true, "message": "Module 'chat' disabled for tenant." }
```

### GET `/platform/subscriptions`

```
Response 200:
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Free", "maxUsers": 10, "maxProjects": 5,
      "priceMonthlyUsd": 0, "includedModules": ["identity", "projects", "reporting"] },
    { "id": "uuid", "name": "Pro", "maxUsers": 100, "maxProjects": 50,
      "priceMonthlyUsd": 49.99,
      "includedModules": ["identity", "projects", "results-framework", "planning", "reporting", "meal", "participants", "tasks", "notifications"] },
    { "id": "uuid", "name": "Enterprise", "maxUsers": 999, "maxProjects": 999,
      "priceMonthlyUsd": 199.99,
      "includedModules": [ /* all 18 modules */ ] }
  ]
}
```

### GET `/platform/tenants/{id}/keys`

```
Response 200:
{
  "success": true,
  "data": [
    { "id": "uuid", "label": "Mobile App Integration", "scopes": ["read:projects", "read:reports"],
      "maskedKey": "ethel_...a3f2", "createdAt": "2026-10-15T...", "expiresAt": null, "isRevoked": false }
  ]
}
```

### POST `/platform/tenants/{id}/keys`

```
Request:
{ "label": "BI Dashboard", "scopes": ["read:*"], "expiresAt": "2027-10-17T00:00:00Z" }

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "key": "ethel_live_abc123def456ghi789..."    // ONLY returned once
  },
  "message": "Save this key — it won't be shown again."
}
```

### DELETE `/platform/tenants/{id}/keys/{keyId}`

```
Response 200:
{ "success": true, "message": "Access key revoked." }
```

---

## 8. Error Response Reference

All error responses follow the same envelope:

| HTTP Status | Error Code | When |
|-------------|-----------|------|
| 400 | `VALIDATION_ERROR` | Request body fails validation |
| 401 | `UNAUTHORIZED` | Missing or expired JWT |
| 403 | `FORBIDDEN` | Valid JWT but insufficient permissions |
| 404 | `NOT_FOUND` | Resource does not exist (or not in tenant scope) |
| 409 | `CONFLICT` | Duplicate email, slug, name, etc. |
| 423 | `ACCOUNT_LOCKED` | Too many failed login attempts |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

Validation error example:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    "Email is required.",
    "Password must be at least 8 characters."
  ]
}
```

---

## 9. Headers Reference

### Request Headers

| Header | Required | Description |
|--------|----------|------------|
| `Authorization` | Yes (mobile) | `Bearer <jwt>` for mobile clients |
| `X-Client-Type` | No | `web` or `mobile` (defaults to `web`) |
| `X-Correlation-Id` | No | UUID for request tracing (auto-generated if missing) |
| `Content-Type` | Yes (POST/PUT) | `application/json` |
| `Accept-Language` | No | `en` or `am` for error message localization |

### Response Headers

| Header | Always | Description |
|--------|--------|------------|
| `X-Correlation-Id` | Yes | Echoed or generated correlation ID |
| `X-RateLimit-Remaining` | Yes | Remaining requests in window |
| `X-RateLimit-Reset` | Yes | Seconds until rate limit resets |
| `Content-Type` | Yes | `application/json` |
