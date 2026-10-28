# EthelPMS — PlatformAdmin Module Frontend Plan

**Version:** 1.0
**Date:** October 17, 2026
**Owner:** Developer B (Frontend lead)
**Phase:** 1 (Weeks 3-4)

> Covers: Platform-console app, tenant directory, provisioning wizard, module toggling, subscription management.
> Prerequisites: Phase 0A platform-console app scaffold, Phase 0B shared components.
> Cross-references: `shared/MULTI-TENANCY.md`, `backend/platformadmin/PLATFORMADMIN-BACKEND.md`

---

## 1. Requirements Covered

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-PLAT-001 | Tenant directory with search/filter | Must |
| REQ-PLAT-002 | Tenant provisioning wizard UI | Must |
| REQ-PLAT-003 | Module toggle per tenant | Must |
| REQ-PLAT-004 | Subscription management UI | Must |
| REQ-PLAT-005 | API access key management | Should |
| REQ-PLAT-006 | Tenant usage dashboard | Should |
| REQ-PLAT-007 | Suspend/reactivate UI | Must |
| REQ-PLAT-008 | Tenant branding form | Should |

---

## 2. App: platform-console

The `platform-console` app runs on port 4201, separate from the tenant-facing `web` app. It has its own `app.config.ts` and `app.routes.ts` but shares `libs/shared/core` and `libs/shared/ui`.

**Layout:** Single-column admin layout with a slim sidebar containing: Dashboard, Tenants, Subscriptions.

---

## 3. Page Inventory

| Page | Route | Description |
|------|-------|------------|
| Platform Login | `/auth/login` | SuperAdmin login (same LoginComponent, different redirect) |
| Platform Dashboard | `/dashboard` | Tenant count, system health, recent provisioning activity |
| Tenant Directory | `/tenants` | Paginated list with status filters |
| Tenant Detail | `/tenants/:id` | Tabs: Overview, Modules, Keys, Provisioning Log |
| Create Tenant (Wizard) | `/tenants/create` | 3-step wizard: Info → Package → Confirm |
| Subscription Packages | `/subscriptions` | List/edit subscription tiers |

---

## 4. Tenant Directory

**File:** `apps/platform-console/src/app/pages/tenant-list/tenant-list.component.ts`

