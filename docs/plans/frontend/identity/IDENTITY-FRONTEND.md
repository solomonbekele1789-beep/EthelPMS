# EthelPMS — Identity Module Frontend Plan

**Version:** 1.0
**Date:** October 17, 2026
**Owner:** Developer B (Frontend lead)
**Phase:** 1 (Weeks 3-4)

> Covers: Login/auth pages, main layout, user/role/office/location management, theme, calendar, i18n.
> Prerequisites: Phase 0B shared infrastructure (guards, interceptors, NgRx setup, shared components).
> Cross-references: `shared/AUTHENTICATION.md`, `shared/AUTHORIZATION-RBAC.md`, `shared/SHARED-COMPONENTS.md`

---

## 1. Requirements Covered

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-AUTH-001–006 | Login, logout, refresh, password setup/forgot/reset UI | Must |
| REQ-AUTH-007 | Mobile detection (X-Client-Type header) | Must |
| REQ-AUTH-011 | Branded email template links (setup/reset password pages) | Should |
| REQ-RBAC-001–008 | Role/permission management UI, permission tree, role templates | Must |
| REQ-ORG-001–010 | Organization profile/settings page | Must |
| REQ-GEO-001–005 | Ethiopian geography cascade selector | Must |
| REQ-LOC-001–003 | Office CRUD, location assignment | Must |
| REQ-THEME-001 | Dark/light theme toggle | Must |
| REQ-I18N-001 | EN/AM language toggle | Must |

---

## 2. Page Inventory

| Page | Route | Guard | Permission |
|------|-------|-------|-----------|
| Login | `/auth/login` | — (public) | — |
| Setup Password | `/auth/setup-password` | — (public) | — |
| Forgot Password | `/auth/forgot-password` | — (public) | — |
| Reset Password | `/auth/reset-password` | — (public) | — |
| Dashboard | `/dashboard` | authGuard | — |
| User List | `/users` | authGuard + permissionGuard | `identity.users.read` |
| User Create | `/users/create` | authGuard + permissionGuard | `identity.users.create` |
| User Detail | `/users/:id` | authGuard + permissionGuard | `identity.users.read` |
| Role List | `/roles` | authGuard + permissionGuard | `identity.roles.read` |
| Role Detail | `/roles/:id` | authGuard + permissionGuard | `identity.roles.read` |
| Role Create | `/roles/create` | authGuard + permissionGuard | `identity.roles.create` |
| Office List | `/offices` | authGuard + permissionGuard | `identity.offices.read` |
| Office Detail | `/offices/:id` | authGuard + permissionGuard | `identity.offices.read` |
| Office Create | `/offices/create` | authGuard + permissionGuard | `identity.offices.create` |
| Location List | `/locations` | authGuard | — (reference data, read-only for most) |
| Organization Settings | `/settings/organization` | authGuard + permissionGuard | `orgsetup.organization.read` |
| Unauthorized | `/unauthorized` | authGuard | — |

---

## 3. Auth Pages (Auth Layout)

### 3.1 Login Page

**File:** `libs/modules/identity/src/lib/pages/login/login.component.ts`

```typescript
@Component({
  selector: 'identity-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule, RouterLink],
  template: `
    <div class="login-container">
      <img src="assets/logo.svg" alt="EthelPMS" class="logo" />
      <h1>{{ 'auth.login.title' | translate }}</h1>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'auth.login.email' | translate }}</mat-label>
          <input matInput formControlName="email" type="email" autocomplete="email" />
          <mat-error>{{ 'validation.emailRequired' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'auth.login.password' | translate }}</mat-label>
          <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'" />
          <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" class="full-width"
                [disabled]="form.invalid || isLoading()">
          @if (isLoading()) { <mat-spinner diameter="20"></mat-spinner> }
          @else { {{ 'auth.login.submit' | translate }} }
        </button>
      </form>

      <a [routerLink]="['/auth/forgot-password']" class="forgot-link">
        {{ 'auth.login.forgotPassword' | translate }}
      </a>
    </div>
  `
})
export default class LoginComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  hidePassword = signal(true);
  isLoading = this.store.selectSignal(selectIsLoading);
  error = this.store.selectSignal(selectAuthError);

  onSubmit(): void {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      this.store.dispatch(AuthActions.login({ email, password }));
    }
  }
}
```

### 3.2 Setup Password Page

