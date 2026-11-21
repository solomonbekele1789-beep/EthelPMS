# EthelPMS — Claude Project Rules

## Project Overview

EthelPMS is a multi-tenant SaaS NGO Project Management System.
Stack: ASP.NET Core (.NET 10) + Angular 22 (Nx 23.3) + Supabase PostgreSQL 16.
Architecture: Modular Monolith with Clean Architecture per module.

## Plans & Documentation

All implementation plans are in `docs/plans/`. Read these before working on any module:
- `docs/plans/00-MASTER-PLAN.md` — phase breakdown, team assignments, exit criteria
- `docs/plans/00-CODING-STANDARDS.md` — all coding conventions (sections 1-23)
- `docs/plans/00-TECH-STACK.md` — versions, packages, version variables
- `docs/plans/backend/BACKEND-OVERVIEW.md` — backend architecture, project structure
- `docs/plans/frontend/FRONTEND-OVERVIEW.md` — frontend architecture, Nx workspace

Module-level plans:
- `docs/plans/backend/{module}/{MODULE}-BACKEND.md` — implementation-ready backend detail
- `docs/plans/frontend/{module}/{MODULE}-FRONTEND.md` — implementation-ready frontend detail
- `docs/plans/integration/API-CONTRACTS.md` — every endpoint with JSON shapes

## Architecture Rules (MUST follow)

1. **Dependency direction**: Domain → SharedKernel only | Application → Domain + Contracts | Infrastructure → Application | API → Infrastructure + Application | Host → API projects only
2. **Host NEVER references Module.Infrastructure directly** — always through Module.API
3. **No cross-module direct dependencies** — use Contracts + MediatR events via Transactional Outbox
4. **Schema-per-module** — each module's DbContext uses `HasDefaultSchema("module_name")`
5. **Centralized versions** — use `$(EFCoreVersion)`, `$(MediatRVersion)`, etc. from Directory.Build.props
6. **No credentials in source** — use `dotnet user-secrets` for local dev
7. **Permission format**: `{module}.{resource}.{action}` (e.g., `identity.users.create`)
8. **Financial values**: Use NodaMoney, never float/double for money
9. **State machines**: Use Stateless library with explicit state transition tables

## Build Commands

```bash
# Backend
dotnet build EthelPMS.slnx
dotnet test EthelPMS.slnx

# Frontend (from client/)
npx nx build web
npx nx build platform-console
npx nx lint web
npx nx test web
```

## File Naming Conventions

- Backend: PascalCase for files matching class names
- Frontend: kebab-case (Angular convention)
- Domain entities: no suffix
- DTOs: `{Entity}Dto.cs`
- Commands: `{Verb}{Entity}Command.cs`
- Queries: `Get{Entity}Query.cs` / `Get{Entities}Query.cs`
- Handlers: `{Command/Query}Handler.cs`
- Validators: `{Command}Validator.cs`
- Controllers: `{Entity}sController.cs`

## Module List (18 modules)

Identity, PlatformAdmin, Projects, Planning, Reporting, MEAL, Participants, Procurement, FundAccounting, Assets, Training, Tasks, Risk, Donors, Chat, Notifications, Documents, Feedback

## Important Files

- `Directory.Build.props` — centralized package versions and build settings
- `global.json` — pins .NET 10 SDK
- `src/Host/NGO.PMS.API/Program.cs` — application host
- `src/Shared/NGO.PMS.SharedKernel/` — base entities, domain events, value objects
- `src/Shared/NGO.PMS.Contracts/` — cross-module DTOs and integration events

## Anti-Patterns (DO NOT)

1. Do not add business logic to controllers — controllers only dispatch to MediatR
2. Do not reference another module's Domain/Application/Infrastructure directly
3. Do not use raw SQL for CRUD — use EF Core; Dapper only for complex read queries
4. Do not skip FluentValidation — every command must have a validator
5. Do not hardcode tenant filtering — rely on RLS + Finbuckle middleware
6. Do not modify applied EF Core migrations — create new ones
7. Do not use `float` or `double` for financial values
8. Do not store secrets in appsettings — use user-secrets or environment variables
9. Do not create God services — one handler per command/query
10. Do not skip the Transactional Outbox for cross-module events