```typescript
@Component({
  selector: 'platform-tenant-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent, StatusBadgeComponent,
            MatButtonModule, MatChipsModule, RouterLink, TranslateModule],
  template: `
    <app-page-header [title]="'platform.tenants.title' | translate"
                     [subtitle]="'platform.tenants.subtitle' | translate">
      <button mat-raised-button color="primary" routerLink="create">
        <mat-icon>add_business</mat-icon> {{ 'platform.tenants.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="status-filter">
      <mat-chip-listbox (change)="onStatusFilter($event)" [value]="statusFilter()">
        <mat-chip-option value="">All</mat-chip-option>
        <mat-chip-option value="Active">Active</mat-chip-option>
        <mat-chip-option value="Pending">Pending</mat-chip-option>
        <mat-chip-option value="Suspended">Suspended</mat-chip-option>
      </mat-chip-listbox>
    </div>

    <app-data-table
      [columns]="columns"
      [data]="tenants()"
      [totalCount]="totalCount()"
      [loading]="loading()"
      (pageChange)="onPageChange($event)"
      (rowClick)="onRowClick($event)">
    </app-data-table>
  `
})
export default class TenantListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  tenants = this.store.selectSignal(selectTenants);
  totalCount = this.store.selectSignal(selectTenantTotalCount);
  loading = this.store.selectSignal(selectTenantsLoading);
  statusFilter = signal('');

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.tenants.fields.name', sortable: true },
    { key: 'slug', label: 'platform.tenants.fields.slug' },
    { key: 'status', label: 'platform.tenants.fields.status', type: 'status-badge',
      statusMap: {
        'Active': { label: 'Active', color: 'success' },
        'Pending': { label: 'Pending', color: 'warning' },
        'Provisioning': { label: 'Provisioning', color: 'info' },
        'Suspended': { label: 'Suspended', color: 'danger' },
      }
    },
    { key: 'subscriptionName', label: 'platform.tenants.fields.subscription' },
    { key: 'userCount', label: 'platform.tenants.fields.users', sortable: true },
    { key: 'createdAt', label: 'common.createdAt', type: 'date', sortable: true },
  ];

  ngOnInit(): void {
    this.store.dispatch(TenantActions.loadTenants({ page: 1, pageSize: 20 }));
  }

  onStatusFilter(event: MatChipListboxChange): void {
    this.statusFilter.set(event.value);
    this.store.dispatch(TenantActions.loadTenants({ page: 1, pageSize: 20, status: event.value || undefined }));
  }

  onPageChange(event: PageEvent): void {
    this.store.dispatch(TenantActions.loadTenants({
      page: event.pageIndex + 1, pageSize: event.pageSize, status: this.statusFilter() || undefined
    }));
  }

  onRowClick(tenant: TenantListItemDto): void {
    this.router.navigate(['/tenants', tenant.id]);
  }
}
```

---

## 5. Create Tenant Wizard

**File:** `apps/platform-console/src/app/pages/tenant-create/tenant-create.component.ts`

3-step `mat-stepper`:

**Step 1 — Organization Info:**
- Name (required)
- Slug (auto-generated from name, editable, validated as URL-safe unique)
- Admin Email (required, valid email)
- Timezone (dropdown, default "Africa/Addis_Ababa")

**Step 2 — Subscription Package:**
- Radio group of packages from `ListSubscriptionPackagesQuery`
- Each card shows: name, price, max users, max projects, included modules

**Step 3 — Confirmation:**
- Summary of all values
- "Create & Provision" button dispatches `TenantActions.createTenant(...)`
- On success, navigates to tenant detail with provisioning progress

```typescript
@Component({
  standalone: true,
  imports: [MatStepperModule, MatFormFieldModule, MatInputModule, MatSelectModule,
            MatRadioModule, MatButtonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <app-page-header [title]="'platform.tenants.create.title' | translate" />

    <mat-stepper linear #stepper>
      <!-- Step 1: Info -->
      <mat-step [stepControl]="infoForm">
        <ng-template matStepLabel>{{ 'platform.tenants.create.step1' | translate }}</ng-template>
        <form [formGroup]="infoForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Organization Name</mat-label>
            <input matInput formControlName="name" (input)="generateSlug()" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Slug</mat-label>
            <input matInput formControlName="slug" />
            <mat-hint>URL identifier: {{ infoForm.value.slug }}.ethelpms.com</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Admin Email</mat-label>
            <input matInput formControlName="adminEmail" type="email" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Timezone</mat-label>
            <mat-select formControlName="timezone">
              <mat-option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</mat-option>
              <mat-option value="UTC">UTC</mat-option>
              <!-- Additional timezones -->
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" matStepperNext>Next</button>
        </form>
      </mat-step>

      <!-- Step 2: Package -->
      <mat-step [stepControl]="packageForm">
        <ng-template matStepLabel>{{ 'platform.tenants.create.step2' | translate }}</ng-template>
        <form [formGroup]="packageForm">
          <mat-radio-group formControlName="subscriptionPackageId" class="package-grid">
            @for (pkg of packages(); track pkg.id) {
              <mat-radio-button [value]="pkg.id" class="package-card">
                <div class="package-name">{{ pkg.name }}</div>
                <div class="package-price">{{ pkg.priceMonthlyUsd | currency }}/mo</div>
                <div class="package-limits">{{ pkg.maxUsers }} users · {{ pkg.maxProjects }} projects</div>
                <div class="package-modules">{{ pkg.includedModules.length }} modules</div>
              </mat-radio-button>
            }
          </mat-radio-group>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-raised-button color="primary" matStepperNext>Next</button>
        </form>
      </mat-step>

      <!-- Step 3: Confirm -->
      <mat-step>
        <ng-template matStepLabel>{{ 'platform.tenants.create.step3' | translate }}</ng-template>
        <div class="confirmation-summary">
          <!-- Display all values in a summary card -->
        </div>
        <button mat-button matStepperPrevious>Back</button>
        <button mat-raised-button color="primary" (click)="onSubmit()"
                [disabled]="submitting()">
          Create & Provision
        </button>
      </mat-step>
    </mat-stepper>
  `
})
export default class TenantCreateComponent { ... }
```

---

## 6. Tenant Detail Page

**File:** `apps/platform-console/src/app/pages/tenant-detail/tenant-detail.component.ts`

4 tabs:

### Tab 1: Overview
- Status badge, name, slug, admin email
- Subscription package info
- Usage stats (users/projects/storage progress bars)
- Action buttons: Suspend (if Active), Reactivate (if Suspended), Edit

### Tab 2: Modules
- Toggle list of all 18 modules
- Each row: module name, enabled/disabled slide toggle
- Changing a toggle dispatches `TenantActions.toggleModule(...)`
- Modules included in the subscription tier are marked with a star

```typescript
template: `
  @for (module of allModules(); track module.name) {
    <div class="module-row">
      <span class="module-name">{{ module.name }}</span>
      @if (module.isIncludedInTier) { <mat-icon class="tier-badge">star</mat-icon> }
      <mat-slide-toggle
        [checked]="module.isEnabled"
        (change)="onToggle(module.name, $event.checked)">
      </mat-slide-toggle>
    </div>
  }
`
```

### Tab 3: Access Keys
- List of keys with label, scopes, created date, expiry, status
- Create key button opens a dialog
- Revoke button with confirmation

### Tab 4: Provisioning Log
- Timeline/stepper view of provisioning steps
- Each step shows: name, status (icon), duration, error message if failed
- "Retry Provisioning" button if any step failed

---

## 7. Platform Dashboard

**File:** `apps/platform-console/src/app/pages/dashboard/dashboard.component.ts`

Cards:
- Total tenants (with breakdown: Active / Pending / Suspended)
- Total users across all tenants
- Recent provisioning activity (last 10 events)
- System health indicators (API status, DB status, Hangfire queue depth)

---

## 8. NgRx Store

### Tenant Store

**Files:** `apps/platform-console/src/app/store/tenant.actions.ts`, etc.

```typescript
export const TenantActions = createActionGroup({
  source: 'Platform Tenants',
  events: {
    'Load Tenants': props<{ page: number; pageSize: number; search?: string; status?: string }>(),
    'Load Tenants Success': props<{ tenants: TenantListItemDto[]; totalCount: number }>(),
    'Load Tenants Failure': props<{ error: string }>(),
    'Load Tenant': props<{ id: string }>(),
    'Load Tenant Success': props<{ tenant: TenantDetailDto }>(),
    'Create Tenant': props<{ request: CreateTenantRequest }>(),
    'Create Tenant Success': props<{ tenant: TenantDetailDto }>(),
    'Create Tenant Failure': props<{ error: string }>(),
    'Suspend Tenant': props<{ id: string; reason: string }>(),
    'Suspend Tenant Success': props<{ id: string }>(),
    'Reactivate Tenant': props<{ id: string }>(),
    'Reactivate Tenant Success': props<{ id: string }>(),
    'Toggle Module': props<{ tenantId: string; moduleName: string; enabled: boolean }>(),
    'Toggle Module Success': props<{ tenantId: string; moduleName: string; enabled: boolean }>(),
    'Load Packages': emptyProps(),
    'Load Packages Success': props<{ packages: SubscriptionPackageDto[] }>(),
  }
});
```

---

## 9. HTTP Services

### TenantService

**File:** `apps/platform-console/src/app/services/tenant.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class PlatformTenantService {
  private api = inject(ApiService);

  listTenants(page: number, pageSize: number, search?: string, status?: string):
    Observable<PagedResponse<TenantListItemDto>> {
    return this.api.get<PagedResponse<TenantListItemDto>>('/platform/tenants',
      { page, pageSize, ...(search && { search }), ...(status && { status }) });
  }

  getTenant(id: string): Observable<TenantDetailDto> {
    return this.api.get<TenantDetailDto>(`/platform/tenants/${id}`);
  }

  createTenant(request: CreateTenantRequest): Observable<TenantDetailDto> {
    return this.api.post<TenantDetailDto>('/platform/tenants', request);
  }

  provisionTenant(id: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/provision`, {});
  }

  suspendTenant(id: string, reason: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/suspend`, { reason });
  }

  reactivateTenant(id: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/reactivate`, {});
  }

  activateTenant(id: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/activate`, {});
  }

  updateTenant(id: string, request: UpdateTenantRequest): Observable<TenantDetailDto> {
    return this.api.put<TenantDetailDto>(`/platform/tenants/${id}`, request);
  }

  updateBranding(id: string, request: { logoUrl?: string; primaryColor?: string }): Observable<TenantDetailDto> {
    return this.api.put<TenantDetailDto>(`/platform/tenants/${id}/branding`, request);
  }

  updateSubscription(id: string, subscriptionPackageId: string): Observable<TenantDetailDto> {
    return this.api.put<TenantDetailDto>(`/platform/tenants/${id}/subscription`, { subscriptionPackageId });
  }

  toggleModule(tenantId: string, moduleName: string, enabled: boolean): Observable<void> {
    return this.api.put<void>(`/platform/tenants/${tenantId}/modules/${moduleName}`, { enabled });
  }

  getTenantUsage(id: string): Observable<TenantUsageDto> {
    return this.api.get<TenantUsageDto>(`/platform/tenants/${id}/usage`);
  }

  getProvisioningStatus(id: string): Observable<ProvisioningLogDto[]> {
    return this.api.get<ProvisioningLogDto[]>(`/platform/tenants/${id}/provisioning`);
  }

  listPackages(): Observable<SubscriptionPackageDto[]> {
    return this.api.get<SubscriptionPackageDto[]>('/platform/subscriptions');
  }

  listAccessKeys(tenantId: string): Observable<AccessKeyDto[]> {
    return this.api.get<AccessKeyDto[]>(`/platform/tenants/${tenantId}/keys`);
  }

  createAccessKey(tenantId: string, request: CreateAccessKeyRequest): Observable<{ key: string }> {
    return this.api.post<{ key: string }>(`/platform/tenants/${tenantId}/keys`, request);
  }

  revokeAccessKey(tenantId: string, keyId: string): Observable<void> {
    return this.api.delete<void>(`/platform/tenants/${tenantId}/keys/${keyId}`);
  }
}
```

---

## 10. TypeScript Models

**File:** `apps/platform-console/src/app/models/`

```typescript
// tenant.model.ts
export interface TenantListItemDto {
  id: string; name: string; slug: string; status: string;
  subscriptionName: string; userCount: number; projectCount: number; createdAt: string;
}

