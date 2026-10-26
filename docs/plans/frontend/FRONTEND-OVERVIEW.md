# EthelPMS — Frontend Architecture Overview

**Version:** 1.0
**Date:** October 17, 2026
**Owner:** Developer B (Frontend lead)

> This is the single guide for how the Angular frontend is structured.
> Read this before touching any frontend code. Module-specific plans are in `frontend/{module}/`.

---

## 1. Nx Workspace Structure

```
client/                                    ← Nx monorepo root
├── nx.json                                ← Nx config (defaultBase: main)
├── tsconfig.base.json                     ← strict: true, path aliases
├── package.json
│
├── apps/
│   ├── web/                               ← Tenant-facing app (port 4200)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.config.ts          ← Providers: HttpClient, NgRx, i18n, interceptors
│   │   │   │   ├── app.routes.ts          ← Top-level lazy routes
│   │   │   │   └── layouts/
│   │   │   │       ├── main-layout/       ← Sidebar + topbar + content (authenticated)
│   │   │   │       └── auth-layout/       ← Centered card (login, reset password)
│   │   │   ├── assets/
│   │   │   │   └── i18n/
│   │   │   │       ├── en.json
│   │   │   │       └── am.json
│   │   │   └── environments/
│   │   │       ├── environment.ts         ← apiBaseUrl: 'http://localhost:5205/api/v1'
│   │   │       └── environment.prod.ts
│   │   └── project.json
│   │
│   └── platform-console/                  ← SuperAdmin app (port 4201)
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.config.ts
│       │   │   ├── app.routes.ts
│       │   │   └── layouts/
│       │   │       └── admin-layout/      ← Simplified sidebar for platform ops
│       │   └── assets/i18n/
│       └── project.json
│
└── libs/
    ├── shared/
    │   ├── ui/                            ← Shared Angular Material components
    │   │   └── src/lib/                   ← See SHARED-COMPONENTS.md
    │   └── core/                          ← Services, guards, interceptors, models, store
    │       └── src/lib/
    │           ├── services/
    │           │   ├── auth.service.ts
    │           │   ├── api.service.ts
    │           │   ├── tenant.service.ts
    │           │   ├── permission.service.ts
    │           │   └── theme.service.ts
    │           ├── interceptors/
    │           │   ├── auth.interceptor.ts
    │           │   ├── tenant.interceptor.ts
    │           │   └── error.interceptor.ts
    │           ├── guards/
    │           │   ├── auth.guard.ts
    │           │   ├── permission.guard.ts
    │           │   └── module.guard.ts
    │           ├── directives/
    │           │   ├── has-permission.directive.ts
    │           │   └── has-role.directive.ts
    │           ├── store/
    │           │   ├── auth.actions.ts
    │           │   ├── auth.reducer.ts
    │           │   ├── auth.effects.ts
    │           │   └── auth.selectors.ts
    │           ├── models/
    │           │   ├── auth.model.ts
    │           │   ├── pagination.model.ts
    │           │   └── user.model.ts
    │           └── environments/
    │               ├── environment.ts
    │               └── environment.prod.ts
    │
    └── modules/
        ├── identity/                      ← Identity feature library
        │   └── src/lib/
        │       ├── pages/
        │       │   ├── login/
        │       │   ├── setup-password/
        │       │   ├── forgot-password/
        │       │   ├── reset-password/
        │       │   ├── user-list/
        │       │   ├── user-detail/
        │       │   ├── user-create/
        │       │   ├── role-list/
        │       │   ├── role-detail/
        │       │   ├── office-list/
        │       │   ├── office-detail/
        │       │   ├── location-list/
        │       │   └── organization-settings/
        │       ├── services/
        │       │   ├── user.service.ts
        │       │   ├── role.service.ts
        │       │   ├── office.service.ts
        │       │   ├── location.service.ts
        │       │   └── organization.service.ts
        │       ├── store/
        │       │   ├── user.actions.ts
        │       │   ├── user.reducer.ts
        │       │   ├── user.effects.ts
        │       │   └── user.selectors.ts
        │       ├── models/
        │       │   ├── user.model.ts
        │       │   ├── role.model.ts
        │       │   ├── office.model.ts
        │       │   ├── location.model.ts
        │       │   └── organization.model.ts
        │       └── routes.ts              ← Lazy-loaded routes
        │
        ├── projects/                      ← Phase 2
        ├── planning/                      ← Phase 3
        ├── reporting/                     ← Phase 4
        ├── meal/                          ← Phase 5
        └── ... (1:1 with backend modules)
```

---

## 2. App Configuration

### `app.config.ts` (web app)

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from '@ethelpms/shared/core';
import { tenantInterceptor } from '@ethelpms/shared/core';
import { errorInterceptor } from '@ethelpms/shared/core';
import { authReducer } from '@ethelpms/shared/core';
import { AuthEffects } from '@ethelpms/shared/core';
import { environment } from '../environments/environment';