**File:** `libs/modules/identity/src/lib/pages/setup-password/setup-password.component.ts`

Receives `?token=...` query param. Form with password + confirmPassword. Calls `POST /api/v1/auth/setup-password`. On success redirects to `/auth/login` with success message.

### 3.3 Forgot Password Page

**File:** `libs/modules/identity/src/lib/pages/forgot-password/forgot-password.component.ts`

Email-only form. Calls `POST /api/v1/auth/forgot-password`. Always shows "If an account exists, we sent a reset link" to prevent user enumeration.

### 3.4 Reset Password Page

**File:** `libs/modules/identity/src/lib/pages/reset-password/reset-password.component.ts`

Receives `?token=...` query param. Form with password + confirmPassword. Calls `POST /api/v1/auth/reset-password`. On success redirects to `/auth/login`.

---

## 4. Main Layout

### 4.1 Layout Component

**File:** `apps/web/src/app/layouts/main-layout/main-layout.component.ts`

```typescript
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule,
            MatMenuModule, MatButtonModule, TranslateModule, HasPermissionDirective, LanguageToggleComponent],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav [mode]="sidenavMode()" [opened]="sidenavOpened()" class="sidebar">
        <div class="sidebar-header">
          <img src="assets/logo-icon.svg" alt="EthelPMS" />
          <span class="org-name">{{ orgName() }}</span>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span>{{ 'nav.dashboard' | translate }}</span>
          </a>

          @for (item of menuItems(); track item.route) {
            @if (item.permission) {
              <a mat-list-item *hasPermission="item.permission"
                 [routerLink]="item.route" routerLinkActive="active">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span>{{ item.label | translate }}</span>
              </a>
            } @else {
              <a mat-list-item [routerLink]="item.route" routerLinkActive="active">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span>{{ item.label | translate }}</span>
              </a>
            }
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="topbar">
          <button mat-icon-button (click)="toggleSidenav()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          <app-language-toggle />
          <button mat-icon-button (click)="toggleTheme()">
            <mat-icon>{{ isDarkTheme() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info-header">
              <strong>{{ userName() }}</strong>
              <span>{{ userEmail() }}</span>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> {{ 'auth.logout' | translate }}
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export default class MainLayoutComponent {
  private store = inject(Store);
  private themeService = inject(ThemeService);

  sidenavOpened = signal(true);
  sidenavMode = signal<'side' | 'over'>('side');
  isDarkTheme = computed(() => this.themeService.currentTheme() === 'dark');

  user = this.store.selectSignal(selectUser);
  orgName = computed(() => this.user()?.organizationName ?? 'EthelPMS');
  userName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });
  userEmail = computed(() => this.user()?.email ?? '');

  menuItems = signal<MenuItem[]>([
    { route: '/users', icon: 'people', label: 'nav.users', permission: 'identity.users.read' },
    { route: '/roles', icon: 'admin_panel_settings', label: 'nav.roles', permission: 'identity.roles.read' },
    { route: '/offices', icon: 'business', label: 'nav.offices', permission: 'identity.offices.read' },
    { route: '/locations', icon: 'location_on', label: 'nav.locations', permission: null },
    { route: '/settings/organization', icon: 'settings', label: 'nav.orgSettings', permission: 'orgsetup.organization.read' },
    // Phase 2+ items added as modules are built
  ]);

  toggleSidenav(): void { this.sidenavOpened.update(v => !v); }
  toggleTheme(): void { this.themeService.toggle(); }
  logout(): void { this.store.dispatch(AuthActions.logout()); }
}

interface MenuItem {
  route: string;
  icon: string;
  label: string;
  permission: string | null;
}
```

### 4.2 Auth Layout

**File:** `apps/web/src/app/layouts/auth-layout/auth-layout.component.ts`

Centered card layout, no sidebar. Logo at top, `<router-outlet>` in a card, footer with version.

---

## 5. User Management Pages

### 5.1 User List

**File:** `libs/modules/identity/src/lib/pages/user-list/user-list.component.ts`

