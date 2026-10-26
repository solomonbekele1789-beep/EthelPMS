import { Component, inject, OnInit, signal, computed, input, effect } from '@angular/core';
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
import { UpdateUserRequest } from '../../models/user.model';

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
    <app-page-header [title]="user()?.firstName ? user()!.firstName + ' ' + user()!.lastName : 'User Detail'">
      @if (user()) {
        <app-status-badge [status]="user()!.isActive ? 'active' : 'inactive'" [label]="user()!.isActive ? 'Active' : 'Inactive'"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !user()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (user()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="activeTab.set($event)">
        <mat-tab [label]="'users.detail.tabProfile' | translate">
          <div class="tab-content">
            <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'users.fields.firstName' | translate }}</mat-label>
                  <input matInput formControlName="firstName" />
                  @if (profileForm.controls.firstName.hasError('required')) {
                    <mat-error>First name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'users.fields.lastName' | translate }}</mat-label>
                  <input matInput formControlName="lastName" />
                  @if (profileForm.controls.lastName.hasError('required')) {
                    <mat-error>Last name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'users.fields.phone' | translate }}</mat-label>
                  <input matInput formControlName="phone" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'users.fields.office' | translate }}</mat-label>
                  <mat-select formControlName="officeId">
                    <mat-option value="">-- None --</mat-option>
                    @for (office of offices(); track office.id) {
                      <mat-option [value]="office.id">{{ office.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="goBack()">{{ 'common.back' | translate }}</button>
                <div class="spacer"></div>
                @if (user()!.isActive) {
                  <button mat-stroked-button color="warn" type="button" *appHasPermission="'identity.users.update'" (click)="onDeactivate()">
                    <mat-icon>block</mat-icon> {{ 'users.actions.deactivate' | translate }}
                  </button>
                } @else {
                  <button mat-stroked-button color="primary" type="button" *appHasPermission="'identity.users.update'" (click)="onActivate()">
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
                  <button matChipRemove *appHasPermission="'identity.users.update'">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              }
            </mat-chip-set>

            <div class="role-assign" *appHasPermission="'identity.users.update'">
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
    .tab-content { padding: 1.5rem 0; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
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

  readonly offices = signal<OfficeListItemDto[]>([]);
  readonly availableRoles = signal<RoleListItemDto[]>([]);
  readonly activeTab = signal(0);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: [''],
    officeId: [''],
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
          officeId: user.officeId ?? '',
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUser({ id: this.id() }));
    this.officeService.listOffices(1, 100).subscribe(result => this.offices.set(result.items));
    this.roleService.listRoles(1, 100).subscribe(result => this.availableRoles.set(result.items));
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    const value = this.profileForm.getRawValue();
    const request: UpdateUserRequest = {
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone || undefined,
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
