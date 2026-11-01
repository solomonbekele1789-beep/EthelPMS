import { Component, inject, OnInit, signal, input, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, StatusBadgeComponent, LoadingSpinnerComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { UserActions } from '../../store/user.actions';
import { selectSelectedUser, selectUsersLoading } from '../../store/user.selectors';
import { OfficeService } from '../../services/office.service';
import { UserService } from '../../services/user.service';
import { OfficeListItemDto } from '../../models/office.model';
import { RoleService } from '../../services/role.service';
import { RoleListItemDto } from '../../models/role.model';
import { UpdateUserRequest, UserListItemDto } from '../../models/user.model';

@Component({
  selector: 'ethel-user-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="userHeaderTitle()">
      @if (user()) {
        <app-status-badge [status]="user()!.isActive ? 'active' : 'inactive'" [label]="user()!.isActive ? 'Active' : 'Inactive'"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !user()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (user()) {
      <div class="user-header-card">
        <div class="user-avatar-container">
          @if (user()?.profilePhotoUrl) {
            <img [src]="user()!.profilePhotoUrl" alt="Profile photo" class="user-avatar-img" />
          } @else {
            <div class="avatar-fallback">
              <mat-icon>person</mat-icon>
            </div>
          }
        </div>
        <div class="user-info">
          <h2>{{ user()?.fullName || (user()!.firstName + ' ' + user()!.lastName) }}</h2>
          <p class="user-email"><mat-icon>email</mat-icon> {{ user()!.email }}</p>
          <div class="user-meta">
            @if (user()?.officeLevel) {
              <span class="meta-tag"><mat-icon>business</mat-icon> {{ user()!.officeLevel }}</span>
            }
            @if (user()?.region) {
              <span class="meta-tag"><mat-icon>place</mat-icon> {{ user()!.region }}</span>
            }
            @if (user()?.employeeId) {
              <span class="meta-tag"><mat-icon>badge</mat-icon> ID: {{ user()!.employeeId }}</span>
            }
            @if (user()?.managerName) {
              <span class="meta-tag"><mat-icon>supervisor_account</mat-icon> Reports to: {{ user()!.managerName }}</span>
            }
          </div>
        </div>
      </div>

      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="activeTab.set($event)">
        <mat-tab [label]="'users.detail.tabProfile' | translate">
          <div class="tab-content">
            <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
              <div class="form-sections">

                <div class="section-card">
                  <div class="section-title">
                    <mat-icon>person</mat-icon>
                    <span>Personal Information</span>
                  </div>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'users.fields.firstName' | translate }} *</mat-label>
                      <input matInput formControlName="firstName" />
                      @if (profileForm.controls.firstName.hasError('required')) {
                        <mat-error>First name is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Middle Name</mat-label>
                      <input matInput formControlName="middleName" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'users.fields.lastName' | translate }} *</mat-label>
                      <input matInput formControlName="lastName" />
                      @if (profileForm.controls.lastName.hasError('required')) {
                        <mat-error>Last name is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Date of Birth</mat-label>
                      <input matInput type="date" formControlName="dateOfBirth" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Sex</mat-label>
                      <mat-select formControlName="gender">
                        <mat-option value="">--Select Sex--</mat-option>
                        <mat-option value="Male">Male</mat-option>
                        <mat-option value="Female">Female</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'users.fields.phone' | translate }}</mat-label>
                      <input matInput formControlName="phone" />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Address</mat-label>
                      <input matInput formControlName="address" />
                    </mat-form-field>
                  </div>
                </div>

                <div class="section-card">
                  <div class="section-title">
                    <mat-icon>badge</mat-icon>
                    <span>Employment Information</span>
                  </div>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Employee ID</mat-label>
                      <input matInput formControlName="employeeId" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Employment Date (GC)</mat-label>
                      <input matInput type="date" formControlName="employmentDate" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Level of Education</mat-label>
                      <mat-select formControlName="levelOfEducation">
                        <mat-option value="">--Select Level--</mat-option>
                        @for (level of educationLevels; track level) {
                          <mat-option [value]="level">{{ level }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Qualification</mat-label>
                      <input matInput formControlName="qualification" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Basic Salary (ETB)</mat-label>
                      <input matInput type="number" formControlName="basicSalary" step="0.01" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Reports To (Manager)</mat-label>
                      <mat-select formControlName="managerId">
                        <mat-option value="">--Select Manager--</mat-option>
                        @for (m of managers(); track m.id) {
                          <mat-option [value]="m.id">{{ m.fullName }} ({{ m.email }})</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <div class="section-card">
                  <div class="section-title">
                    <mat-icon>place</mat-icon>
                    <span>Location & Office</span>
                  </div>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Region</mat-label>
                      <mat-select formControlName="region">
                        <mat-option value="">--Select Region--</mat-option>
                        @for (r of regions; track r) {
                          <mat-option [value]="r">{{ r }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Office Level</mat-label>
                      <mat-select formControlName="officeLevel">
                        <mat-option value="">--Select Office Level--</mat-option>
                        @for (lvl of officeLevels; track lvl) {
                          <mat-option [value]="lvl">{{ lvl }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'users.fields.office' | translate }}</mat-label>
                      <mat-select formControlName="officeId">
                        <mat-option value="">-- None --</mat-option>
                        @for (office of offices(); track office.id) {
                          <mat-option [value]="office.id">{{ office.name }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="goBack()">{{ 'common.back' | translate }}</button>
                <div class="spacer"></div>
                @if (user()!.isActive) {
                  <button mat-stroked-button color="warn" type="button" *appHasPermission="'identity.users.manage'" (click)="onDeactivate()">
                    <mat-icon>block</mat-icon> {{ 'users.actions.deactivate' | translate }}
                  </button>
                } @else {
                  <button mat-stroked-button color="primary" type="button" *appHasPermission="'identity.users.manage'" (click)="onActivate()">
                    <mat-icon>check_circle</mat-icon> {{ 'users.actions.activate' | translate }}
                  </button>
                }
                <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid || loading()">
                  {{ 'common.save' | translate }}
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <mat-tab [label]="'users.detail.tabRoles' | translate">
          <div class="tab-content">
            <h3>{{ 'users.detail.assignedRoles' | translate }}</h3>
            <mat-chip-set>
              @for (role of user()!.roles; track role) {
                <mat-chip (removed)="onRemoveRole(role)">
                  {{ role }}
                  <button matChipRemove *appHasPermission="'identity.users.manage'">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              }
            </mat-chip-set>

            <div class="role-assign" *appHasPermission="'identity.users.manage'">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'users.detail.addRole' | translate }}</mat-label>
                <mat-select #roleSelect>
                  @for (role of availableRoles(); track role.id) {
                    <mat-option [value]="role.id">{{ role.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-flat-button color="primary" (click)="onAssignRole(roleSelect.value); roleSelect.value = ''">
                {{ 'users.detail.assign' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <mat-tab [label]="'users.detail.tabActivity' | translate">
          <div class="tab-content">
            <div class="placeholder">
              <mat-icon>history</mat-icon>
              <p>{{ 'users.detail.activityComingSoon' | translate }}</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    :host { display: block; }
    .user-header-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .user-avatar-container {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #eff6ff;
      color: #2563eb;
    }
    .avatar-fallback mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    .user-info h2 {
      margin: 0 0 0.25rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
    }
    .user-email {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    .user-email mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .user-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #475569;
    }
    .meta-tag mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #2563eb;
    }
    .tab-content { padding: 1.5rem 0; }
    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .section-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .section-title mat-icon {
      color: #2563eb;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .spacer { flex: 1; }
    h3 { margin-bottom: 1rem; font-size: 1rem; font-weight: 500; }
    .role-assign {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--text-secondary, #666);
    }
    .placeholder mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 1rem; }
  `,
})
export default class UserDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly officeService = inject(OfficeService);
  private readonly roleService = inject(RoleService);
  private readonly userService = inject(UserService);

  readonly id = input.required<string>();

  readonly user = this.store.selectSignal(selectSelectedUser);
  readonly loading = this.store.selectSignal(selectUsersLoading);

  readonly userHeaderTitle = computed(() => {
    const u = this.user();
    if (!u) return 'User Detail';
    return u.fullName || `${u.firstName} ${u.lastName}`.trim() || 'User Detail';
  });

  readonly offices = signal<OfficeListItemDto[]>([]);
  readonly availableRoles = signal<RoleListItemDto[]>([]);
  readonly managers = signal<UserListItemDto[]>([]);
  readonly activeTab = signal(0);
  readonly profilePhotoUrl = signal<string | null>(null);

  readonly educationLevels = [
    'High School',
    'Diploma / TVET',
    "Bachelor's Degree",
    "Master's Degree",
    'Doctorate / PhD',
    'Other',
  ];

  readonly officeLevels = [
    'Head Office',
    'Area Office',
    'Branch Office',
  ];

  readonly regions = [
    'Addis Ababa',
    'Afar',
    'Amhara',
    'Benishangul-Gumuz',
    'Central Ethiopia',
    'Dire Dawa',
    'Gambela',
    'Harari',
    'Oromia',
    'Sidama',
    'Somali',
    'South Ethiopia',
    'South West Ethiopia Peoples',
    'Tigray',
  ];

  readonly profileForm = this.fb.group({
    firstName: ['', [Validators.required]],
    middleName: [''],
    lastName: ['', [Validators.required]],
    phone: [''],
    dateOfBirth: [''],
    gender: [''],
    address: [''],
    employeeId: [''],
    employmentDate: [''],
    levelOfEducation: [''],
    qualification: [''],
    basicSalary: [null as number | null],
    managerId: [''],
    region: [''],
    officeLevel: [''],
    officeId: [''],
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          middleName: user.middleName ?? '',
          lastName: user.lastName,
          phone: user.phone ?? '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '',
          gender: user.gender ?? '',
          address: user.address ?? '',
          employeeId: user.employeeId ?? '',
          employmentDate: user.employmentDate ? user.employmentDate.substring(0, 10) : '',
          levelOfEducation: user.levelOfEducation ?? '',
          qualification: user.qualification ?? '',
          basicSalary: user.basicSalary ?? null,
          managerId: user.managerId ?? '',
          region: user.region ?? '',
          officeLevel: user.officeLevel ?? '',
          officeId: user.officeId ?? '',
        });
        if (user.profilePhotoUrl) {
          this.profilePhotoUrl.set(user.profilePhotoUrl);
        }
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUser({ id: this.id() }));
    this.officeService.listOffices(1, 100).subscribe({
      next: (result) => this.offices.set(result.items),
      error: () => {},
    });
    this.roleService.listRoles(1, 100).subscribe({
      next: (result) => this.availableRoles.set(result.items),
      error: () => {},
    });
    this.userService.listUsers(1, 100).subscribe({
      next: (result) => this.managers.set(result.items),
      error: () => {},
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    const value = this.profileForm.getRawValue();
    const request: UpdateUserRequest = {
      firstName: value.firstName!.trim(),
      middleName: value.middleName?.trim() || undefined,
      lastName: value.lastName!.trim(),
      phone: value.phone?.trim() || undefined,
      dateOfBirth: value.dateOfBirth || undefined,
      gender: value.gender || undefined,
      address: value.address?.trim() || undefined,
      employeeId: value.employeeId?.trim() || undefined,
      employmentDate: value.employmentDate || undefined,
      levelOfEducation: value.levelOfEducation || undefined,
      qualification: value.qualification?.trim() || undefined,
      basicSalary: value.basicSalary != null ? Number(value.basicSalary) : undefined,
      managerId: value.managerId || undefined,
      profilePhotoUrl: this.profilePhotoUrl() || undefined,
      region: value.region || undefined,
      officeLevel: value.officeLevel || undefined,
      officeId: value.officeId || undefined,
      isActive: this.user()!.isActive,
    };
    this.store.dispatch(UserActions.updateUser({ id: this.id(), request }));
  }

  onDeactivate(): void {
    this.store.dispatch(UserActions.deactivateUser({ id: this.id() }));
  }

  onActivate(): void {
    this.store.dispatch(UserActions.activateUser({ id: this.id() }));
  }

  onAssignRole(roleId: string): void {
    if (!roleId) return;
    this.userService.assignRole(this.id(), roleId).subscribe(() => {
      this.store.dispatch(UserActions.loadUser({ id: this.id() }));
    });
  }

  onRemoveRole(roleName: string): void {
    const role = this.availableRoles().find(r => r.name === roleName);
    if (!role) return;
    this.userService.removeRole(this.id(), role.id).subscribe(() => {
      this.store.dispatch(UserActions.loadUser({ id: this.id() }));
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