```typescript
@Component({
  selector: 'identity-user-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent, StatusBadgeComponent,
            MatButtonModule, MatIconModule, RouterLink, TranslateModule, HasPermissionDirective],
  template: `
    <app-page-header [title]="'users.list.title' | translate"
                     [subtitle]="'users.list.subtitle' | translate">
      <button mat-raised-button color="primary" routerLink="create" *hasPermission="'identity.users.create'">
        <mat-icon>person_add</mat-icon> {{ 'users.list.createButton' | translate }}
      </button>
    </app-page-header>

    <app-data-table
      [columns]="columns"
      [data]="users()"
      [totalCount]="totalCount()"
      [loading]="loading()"
      [pageIndex]="pageIndex()"
      [pageSize]="pageSize()"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (rowClick)="onRowClick($event)">
    </app-data-table>
  `
})
export default class UserListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  users = this.store.selectSignal(selectUsers);
  totalCount = this.store.selectSignal(selectUserTotalCount);
  loading = this.store.selectSignal(selectUsersLoading);
  pageIndex = signal(0);
  pageSize = signal(20);

  columns: TableColumn[] = [
    { key: 'fullName', label: 'users.fields.fullName', sortable: true },
    { key: 'email', label: 'users.fields.email', sortable: true },
    { key: 'roles', label: 'users.fields.roles', type: 'chips' },
    { key: 'officeName', label: 'users.fields.office' },
    { key: 'isActive', label: 'users.fields.status', type: 'status-badge',
      statusMap: { true: { label: 'Active', color: 'success' }, false: { label: 'Inactive', color: 'danger' } } },
    { key: 'createdAt', label: 'common.createdAt', type: 'date', sortable: true },
  ];

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers({ page: 1, pageSize: 20 }));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.store.dispatch(UserActions.loadUsers({ page: event.pageIndex + 1, pageSize: event.pageSize }));
  }

  onSortChange(event: SortEvent): void {
    this.store.dispatch(UserActions.loadUsers({
      page: this.pageIndex() + 1, pageSize: this.pageSize(),
      sortBy: event.active, sortDirection: event.direction
    }));
  }

  onRowClick(user: UserListItemDto): void {
    this.router.navigate(['/users', user.id]);
  }
}
```

### 5.2 User Create

**File:** `libs/modules/identity/src/lib/pages/user-create/user-create.component.ts`

Reactive form with fields: email, firstName, lastName, phone, officeId (dropdown from OfficeService), roleIds (multi-select from RoleService). Dispatches `UserActions.createUser(...)`. On success, navigates back to list with toast.

```typescript
form = this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  firstName: ['', Validators.required],
  lastName: ['', Validators.required],
  phone: [''],
  officeId: [null as string | null],
  roleIds: [[] as string[], Validators.required]
});
```

### 5.3 User Detail

**File:** `libs/modules/identity/src/lib/pages/user-detail/user-detail.component.ts`

Tabs: Profile (editable form), Roles (assign/remove), Activity (audit log, Phase 2+). Shows StatusBadge for active/inactive. Deactivate/activate buttons conditionally visible.

---

## 6. Role Management Pages

### 6.1 Role List

**File:** `libs/modules/identity/src/lib/pages/role-list/role-list.component.ts`

DataTable with columns: name, description, permissionCount, userCount, isSystemRole. System roles show a lock icon and cannot be edited/deleted.

### 6.2 Role Create / Edit

**File:** `libs/modules/identity/src/lib/pages/role-detail/role-detail.component.ts`

Form with name, description. Permission tree organized by module:

```typescript
// Permission tree structure
interface PermissionGroup {
  module: string;
  permissions: {
    id: string;
    code: string;
    displayName: string;
    checked: boolean;
  }[];
  allChecked: boolean;
  someChecked: boolean;
}
```

The tree uses `mat-checkbox` with indeterminate state. "Select All" per module header. Save dispatches `RoleActions.createRole(...)` or `RoleActions.updateRole(...)`.

---

## 7. Office Management Pages

### 7.1 Office List

DataTable with columns: name, code, parentOfficeName, locationName, userCount. Supports tree view toggle showing parent→child hierarchy.

### 7.2 Office Create / Edit

Form with: name, code, parentOfficeId (dropdown of existing offices), locationId (cascade selector component from `shared/ui`).

```typescript
form = this.fb.nonNullable.group({
  name: ['', Validators.required],
  code: ['', Validators.required],
  parentOfficeId: [null as string | null],
  locationId: [null as string | null]
});
```

Uses `<app-location-cascade-selector>` from `shared/SHARED-COMPONENTS.md` which loads regions → zones → woredas → kebeles from the API.

---

## 8. Location Management Page

### 8.1 Location List