export interface TenantDetailDto {
  id: string; name: string; slug: string; adminEmail: string;
  status: string; logoUrl: string | null; primaryColor: string | null;
  maxUsers: number; maxProjects: number; timezone: string;
  subscription: SubscriptionPackageDto; modules: TenantModuleDto[];
  createdAt: string; activatedAt: string | null;
  suspendedAt: string | null; suspensionReason: string | null;
}

export interface TenantModuleDto { moduleName: string; isEnabled: boolean; enabledAt: string | null; }

export interface SubscriptionPackageDto {
  id: string; name: string; maxUsers: number; maxProjects: number;
  priceMonthlyUsd: number; includedModules: string[];
}

export interface TenantUsageDto {
  currentUsers: number; maxUsers: number;
  currentProjects: number; maxProjects: number; storageUsedBytes: number;
}

export interface ProvisioningLogDto {
  step: string; status: string; message: string | null;
  startedAt: string; completedAt: string | null;
}

export interface AccessKeyDto {
  id: string; label: string; scopes: string[]; maskedKey: string;
  createdAt: string; expiresAt: string | null; isRevoked: boolean;
}

export interface CreateTenantRequest {
  name: string; slug: string; adminEmail: string; subscriptionPackageId: string;
}

export interface CreateAccessKeyRequest { label: string; scopes: string[]; expiresAt?: string; }
```

---

## 11. Route Configuration

**File:** `apps/platform-console/src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component'),
    children: [
      { path: 'login', loadComponent: () => import('@ethelpms/modules/identity').then(m => m.LoginComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component'),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component') },
      { path: 'tenants', loadComponent: () => import('./pages/tenant-list/tenant-list.component') },
      { path: 'tenants/create', loadComponent: () => import('./pages/tenant-create/tenant-create.component') },
      { path: 'tenants/:id', loadComponent: () => import('./pages/tenant-detail/tenant-detail.component') },
      { path: 'subscriptions', loadComponent: () => import('./pages/subscriptions/subscriptions.component') },
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
```

---

## 12. Admin Layout

**File:** `apps/platform-console/src/app/layouts/admin-layout/admin-layout.component.ts`

Simplified layout compared to the main web app. No module-guard logic. No permission-based menu filtering — all menu items visible to SuperAdmin.

Sidebar items:
- Dashboard (icon: `dashboard`)
- Tenants (icon: `business`)
- Subscriptions (icon: `payment`)

Topbar: logo, "EthelPMS Platform Console" title, user menu (logout only).

---

## 13. i18n Keys

```json
{
  "platform": {
    "tenants": {
      "title": "Tenant Directory",
      "subtitle": "Manage all organizations on the platform",
      "createButton": "New Tenant",
      "create": {
        "title": "Create Tenant",
        "step1": "Organization Info",
        "step2": "Subscription",
        "step3": "Confirm"
      },
      "fields": {
        "name": "Organization Name",
        "slug": "Slug",
        "status": "Status",
        "subscription": "Subscription",
        "users": "Users",
        "adminEmail": "Admin Email"
      },
      "detail": {
        "tabOverview": "Overview",
        "tabModules": "Modules",
        "tabKeys": "Access Keys",
        "tabProvisioning": "Provisioning"
      },
      "actions": {
        "suspend": "Suspend Tenant",
        "reactivate": "Reactivate",
        "provision": "Run Provisioning",
        "retryProvision": "Retry Provisioning"
      },
      "messages": {
        "created": "Tenant created and provisioning started.",
        "suspended": "Tenant suspended.",
        "reactivated": "Tenant reactivated.",
        "moduleToggled": "Module updated."
      }
    },
    "subscriptions": {
      "title": "Subscription Packages",
      "free": "Free",
      "pro": "Pro",
      "enterprise": "Enterprise"
    }
  }
}
```

---

## 14. Testing Checklist

### Component Tests

| Test | Page |
|------|------|
| `TenantListComponent should render tenants` | Tenant Directory |
| `TenantListComponent should filter by status` | Tenant Directory |
| `TenantCreateComponent should validate slug uniqueness` | Create Wizard |
| `TenantCreateComponent should complete 3-step wizard` | Create Wizard |
| `TenantDetailComponent should show module toggles` | Tenant Detail |

### E2E Tests

| Test | Scenario |
|------|----------|
| `SuperAdmin login` | Login → dashboard shows tenant stats |
| `Create tenant` | Wizard → provisioning starts → detail shows progress |
| `Suspend tenant` | Active tenant → suspend → status changes to Suspended |
| `Toggle module` | Disable projects module → slide toggle updates |
| `Non-SuperAdmin denied` | OrgAdmin tries platform-console → 403 |

---

## 15. Complete File Index

| File | Action |
|------|--------|
| `apps/platform-console/src/app/app.config.ts` | Create |
| `apps/platform-console/src/app/app.routes.ts` | Create |
| `apps/platform-console/src/app/layouts/admin-layout/admin-layout.component.ts` | Create |
| `apps/platform-console/src/app/layouts/admin-layout/admin-layout.component.scss` | Create |
| `apps/platform-console/src/app/layouts/auth-layout/auth-layout.component.ts` | Create |
| `apps/platform-console/src/app/pages/dashboard/dashboard.component.ts` | Create |
| `apps/platform-console/src/app/pages/tenant-list/tenant-list.component.ts` | Create |
| `apps/platform-console/src/app/pages/tenant-create/tenant-create.component.ts` | Create |
| `apps/platform-console/src/app/pages/tenant-detail/tenant-detail.component.ts` | Create |
| `apps/platform-console/src/app/pages/subscriptions/subscriptions.component.ts` | Create |
| `apps/platform-console/src/app/services/tenant.service.ts` | Create |
| `apps/platform-console/src/app/store/tenant.actions.ts` | Create |
| `apps/platform-console/src/app/store/tenant.reducer.ts` | Create |
| `apps/platform-console/src/app/store/tenant.effects.ts` | Create |
| `apps/platform-console/src/app/store/tenant.selectors.ts` | Create |
| `apps/platform-console/src/app/models/tenant.model.ts` | Create |
| `apps/platform-console/src/assets/i18n/en.json` | Create |
| `apps/platform-console/src/assets/i18n/am.json` | Create |

**Total: ~18 files for PlatformAdmin frontend**

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `frontend/FRONTEND-OVERVIEW.md` | Nx workspace, app config pattern |
| `shared/SHARED-COMPONENTS.md` | DataTable, PageHeader, StatusBadge, ConfirmDialog |
| `shared/AUTHENTICATION.md` | AuthGuard, auth store for SuperAdmin login |
| `backend/platformadmin/PLATFORMADMIN-BACKEND.md` | API endpoints, DTO shapes |