function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, tenantInterceptor, errorInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })
    ),
    provideAnimationsAsync(),
    provideStore({ auth: authReducer, ui: uiReducer }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    provideTranslateService({
      defaultLanguage: 'en',
      loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient] }
    }),
  ]
};
```

### App Initializer (restore session on page load)

```typescript
// In app.config.ts providers:
{
  provide: APP_INITIALIZER,
  useFactory: (store: Store) => () => {
    store.dispatch(AuthActions.restoreSession());
  },
  deps: [Store],
  multi: true
}
```

---

## 3. Routing Strategy

### Top-Level Routes (`app.routes.ts`)

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@ethelpms/shared/core';
import { moduleGuard } from '@ethelpms/shared/core';

export const routes: Routes = [
  // Auth pages (no layout)
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component'),
    children: [
      { path: 'login', loadComponent: () => import('@ethelpms/modules/identity').then(m => m.LoginComponent) },
      { path: 'setup-password', loadComponent: () => import('@ethelpms/modules/identity').then(m => m.SetupPasswordComponent) },
      { path: 'forgot-password', loadComponent: () => import('@ethelpms/modules/identity').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('@ethelpms/modules/identity').then(m => m.ResetPasswordComponent) },
    ]
  },

  // Authenticated pages (main layout)
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component'),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component') },
      { path: 'unauthorized', loadComponent: () => import('./pages/unauthorized/unauthorized.component') },
      { path: 'module-not-available', loadComponent: () => import('./pages/module-not-available/module-not-available.component') },

      // Identity module
      {
        path: 'users',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.userRoutes)
      },
      {
        path: 'roles',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.roleRoutes)
      },
      {
        path: 'offices',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.officeRoutes)
      },
      {
        path: 'locations',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.locationRoutes)
      },
      {
        path: 'settings/organization',
        loadComponent: () => import('@ethelpms/modules/identity').then(m => m.OrganizationSettingsComponent)
      },

      // Projects module (Phase 2)
      {
        path: 'projects',
        canActivate: [moduleGuard('projects')],
        loadChildren: () => import('@ethelpms/modules/projects').then(m => m.projectRoutes)
      },

      // ... one entry per module, all lazy-loaded
    ]
  },

  { path: '**', redirectTo: 'auth/login' }
];
```

**Rule:** Every module route uses `loadChildren` for lazy loading. No eager imports of module components.

---

## 4. State Management (NgRx)

### Global Store Slices

| Slice | Location | Purpose |
|-------|----------|---------|
| `auth` | `libs/shared/core/src/lib/store/` | Current user, tokens, permissions, roles |
| `ui` | `libs/shared/core/src/lib/store/` | Sidebar collapsed, theme, language |

### Module Store Slices (feature stores)

Each module lazy-loads its own NgRx feature store:

```typescript
// In modules/identity/routes.ts
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

export const userRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState('users', userReducer),
      provideEffects([UserEffects])
    ],
    children: [
      { path: '', component: UserListComponent },
      { path: 'create', component: UserCreateComponent },
      { path: ':id', component: UserDetailComponent },
    ]
  }
];
```

### Auth State Shape

```typescript
export interface AuthState {
  user: UserProfile | null;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  tenant: TenantInfo | null;
}
```

---

## 5. Internationalization (i18n)

### Setup

Uses `@ngx-translate/core` with JSON files per language.

```
client/apps/web/src/assets/i18n/
├── en.json
└── am.json
```

### Translation File Structure

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm",
    "search": "Search...",
    "loading": "Loading...",
    "noData": "No data found"
  },
  "auth": {
    "login": {
      "title": "Sign in to EthelPMS",
      "email": "Email address",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot your password?"
    }
  },
  "users": {
    "list": { "title": "User Management", "createButton": "New User" },
    "create": { "title": "Create User" },
    "fields": { "firstName": "First Name", "lastName": "Last Name", "email": "Email" }
  },
  "projects": {
    "list": { "title": "Projects", "createButton": "New Project" }
  }
}
```

### Usage in Components

```typescript
// In template:
<h1>{{ 'users.list.title' | translate }}</h1>

// In TypeScript:
private translate = inject(TranslateService);
this.translate.instant('common.save');
```

---

## 6. Theme Service

**File:** `client/libs/shared/core/src/lib/services/theme.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly currentTheme = signal<Theme>('light');

  constructor() {
    const saved = localStorage?.getItem('theme') as Theme;
    if (saved) this.setTheme(saved);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage?.setItem('theme', theme); } catch {}
  }

  toggle(): void {
    this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
  }
}
```

### CSS Custom Properties

```scss
// styles.scss (global)
:root, [data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-sidebar: #1e293b;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent-primary: #2563eb;
  --accent-success: #16a34a;
  --accent-warning: #d97706;
  --accent-danger: #dc2626;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --bg-sidebar: #0f172a;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --accent-primary: #3b82f6;
  --border-color: #374151;
}
```

---

## 7. Module Library Pattern

Every backend module has a matching frontend library:

```
libs/modules/{name}/
├── src/
│   └── lib/
│       ├── pages/           ← Route components (pages)
│       ├── components/      ← Module-specific components (not shared)
│       ├── services/        ← HTTP services for this module's API
│       ├── store/           ← NgRx feature store (actions, reducer, effects, selectors)
│       ├── models/          ← TypeScript interfaces matching backend DTOs
│       └── routes.ts        ← Lazy-loaded route configuration
├── src/index.ts             ← Public API exports
└── project.json
```

### Generating a New Module Library

```bash
cd client
npx nx g @nx/angular:library identity \
  --directory=libs/modules/identity \
  --standalone --buildable --prefix=identity