**File:** `libs/modules/identity/src/lib/pages/location-list/location-list.component.ts`

Read-only reference data view. Four-level tree display using `mat-tree`:

```
Region: Amhara
├── Zone: South Gondar
│   ├── Woreda: Dera
│   │   ├── Kebele: 01
│   │   └── Kebele: 02
│   └── Woreda: Fogera
└── Zone: North Shewa
```

Search/filter by name. Shows both English and Amharic names. No CRUD for Phase 1 (locations are seeded reference data).

---

## 9. Organization Settings Page

**File:** `libs/modules/identity/src/lib/pages/organization-settings/organization-settings.component.ts`

Form with: name, timezone, calendarPreference (Gregorian/Ethiopian dropdown), logoUrl (image upload). Dispatches `OrgActions.updateOrganization(...)`.

---

## 10. NgRx Feature Stores

### 10.1 Users Store

**Files:** `libs/modules/identity/src/lib/store/user.actions.ts`, `user.reducer.ts`, `user.effects.ts`, `user.selectors.ts`

```typescript
// user.actions.ts
export const UserActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': props<{ page: number; pageSize: number; search?: string; sortBy?: string; sortDirection?: string }>(),
    'Load Users Success': props<{ users: UserListItemDto[]; totalCount: number }>(),
    'Load Users Failure': props<{ error: string }>(),
    'Load User': props<{ id: string }>(),
    'Load User Success': props<{ user: UserDto }>(),
    'Load User Failure': props<{ error: string }>(),
    'Create User': props<{ request: CreateUserRequest }>(),
    'Create User Success': props<{ user: UserDto }>(),
    'Create User Failure': props<{ error: string }>(),
    'Update User': props<{ id: string; request: UpdateUserRequest }>(),
    'Update User Success': props<{ user: UserDto }>(),
    'Update User Failure': props<{ error: string }>(),
    'Deactivate User': props<{ id: string }>(),
    'Deactivate User Success': props<{ id: string }>(),
    'Activate User': props<{ id: string }>(),
    'Activate User Success': props<{ id: string }>(),
  }
});

// user.reducer.ts
export interface UserState {
  users: UserListItemDto[];
  totalCount: number;
  selectedUser: UserDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  totalCount: 0,
  selectedUser: null,
  loading: false,
  error: null
};

export const userReducer = createReducer(
  initialState,
  on(UserActions.loadUsers, state => ({ ...state, loading: true })),
  on(UserActions.loadUsersSuccess, (state, { users, totalCount }) => ({
    ...state, users, totalCount, loading: false, error: null
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),
  on(UserActions.loadUserSuccess, (state, { user }) => ({
    ...state, selectedUser: user
  })),
  on(UserActions.createUserSuccess, state => ({
    ...state  // list will be reloaded
  })),
  on(UserActions.deactivateUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.map(u => u.id === id ? { ...u, isActive: false } : u)
  })),
  on(UserActions.activateUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.map(u => u.id === id ? { ...u, isActive: true } : u)
  }))
);
```

```typescript
// user.effects.ts
@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);
  private router = inject(Router);
  private toast = inject(NotificationToastService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(({ page, pageSize, search, sortBy, sortDirection }) =>
        this.userService.listUsers(page, pageSize, search, sortBy, sortDirection).pipe(
          map(response => UserActions.loadUsersSuccess({ users: response.data, totalCount: response.totalCount })),
          catchError(error => of(UserActions.loadUsersFailure({ error: error.message })))
        )
      )
    )
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser),
      switchMap(({ id }) =>
        this.userService.getUser(id).pipe(
          map(user => UserActions.loadUserSuccess({ user })),
          catchError(error => of(UserActions.loadUserFailure({ error: error.message })))
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      exhaustMap(({ request }) =>
        this.userService.createUser(request).pipe(
          map(user => UserActions.createUserSuccess({ user })),
          tap(() => {
            this.toast.success('users.messages.created');
            this.router.navigate(['/users']);
          }),
          catchError(error => of(UserActions.createUserFailure({ error: error.message })))
        )
      )
    )
  );

  deactivateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deactivateUser),
      exhaustMap(({ id }) =>
        this.userService.deactivateUser(id).pipe(
          map(() => UserActions.deactivateUserSuccess({ id })),
          tap(() => this.toast.success('users.messages.deactivated')),
          catchError(error => of(UserActions.loadUserFailure({ error: error.message })))
        )
      )
    )
  );
}
```

