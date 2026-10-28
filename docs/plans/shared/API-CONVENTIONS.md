# EthelPMS — API Conventions Plan

**Version:** 1.0
**Date:** October 16, 2026
**Owner:** Both developers

> Every HTTP endpoint in EthelPMS follows these conventions.
> Backend builds the endpoints, frontend consumes them — both must agree on these rules.

---

## 1. URL Structure

```
{scheme}://{host}/api/v{version}/{resource}
```

| Component | Rule | Example |
|-----------|------|---------|
| Base path | `/api/v1/` | Always versioned from day one |
| Resource | Plural, kebab-case | `/api/v1/projects`, `/api/v1/journal-entries` |
| Single item | `/{resource}/{id}` | `/api/v1/projects/abc-123` |
| Nested | `/{parent}/{id}/{child}` | `/api/v1/projects/abc-123/milestones` |
| Action | `POST /{resource}/{id}/{verb}` | `POST /api/v1/projects/abc-123/approve` |
| Platform | `/api/v1/platform/{resource}` | `/api/v1/platform/tenants` (SuperAdmin) |

### Module → Route Mapping

| Module | Route Prefix |
|--------|-------------|
| Identity | `/api/v1/auth`, `/api/v1/users`, `/api/v1/roles`, `/api/v1/offices`, `/api/v1/locations` |
| PlatformAdmin | `/api/v1/platform/tenants`, `/api/v1/platform/modules` |
| OrgSetup | `/api/v1/organizations`, `/api/v1/settings` |
| Projects | `/api/v1/projects`, `/api/v1/projects/{id}/milestones` |
| ResultsFramework | `/api/v1/outcomes`, `/api/v1/outputs`, `/api/v1/indicators` |
| InterventionAreas | `/api/v1/intervention-areas`, `/api/v1/sectors` |
| Planning | `/api/v1/annual-plans`, `/api/v1/quarterly-plans` |
| DIP | `/api/v1/dip-entries` |
| Reporting | `/api/v1/reports` |
| MEAL | `/api/v1/meal-plans`, `/api/v1/evaluations` |
| Participants | `/api/v1/participants` |
| Graduation | `/api/v1/graduation-criteria`, `/api/v1/graduation-tracking` |
| Procurement | `/api/v1/purchase-requests`, `/api/v1/bids`, `/api/v1/contracts`, `/api/v1/purchase-orders` |
| FundAccounting | `/api/v1/journal-entries`, `/api/v1/budgets`, `/api/v1/accounts` |
| Assets | `/api/v1/assets`, `/api/v1/asset-maintenance` |
| Training | `/api/v1/training-programs`, `/api/v1/training-sessions` |
| Tasks | `/api/v1/tasks` |
| Risk | `/api/v1/risks`, `/api/v1/mitigations` |
| Donors | `/api/v1/donors`, `/api/v1/grants`, `/api/v1/disbursements` |
| Chat | `/api/v1/channels`, `/api/v1/messages` |
| Notifications | `/api/v1/notifications` |
| Documents | `/api/v1/documents` |
| Feedback | `/api/v1/feedback` |
| Dashboards | `/api/v1/dashboards` |

---

## 2. HTTP Methods

| Method | Usage | Idempotent | Request Body | Response |
|--------|-------|-----------|-------------|---------|
| `GET` | Read resource(s) | Yes | None | `200` with data |
| `POST` | Create resource or action | No | Required | `201` with location, or `200` for actions |
| `PUT` | Full update | Yes | Required | `200` with updated data |
| `PATCH` | Partial update | Yes | Partial body | `200` with updated data |
| `DELETE` | Remove (soft delete) | Yes | None | `204` no content |

---

## 3. Response Envelope

Every API response uses `ApiResponse<T>` from SharedKernel.

### Success (single item)

```json
{
  "success": true,
  "data": {
    "id": "abc-123",
    "name": "Clean Water Project",
    "status": "active"
  },
  "message": null
}
```

### Success (list — paginated)

```json
{
  "success": true,
  "data": [
    { "id": "abc-123", "name": "Clean Water Project" },
    { "id": "def-456", "name": "Education Program" }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 142,
  "totalPages": 8,
  "message": null
}
```

### Error

```json
{
  "success": false,
  "data": null,
  "errors": [
    { "code": "VALIDATION_ERROR", "message": "Name is required.", "field": "name" },
    { "code": "VALIDATION_ERROR", "message": "Budget must be positive.", "field": "budget" }
  ],
  "message": "One or more validation errors occurred."
}
```

### HTTP Status Codes

| Code | When |
|------|------|
| `200` | Successful GET, PUT, PATCH, or action POST |
| `201` | Successful resource creation (POST) |
| `204` | Successful DELETE |
| `400` | Validation error (FluentValidation) |
| `401` | Not authenticated (missing/expired JWT) |
| `403` | Not authorized (missing permission or module disabled) |
| `404` | Resource not found |
| `409` | Conflict (duplicate key, stale update) |
| `422` | Business rule violation |
| `429` | Rate limit exceeded |
| `500` | Unhandled server error |

