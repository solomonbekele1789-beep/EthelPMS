# EthelPMS — Developer Setup Guide

**Version:** 1.0
**Date:** October 15, 2026

> Follow this guide to get EthelPMS running on your machine.
> Time to complete: ~30 minutes.

---

## Prerequisites

Install these before cloning:

| Tool | Version | Download | Verify |
|------|---------|----------|--------|
| **.NET SDK** | 10.0.100+ | https://dotnet.microsoft.com/download | `dotnet --version` |
| **Node.js** | 22.x LTS | https://nodejs.org | `node --version` |
| **npm** | 11.x+ | (comes with Node) | `npm --version` |
| **Git** | 2.40+ | https://git-scm.com | `git --version` |
| **VS Code** (recommended) or **Visual Studio 2022/2025** | Latest | https://code.visualstudio.com | — |
| **PostgreSQL client** (optional) | Any | pgAdmin, DBeaver, or CLI | — |

### VS Code Recommended Extensions

- C# Dev Kit (Microsoft)
- Angular Language Service
- ESLint
- Prettier
- Nx Console
- GitLens

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/Solomon-Bekele789/ethel-pms.git
cd ethel-pms
```

---

## Step 2: Backend Setup

### 2.1 Restore NuGet Packages

```bash
dotnet restore EthelPMS.sln
```

### 2.2 Configure Database Connection

The project uses Supabase PostgreSQL. You need the connection string.

**Option A: Get credentials from the team lead**

Ask the team lead for the Supabase connection string. Then store it securely:

```bash
cd src/Host/NGO.PMS.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD"
```

**Option B: Use your own Supabase project**

1. Go to https://supabase.com and create a free project
2. Go to Settings → Database → Connection string (URI)
3. Run the `dotnet user-secrets set` command above with your connection string

> **NEVER put the connection string in appsettings.Development.json and commit it.**
> Use `dotnet user-secrets` for local development.

### 2.3 Verify the Template Config

The repository includes `appsettings.Development.template.json` showing the expected structure:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "USE_DOTNET_USER_SECRETS"
  }
}
```

### 2.4 Build the Backend

```bash
cd /path/to/ethel-pms
dotnet build EthelPMS.sln
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

### 2.5 Run the Backend

```bash
dotnet run --project src/Host/NGO.PMS.API
```

Expected output:
```
[INF] Now listening on: http://localhost:5205
[INF] Application started.
```

### 2.6 Verify Backend

Open in browser:
- **Swagger UI:** http://localhost:5205/swagger
- **Health Check:** http://localhost:5205/health

Press `Ctrl+C` to stop.

---

## Step 3: Frontend Setup

### 3.1 Install npm Packages

```bash
cd client
npm install
```

> If npm fails with disk space errors, run: `npm config set cache E:\npm-cache`
> This moves the npm cache to a drive with more space.

### 3.2 Build the Frontend

```bash
npx nx build web
```

Expected: `Successfully compiled`.

### 3.3 Run the Frontend (Dev Server)

```bash
npx nx serve web
```

Expected: `Local: http://localhost:4200/`

Open http://localhost:4200 in your browser.

### 3.4 Run Platform Console (SuperAdmin App)

```bash
npx nx serve platform-console
```

Expected: runs on a different port (typically http://localhost:4201).

---

## Step 4: Running Both Together

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd /path/to/ethel-pms
dotnet run --project src/Host/NGO.PMS.API
```

**Terminal 2 (Frontend):**
```bash
cd /path/to/ethel-pms/client
npx nx serve web
```

The Angular app at localhost:4200 makes API calls to localhost:5205.
CORS is configured to allow this in `Program.cs`.

---

## Step 5: Running Tests

### Backend Tests

```bash
# All tests
dotnet test EthelPMS.sln

# Specific module
dotnet test tests/NGO.PMS.Identity.Tests

# With coverage
dotnet test EthelPMS.sln --collect:"XPlat Code Coverage"
```

### Frontend Tests

```bash
cd client

# All tests
npx nx run-many --target=test --all

# Specific library
npx nx test shared-ui

# E2E tests (requires backend running)
npx nx e2e web-e2e
```

---

## Step 6: Common Tasks

### Create a New Migration (Per Module)

```bash
cd src/Host/NGO.PMS.API
dotnet ef migrations add InitialCreate \
  --context IdentityDbContext \
  --project ../../Modules/Identity/NGO.PMS.Identity.Infrastructure \
  --output-dir Migrations
```

### Run Migrations

```bash
dotnet ef database update --context IdentityDbContext \
  --project ../../Modules/Identity/NGO.PMS.Identity.Infrastructure
```

### Generate an Angular Component

```bash
cd client
npx nx g @nx/angular:component user-list \
  --project=modules-identity \
  --path=libs/modules/identity/src/lib/pages/user-list \
  --standalone
```

### Generate an Angular Service

```bash
npx nx g @nx/angular:service auth \
  --project=shared-core \
  --path=libs/shared/core/src/lib/services
```

### Lint and Format

```bash
# Backend
dotnet format EthelPMS.sln

# Frontend
cd client
npx nx run-many --target=lint --all
npx nx format:write
```

---

## Project Structure Quick Reference

```
ethel-pms/
├── src/Host/NGO.PMS.API/          ← Run this (dotnet run)
├── src/Shared/                     ← Shared code (both devs use)
├── src/Modules/{Name}/             ← Backend modules (Developer A)
├── tests/                          ← Backend tests (Developer A)
├── client/apps/web/                ← Tenant Angular app (Developer B)
├── client/apps/platform-console/   ← Admin Angular app (Developer B)
├── client/libs/shared/             ← Shared Angular code (Developer B)
├── client/libs/modules/            ← Feature Angular libs (Developer B)
├── docs/plans/                     ← Implementation plans (both devs read)
└── docs/                           ← Other documentation
```

---

## Troubleshooting

### "No space left on device" errors

Your C: drive may be full. Free space:
```powershell
# Clear npm cache
npm cache clean --force

# Clear NuGet cache
dotnet nuget locals all --clear

# Move npm cache to another drive
npm config set cache E:\npm-cache
```

### "Unable to connect to database"

1. Check your user-secrets: `dotnet user-secrets list`
2. Verify the Supabase project is active at https://supabase.com
3. Test the connection string manually with psql or pgAdmin

### "Module not found" in Angular

Restart the Nx daemon:
```bash
cd client
npx nx reset
npm install
```

### "Port already in use"

```bash
# Find process on port 5205
netstat -ano | findstr 5205
# Kill it
taskkill /PID {pid} /F
```

---

## Environment Variables (Production)

For deployment, these environment variables replace user-secrets:

| Variable | Example | Required |
|----------|---------|----------|
| `ConnectionStrings__DefaultConnection` | `Host=...;Port=5432;...` | Yes |
| `Jwt__Secret` | `your-256-bit-secret` | Yes |
| `Jwt__Issuer` | `https://api.ethelpms.com` | Yes |
| `Jwt__Audience` | `https://ethelpms.com` | Yes |
| `Email__SmtpHost` | `smtp.gmail.com` | Phase 1+ |
| `Email__SmtpPort` | `587` | Phase 1+ |
| `Supabase__StorageUrl` | `https://xxx.supabase.co/storage/v1` | Phase 4+ |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Yes |