### 10.2 Roles Store

Same pattern as Users. Actions: `loadRoles`, `loadRole`, `createRole`, `updateRole`, `deleteRole`, `loadPermissions`.

### 10.3 Offices Store

Same pattern. Actions: `loadOffices`, `loadOffice`, `createOffice`, `updateOffice`, `deleteOffice`.

---

## 11. HTTP Services

### 11.1 UserService

**File:** `libs/modules/identity/src/lib/services/user.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  listUsers(page: number, pageSize: number, search?: string,
            sortBy?: string, sortDirection?: string): Observable<PagedResponse<UserListItemDto>> {
    const params = { page, pageSize, ...(search && { search }), ...(sortBy && { sortBy, sortDirection }) };
    return this.api.get<PagedResponse<UserListItemDto>>('/users', params);
  }

  getUser(id: string): Observable<UserDto> {
    return this.api.get<UserDto>(`/users/${id}`);
  }

  getCurrentUser(): Observable<CurrentUserDto> {
    return this.api.get<CurrentUserDto>('/users/me');
  }

  createUser(request: CreateUserRequest): Observable<UserDto> {
    return this.api.post<UserDto>('/users', request);
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<UserDto> {
    return this.api.put<UserDto>(`/users/${id}`, request);
  }

  deactivateUser(id: string): Observable<void> {
    return this.api.post<void>(`/users/${id}/deactivate`, {});
  }

  activateUser(id: string): Observable<void> {
    return this.api.post<void>(`/users/${id}/activate`, {});
  }

  assignRole(userId: string, roleId: string): Observable<void> {
    return this.api.post<void>(`/users/${userId}/roles`, { roleId });
  }

  removeRole(userId: string, roleId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}/roles/${roleId}`);
  }
}
```

### 11.2 RoleService

```typescript
@Injectable({ providedIn: 'root' })
export class RoleService {
  private api = inject(ApiService);

  listRoles(page: number, pageSize: number, search?: string): Observable<PagedResponse<RoleListItemDto>> {
    return this.api.get<PagedResponse<RoleListItemDto>>('/roles', { page, pageSize, ...(search && { search }) });
  }
  getRole(id: string): Observable<RoleDto> { return this.api.get<RoleDto>(`/roles/${id}`); }
  listPermissions(module?: string): Observable<PermissionDto[]> {
    return this.api.get<PermissionDto[]>('/roles/permissions', module ? { module } : {});
  }
  createRole(request: CreateRoleRequest): Observable<RoleDto> { return this.api.post<RoleDto>('/roles', request); }
  updateRole(id: string, request: UpdateRoleRequest): Observable<RoleDto> { return this.api.put<RoleDto>(`/roles/${id}`, request); }
  deleteRole(id: string): Observable<void> { return this.api.delete<void>(`/roles/${id}`); }
}
```

### 11.3 OfficeService

```typescript
@Injectable({ providedIn: 'root' })
export class OfficeService {
  private api = inject(ApiService);
  listOffices(page: number, pageSize: number, search?: string): Observable<PagedResponse<OfficeListItemDto>> { ... }
  getOffice(id: string): Observable<OfficeDto> { ... }
  createOffice(request: CreateOfficeRequest): Observable<OfficeDto> { ... }
  updateOffice(id: string, request: UpdateOfficeRequest): Observable<OfficeDto> { ... }
  deleteOffice(id: string): Observable<void> { ... }
}
```

### 11.4 LocationService

```typescript
@Injectable({ providedIn: 'root' })
export class LocationService {
  private api = inject(ApiService);
  getRegions(): Observable<LocationDto[]> { return this.api.get<LocationDto[]>('/locations/regions'); }
  getZones(regionId: string): Observable<LocationDto[]> { return this.api.get<LocationDto[]>(`/locations/regions/${regionId}/zones`); }
  getWoredas(zoneId: string): Observable<LocationDto[]> { return this.api.get<LocationDto[]>(`/locations/zones/${zoneId}/woredas`); }
  getKebeles(woredaId: string): Observable<LocationDto[]> { return this.api.get<LocationDto[]>(`/locations/woredas/${woredaId}/kebeles`); }
}
```

### 11.5 OrganizationService

```typescript
@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private api = inject(ApiService);
  getOrganization(): Observable<OrganizationDto> { return this.api.get<OrganizationDto>('/organizations'); }
  updateOrganization(request: UpdateOrganizationRequest): Observable<OrganizationDto> {
    return this.api.put<OrganizationDto>('/organizations', request);
  }
}
```

---

## 12. TypeScript Models

**File:** `libs/modules/identity/src/lib/models/`

```typescript
// user.model.ts
export interface UserDto {
  id: string; email: string; firstName: string; lastName: string;
  phone: string | null; isActive: boolean; emailConfirmed: boolean;
  officeId: string | null; officeName: string | null;
  roles: string[]; createdAt: string;
}
export interface UserListItemDto {
  id: string; email: string; fullName: string; isActive: boolean;
  officeName: string | null; roles: string[]; createdAt: string;
}
export interface CurrentUserDto {
  id: string; email: string; firstName: string; lastName: string;
  organizationId: string; organizationName: string;
  permissions: string[]; roles: string[]; tenant: TenantInfoDto | null;
}
export interface CreateUserRequest {
  email: string; firstName: string; lastName: string;
  phone?: string; officeId?: string; roleIds: string[];
}
export interface UpdateUserRequest {
  firstName: string; lastName: string;
  phone?: string; officeId?: string; isActive: boolean;
}