---

## 4. Pagination

### Request

```
GET /api/v1/projects?page=2&pageSize=20&sortBy=name&sortDir=asc
```

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| `page` | int | 1 | — |
| `pageSize` | int | 20 | 100 |
| `sortBy` | string | `createdAt` | Must be a known column |
| `sortDir` | string | `asc` | `asc` or `desc` |

### Backend Implementation

**File:** `src/Shared/NGO.PMS.SharedKernel/Api/PaginatedQuery.cs`

```csharp
namespace NGO.PMS.SharedKernel.Api;

public abstract record PaginatedQuery
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SortBy { get; init; }
    public string SortDir { get; init; } = "asc";
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Api/PaginationExtensions.cs`

```csharp
using Microsoft.EntityFrameworkCore;

namespace NGO.PMS.SharedKernel.Api;

public static class PaginationExtensions
{
    public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(
        this IQueryable<T> query, int page, int pageSize, CancellationToken ct = default)
    {
        var totalCount = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return PagedResponse<T>.Ok(items, page, pageSize, totalCount);
    }
}
```

### Frontend — Generic Pagination Model

**File:** `client/libs/shared/core/src/lib/models/pagination.model.ts`

```typescript
export interface PaginatedRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}
```

---

## 5. Filtering & Search

### Query Parameters

```
GET /api/v1/projects?status=active&officeId=abc-123&search=water&dateFrom=2026-01-01&dateTo=2026-12-31
```

| Pattern | Example | Purpose |
|---------|---------|---------|
| Exact match | `?status=active` | Filter by enum/FK |
| Multi-value | `?status=active,completed` | Comma-separated OR |
| Text search | `?search=water` | Full-text across name, description |
| Date range | `?dateFrom=2026-01-01&dateTo=2026-12-31` | Range filter |
| Boolean | `?isActive=true` | Toggle filter |

### Backend — Filter Base

**File:** `src/Shared/NGO.PMS.SharedKernel/Api/FilteredQuery.cs`

```csharp
namespace NGO.PMS.SharedKernel.Api;

public abstract record FilteredQuery : PaginatedQuery
{
    public string? Search { get; init; }
    public DateTime? DateFrom { get; init; }
    public DateTime? DateTo { get; init; }
}
```

---

## 6. Error Handling

### Global Exception Handler

**File:** `src/Host/NGO.PMS.API/Middleware/GlobalExceptionHandler.cs`

```csharp
using Microsoft.AspNetCore.Diagnostics;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        var (statusCode, response) = exception switch
        {
            ValidationException ve => (400, ApiResponse<object>.Fail(
                ve.Errors.Select(e => new ApiError("VALIDATION_ERROR", e.ErrorMessage, e.PropertyName)))),

            UnauthorizedAccessException => (403, ApiResponse<object>.Fail("Access denied.")),

            NotFoundException nf => (404, ApiResponse<object>.Fail(nf.Message)),

            BusinessRuleException br => (422, ApiResponse<object>.Fail(br.Message)),

            ConflictException ce => (409, ApiResponse<object>.Fail(ce.Message)),

            _ => (500, ApiResponse<object>.Fail("An unexpected error occurred."))
        };

        if (statusCode == 500)
        {
            _logger.LogError(exception, "Unhandled exception for {Path}", context.Request.Path);
        }

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(response, ct);
        return true;
    }
}
```

### Custom Exceptions

**File:** `src/Shared/NGO.PMS.SharedKernel/Exceptions/`

```csharp
public class NotFoundException : Exception
{
    public NotFoundException(string entity, object key)
        : base($"{entity} with key '{key}' was not found.") { }
}

public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
```

### FluentValidation Pipeline Behavior

**File:** `src/Shared/NGO.PMS.SharedKernel/Behaviors/ValidationBehavior.cs`

```csharp
using FluentValidation;
using MediatR;

namespace NGO.PMS.SharedKernel.Behaviors;

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        => _validators = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!_validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var failures = (await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, ct))))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count > 0) throw new ValidationException(failures);
        return await next();
    }
}
```

---

## 7. Correlation IDs

Every request gets a unique correlation ID for distributed tracing.

### Backend Middleware

**File:** `src/Host/NGO.PMS.API/Middleware/CorrelationIdMiddleware.cs`

```csharp
namespace NGO.PMS.API.Middleware;

public class CorrelationIdMiddleware
{
    private const string Header = "X-Correlation-ID";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[Header].FirstOrDefault()
                            ?? Guid.NewGuid().ToString();

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers[Header] = correlationId;

        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

### Frontend Interceptor Addition

The `authInterceptor` (from AUTHENTICATION.md) also attaches the correlation ID:

```typescript
const correlationId = crypto.randomUUID();
const cloned = req.clone({
  setHeaders: { 'X-Correlation-ID': correlationId }
});
```

---

## 8. Rate Limiting

### Configuration

**File:** Program.cs addition:

```csharp
builder.Services.AddRateLimiter(options =>
{
    // Global: 100 requests/minute per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Auth endpoints: stricter
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.RejectionStatusCode = 429;
});