```

---

## 8. Nx Module Boundaries

```json
// nx.json → enforce module boundaries via ESLint
{
  "@nx/enforce-module-boundaries": [
    "error",
    {
      "depConstraints": [
        { "sourceTag": "scope:shared-core", "onlyDependOnLibsWithTags": [] },
        { "sourceTag": "scope:shared-ui", "onlyDependOnLibsWithTags": ["scope:shared-core"] },
        { "sourceTag": "scope:module", "onlyDependOnLibsWithTags": ["scope:shared-core", "scope:shared-ui"] },
        { "sourceTag": "scope:app", "onlyDependOnLibsWithTags": ["scope:shared-core", "scope:shared-ui", "scope:module"] }
      ]
    }
  ]
}
```

**Forbidden:**
- `modules/identity` → `modules/projects` (cross-module)
- `apps/web` → direct `@angular/material` (use `shared/ui` wrappers)
- `shared/core` → any module

---

## 9. Testing

### Component Tests (Vitest)

```typescript
// user-list.component.spec.ts
import { render, screen } from '@testing-library/angular';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  it('should render title', async () => {
    await render(UserListComponent, {
      providers: [provideMockStore({ initialState: { users: { entities: [], loading: false } } })],
    });
    expect(screen.getByText('User Management')).toBeTruthy();
  });
});
```

### E2E Tests (Playwright)

```
client/apps/web-e2e/
├── src/
│   ├── login.spec.ts
│   ├── user-management.spec.ts
│   └── permission-denied.spec.ts
└── playwright.config.ts
```

---

## 10. File Index — Phase 0A/0B Frontend Files

| File | Phase | Description |
|------|-------|-------------|
| `apps/platform-console/` (entire app) | 0A | Create SuperAdmin app |
| `apps/web/src/app/app.config.ts` | 0A | Full provider setup |
| `apps/web/src/app/app.routes.ts` | 0A-1 | Route configuration |
| `apps/web/src/app/layouts/main-layout/` | 0B | Sidebar + topbar layout |
| `apps/web/src/app/layouts/auth-layout/` | 0B | Centered auth layout |
| `libs/shared/core/src/lib/services/auth.service.ts` | 0B | Auth HTTP service |
| `libs/shared/core/src/lib/services/api.service.ts` | 0B | Base API service |
| `libs/shared/core/src/lib/services/tenant.service.ts` | 0B | Tenant context |
| `libs/shared/core/src/lib/services/permission.service.ts` | 0B | Permission cache |
| `libs/shared/core/src/lib/services/theme.service.ts` | 0B | Dark/light theme |
| `libs/shared/core/src/lib/interceptors/*.ts` (3 files) | 0B | Auth, tenant, error |
| `libs/shared/core/src/lib/guards/*.ts` (3 files) | 0B | Auth, permission, module |
| `libs/shared/core/src/lib/directives/*.ts` (2 files) | 0B | HasPermission, HasRole |
| `libs/shared/core/src/lib/store/*.ts` (4 files) | 0B | Auth NgRx store |
| `libs/shared/core/src/lib/models/*.ts` (3 files) | 0B | Auth, pagination, user |
| `libs/shared/core/src/lib/environments/*.ts` (2 files) | 0B | Dev + prod config |
| `libs/shared/ui/src/lib/` (16 components) | 0B | See SHARED-COMPONENTS.md |
| `libs/modules/identity/` (skeleton) | 0A | Module library scaffold |
| `libs/modules/projects/` (skeleton) | 0A | Module library scaffold |
| `apps/web/src/assets/i18n/en.json` | 0B | English translations |
| `apps/web/src/assets/i18n/am.json` | 0B | Amharic translations |
| `tsconfig.base.json` | 0A | strict: true |
| `nx.json` | 0A | defaultBase: main, boundaries |

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `00-CODING-STANDARDS.md` | Naming, file structure, component patterns |
| `00-TECH-STACK.md` | Angular, NgRx, Material versions |
| `shared/SHARED-COMPONENTS.md` | Component inventory and specs |
| `shared/AUTHENTICATION.md` | Auth service, interceptor, guard |
| `shared/AUTHORIZATION-RBAC.md` | Permission directive, permission guard |
| `shared/MULTI-TENANCY.md` | Tenant service, interceptor, module guard |
| `shared/API-CONVENTIONS.md` | API service, error interceptor, pagination models |