// role.model.ts
export interface RoleDto {
  id: string; name: string; description: string | null; isSystemRole: boolean;
  permissions: PermissionDto[]; createdAt: string;
}
export interface RoleListItemDto {
  id: string; name: string; description: string | null;
  isSystemRole: boolean; permissionCount: number; userCount: number;
}
export interface PermissionDto {
  id: string; code: string; displayName: string;
  module: string; resource: string; action: string;
}
export interface CreateRoleRequest { name: string; description?: string; permissionIds: string[]; }
export interface UpdateRoleRequest { name: string; description?: string; permissionIds: string[]; }

// office.model.ts
export interface OfficeDto {
  id: string; name: string; code: string;
  parentOfficeId: string | null; parentOfficeName: string | null;
  locationId: string | null; locationName: string | null;
}
export interface OfficeListItemDto {
  id: string; name: string; code: string;
  parentOfficeName: string | null; userCount: number;
}
export interface CreateOfficeRequest { name: string; code: string; parentOfficeId?: string; locationId?: string; }

// location.model.ts
export interface LocationDto { id: string; name: string; nameAm: string | null; level: string; parentId: string | null; }

// organization.model.ts
export interface OrganizationDto {
  id: string; name: string; slug: string; logoUrl: string | null;
  timezone: string; calendarPreference: string; userCount: number; officeCount: number;
}
export interface UpdateOrganizationRequest {
  name: string; logoUrl?: string; timezone?: string; calendarPreference?: string;
}
```

---

## 13. Route Configuration

**File:** `libs/modules/identity/src/lib/routes.ts`

```typescript
import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { userReducer } from './store/user.reducer';
import { UserEffects } from './store/user.effects';
import { roleReducer } from './store/role.reducer';
import { RoleEffects } from './store/role.effects';
import { officeReducer } from './store/office.reducer';
import { OfficeEffects } from './store/office.effects';

export const userRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState('users', userReducer),
      provideEffects([UserEffects])
    ],
    children: [
      { path: '', loadComponent: () => import('./pages/user-list/user-list.component') },
      { path: 'create', loadComponent: () => import('./pages/user-create/user-create.component'),
        canActivate: [permissionGuard('identity.users.create')] },
      { path: ':id', loadComponent: () => import('./pages/user-detail/user-detail.component') },
    ]
  }
];

export const roleRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState('roles', roleReducer),
      provideEffects([RoleEffects])
    ],
    children: [
      { path: '', loadComponent: () => import('./pages/role-list/role-list.component') },
      { path: 'create', loadComponent: () => import('./pages/role-detail/role-detail.component'),
        canActivate: [permissionGuard('identity.roles.create')] },
      { path: ':id', loadComponent: () => import('./pages/role-detail/role-detail.component') },
    ]
  }
];

export const officeRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState('offices', officeReducer),
      provideEffects([OfficeEffects])
    ],
    children: [
      { path: '', loadComponent: () => import('./pages/office-list/office-list.component') },
      { path: 'create', loadComponent: () => import('./pages/office-detail/office-detail.component'),
        canActivate: [permissionGuard('identity.offices.create')] },
      { path: ':id', loadComponent: () => import('./pages/office-detail/office-detail.component') },
    ]
  }
];