// In pipeline:
app.UseRateLimiter();
```

### Apply to Auth Controller

```csharp
[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase { ... }
```

---

## 9. Versioning Strategy

### Current Approach (v1)

All endpoints use `/api/v1/`. No versioning middleware needed yet.

### Future (when v2 is needed)

```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
});
```

Old v1 controllers stay in place. New v2 controllers coexist. Frontend switches base URL when ready.

---

## 10. Request/Response Headers

### Standard Request Headers

| Header | Required | Example | Purpose |
|--------|----------|---------|---------|
| `Authorization` | Yes (except public) | `Bearer eyJ...` | JWT token (mobile) |
| `Cookie` | Yes (web) | `__Host-access_token=...` | JWT in HttpOnly cookie |
| `X-XSRF-TOKEN` | Yes (web, mutating) | `abc123` | Anti-forgery token |
| `X-Tenant-ID` | Optional | `uuid` | Tenant hint (resolved from JWT) |
| `X-Correlation-ID` | Optional | `uuid` | Request tracing |
| `X-Client-Type` | Optional | `web`, `mobile` | Token delivery hint |
| `Accept-Language` | Optional | `en`, `am` | Response language |
| `Content-Type` | Yes (POST/PUT) | `application/json` | Always JSON |

### Standard Response Headers

| Header | Example | Purpose |
|--------|---------|---------|
| `X-Correlation-ID` | `uuid` | Echo back for tracing |
| `X-RateLimit-Remaining` | `95` | Remaining requests |
| `X-RateLimit-Reset` | `1698883200` | Reset timestamp |
| `Content-Type` | `application/json` | Always JSON |

---

## 11. Frontend — HTTP Service Base

**File:** `client/libs/shared/core/src/lib/services/api.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse, PaginatedResponse, PaginatedRequest } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;  // 'http://localhost:5205/api/v1'

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${path}`, { params: httpParams });
  }

  getList<T>(path: string, pagination: PaginatedRequest,
    filters?: Record<string, string>): Observable<PaginatedResponse<T>> {
    let params = new HttpParams()
      .set('page', pagination.page)
      .set('pageSize', pagination.pageSize);
    if (pagination.sortBy) params = params.set('sortBy', pagination.sortBy);
    if (pagination.sortDir) params = params.set('sortDir', pagination.sortDir);
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { params = params.set(k, v); });
    }
    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${path}`, { params });
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${path}`, body);
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${path}`);
  }
}
```

### Frontend — Error Interceptor

**File:** `client/libs/shared/core/src/lib/interceptors/error.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          router.navigate(['/auth/login']);
          break;
        case 403:
          router.navigate(['/unauthorized']);
          break;
        case 404:
          // Show toast: "Resource not found"
          break;
        case 429:
          // Show toast: "Too many requests, please wait"
          break;
        case 500:
          // Show toast: "Server error, please try again"
          break;
      }
      return throwError(() => error);
    })
  );
};
```

---

## 12. File Upload Convention

For endpoints that accept file uploads (documents, participant photos, etc.):

```
POST /api/v1/documents
Content-Type: multipart/form-data

Form fields:
  file: <binary>
  projectId: <uuid>
  category: "report"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "doc-123",
    "fileName": "Q3_Report.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "url": "/api/v1/documents/doc-123/download"
  }
}
```

Max file size: 25MB (configurable per tenant tier).

---

## 13. File Index

### Backend (Developer A)

| File | Action |
|------|--------|
| `src/Shared/NGO.PMS.SharedKernel/Api/ApiResponse.cs` | Already exists — verify matches spec |
| `src/Shared/NGO.PMS.SharedKernel/Api/PagedResponse.cs` | Already exists — verify |
| `src/Shared/NGO.PMS.SharedKernel/Api/PaginatedQuery.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Api/PaginationExtensions.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Api/FilteredQuery.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Exceptions/NotFoundException.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Exceptions/BusinessRuleException.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Exceptions/ConflictException.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Behaviors/ValidationBehavior.cs` | Create |
| `src/Host/NGO.PMS.API/Middleware/GlobalExceptionHandler.cs` | Create |
| `src/Host/NGO.PMS.API/Middleware/CorrelationIdMiddleware.cs` | Create |
| `src/Host/NGO.PMS.API/Program.cs` | Modify — rate limiter, exception handler, middleware |

### Frontend (Developer B)

| File | Action |
|------|--------|
| `client/libs/shared/core/src/lib/models/pagination.model.ts` | Create |
| `client/libs/shared/core/src/lib/services/api.service.ts` | Create |
| `client/libs/shared/core/src/lib/interceptors/error.interceptor.ts` | Create |
| `client/libs/shared/core/src/lib/environments/environment.ts` | Create |
| `client/libs/shared/core/src/lib/environments/environment.prod.ts` | Create |

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `shared/AUTHENTICATION.md` | JWT structure, auth interceptor, cookie handling |
| `00-CODING-STANDARDS.md` | Naming conventions, API endpoint patterns |
| `00-TECH-STACK.md` | Package versions |