export const locationRoutes: Routes = [
  { path: '', loadComponent: () => import('./pages/location-list/location-list.component') },
];
```

---

## 14. Public API (index.ts)

**File:** `libs/modules/identity/src/index.ts`

```typescript
// Pages (for lazy loading in app.routes.ts)
export { default as LoginComponent } from './lib/pages/login/login.component';
export { default as SetupPasswordComponent } from './lib/pages/setup-password/setup-password.component';
export { default as ForgotPasswordComponent } from './lib/pages/forgot-password/forgot-password.component';
export { default as ResetPasswordComponent } from './lib/pages/reset-password/reset-password.component';
export { default as OrganizationSettingsComponent } from './lib/pages/organization-settings/organization-settings.component';

// Routes
export { userRoutes, roleRoutes, officeRoutes, locationRoutes } from './lib/routes';

// Services (for use by other modules if needed)
export { UserService } from './lib/services/user.service';
export { RoleService } from './lib/services/role.service';
export { OfficeService } from './lib/services/office.service';
export { LocationService } from './lib/services/location.service';
export { OrganizationService } from './lib/services/organization.service';

// Models
export * from './lib/models/user.model';
export * from './lib/models/role.model';
export * from './lib/models/office.model';
export * from './lib/models/location.model';
export * from './lib/models/organization.model';
```

---

## 15. i18n Keys Added

### `en.json` additions

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "users": "Users",
    "roles": "Roles",
    "offices": "Offices",
    "locations": "Locations",
    "orgSettings": "Organization Settings"
  },
  "auth": {
    "login": { "title": "Sign in to EthelPMS", "email": "Email address", "password": "Password",
               "submit": "Sign In", "forgotPassword": "Forgot your password?" },
    "setupPassword": { "title": "Set Up Your Password", "submit": "Set Password" },
    "forgotPassword": { "title": "Forgot Password", "submit": "Send Reset Link",
                        "successMessage": "If an account with that email exists, we sent a password reset link." },
    "resetPassword": { "title": "Reset Password", "submit": "Reset Password" },
    "logout": "Sign Out"
  },
  "users": {
    "list": { "title": "User Management", "subtitle": "Manage your organization's users", "createButton": "New User" },
    "create": { "title": "Create User", "invitationNote": "An invitation email will be sent to the user." },
    "detail": { "title": "User Details", "tabProfile": "Profile", "tabRoles": "Roles", "tabActivity": "Activity" },
    "fields": { "firstName": "First Name", "lastName": "Last Name", "email": "Email",
                "phone": "Phone", "office": "Office", "fullName": "Full Name", "status": "Status", "roles": "Roles" },
    "messages": { "created": "User created successfully. Invitation email sent.",
                  "updated": "User updated.", "deactivated": "User deactivated.", "activated": "User activated." }
  },
  "roles": {
    "list": { "title": "Role Management", "createButton": "New Role" },
    "detail": { "title": "Role Details" },
    "fields": { "name": "Role Name", "description": "Description", "permissions": "Permissions",
                "permissionCount": "Permissions", "userCount": "Assigned Users", "systemRole": "System Role" },
    "messages": { "created": "Role created.", "updated": "Role updated.", "deleted": "Role deleted." }
  },
  "offices": {
    "list": { "title": "Office Management", "createButton": "New Office" },
    "fields": { "name": "Office Name", "code": "Code", "parentOffice": "Parent Office",
                "location": "Location", "userCount": "Users" },
    "messages": { "created": "Office created.", "updated": "Office updated.", "deleted": "Office deleted." }
  },
  "locations": {
    "list": { "title": "Locations", "subtitle": "Ethiopian administrative geography reference data" }
  },
  "organization": {
    "settings": { "title": "Organization Settings", "nameLabel": "Organization Name",
                  "timezoneLabel": "Timezone", "calendarLabel": "Calendar Preference",
                  "logoLabel": "Organization Logo" },
    "messages": { "updated": "Organization settings updated." }
  },
  "validation": {
    "emailRequired": "Email is required",
    "emailInvalid": "Enter a valid email address",
    "passwordRequired": "Password is required",
    "passwordMin": "Password must be at least 8 characters",
    "passwordMismatch": "Passwords do not match",
    "required": "This field is required"
  }
}
```

### `am.json` — same structure with Amharic translations

The Amharic JSON follows the identical key structure. Developer B fills in translations during implementation with Ethiopian language review.

---

## 16. Testing Checklist

### Component Tests (Vitest)

| Test | Page |
|------|------|
| `LoginComponent should render form and submit` | Login |
| `LoginComponent should show error on failed login` | Login |
| `UserListComponent should render data table` | User List |
| `UserListComponent should dispatch loadUsers on init` | User List |
| `UserCreateComponent should validate email` | User Create |
| `RoleDetailComponent should render permission tree` | Role Detail |
| `OfficeDetailComponent should render location cascade` | Office Detail |
| `MainLayoutComponent should show menu items per permissions` | Layout |

### E2E Tests (Playwright)

| Test | Scenario |
|------|----------|
| `Login flow` | Enter credentials → redirect to dashboard → verify user menu |
| `Failed login` | Wrong password → error message shown |
| `Permission denied` | Navigate to /users without permission → redirected to /unauthorized |
| `User CRUD` | Create user → appears in list → edit → deactivate → reactivate |
| `Role CRUD` | Create role with permissions → assign to user → verify access |
| `Theme toggle` | Switch dark/light → verify CSS custom properties applied |
| `Language toggle` | Switch EN/AM → verify labels change |
| `Location cascade` | Select region → zones load → select zone → woredas load |

---

## 17. Complete File Index

| File | Action |
|------|--------|
| `pages/login/login.component.ts` | Create |
| `pages/login/login.component.scss` | Create |
| `pages/setup-password/setup-password.component.ts` | Create |
| `pages/forgot-password/forgot-password.component.ts` | Create |
| `pages/reset-password/reset-password.component.ts` | Create |
| `pages/user-list/user-list.component.ts` | Create |
| `pages/user-create/user-create.component.ts` | Create |
| `pages/user-detail/user-detail.component.ts` | Create |
| `pages/role-list/role-list.component.ts` | Create |
| `pages/role-detail/role-detail.component.ts` | Create |
| `pages/office-list/office-list.component.ts` | Create |
| `pages/office-detail/office-detail.component.ts` | Create |
| `pages/location-list/location-list.component.ts` | Create |
| `pages/organization-settings/organization-settings.component.ts` | Create |
| `services/user.service.ts` | Create |
| `services/role.service.ts` | Create |
| `services/office.service.ts` | Create |
| `services/location.service.ts` | Create |
| `services/organization.service.ts` | Create |
| `store/user.actions.ts` | Create |
| `store/user.reducer.ts` | Create |
| `store/user.effects.ts` | Create |
| `store/user.selectors.ts` | Create |
| `store/role.actions.ts` | Create |
| `store/role.reducer.ts` | Create |
| `store/role.effects.ts` | Create |
| `store/role.selectors.ts` | Create |
| `store/office.actions.ts` | Create |
| `store/office.reducer.ts` | Create |
| `store/office.effects.ts` | Create |
| `store/office.selectors.ts` | Create |
| `models/user.model.ts` | Create |
| `models/role.model.ts` | Create |
| `models/office.model.ts` | Create |
| `models/location.model.ts` | Create |
| `models/organization.model.ts` | Create |
| `routes.ts` | Create |
| `index.ts` (public API) | Create |
| `apps/web/src/app/layouts/main-layout/main-layout.component.ts` | Create |
| `apps/web/src/app/layouts/main-layout/main-layout.component.scss` | Create |
| `apps/web/src/app/layouts/auth-layout/auth-layout.component.ts` | Create |
| `apps/web/src/app/layouts/auth-layout/auth-layout.component.scss` | Create |
| `apps/web/src/assets/i18n/en.json` | Update |
| `apps/web/src/assets/i18n/am.json` | Update |

**Total: ~43 files for Identity frontend**

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `frontend/FRONTEND-OVERVIEW.md` | Nx structure, app.config, routing strategy |
| `shared/AUTHENTICATION.md` | Auth NgRx store, interceptors, guards |
| `shared/AUTHORIZATION-RBAC.md` | Permission guard, directives |
| `shared/SHARED-COMPONENTS.md` | DataTable, PageHeader, StatusBadge, LocationCascadeSelector, ConfirmDialog, etc. |
| `shared/API-CONVENTIONS.md` | ApiService base class, pagination model |
| `backend/identity/IDENTITY-BACKEND.md` | API endpoints, DTO shapes |
