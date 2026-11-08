import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { KeyValuePipe, TitleCasePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, LoadingSpinnerComponent } from '@ethelpms/shared/ui';
import { RoleActions } from '../../store/role.actions';
import {
  selectSelectedRole,
  selectRolesLoading,
  selectPermissionsByModule,
  selectAllPermissions,
} from '../../store/role.selectors';
import { PermissionDto } from '../../models/role.model';

@Component({
  selector: 'ethel-role-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
    TitleCasePipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-page-header [title]="isEditMode() ? (role()?.name ?? 'Edit Role') : 'Create Role'">
      @if (isEditMode() && role()?.isSystemRole) {
        <mat-icon class="system-badge">lock</mat-icon>
        <span class="system-label">System Role</span>
      }
    </app-page-header>

    @if (loading() && isEditMode() && !role()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="form-container">
        <form [formGroup]="form" (ngSubmit)="onSave()">
          <div class="form-section">
            <h3>{{ 'roles.detail.basicInfo' | translate }}</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'roles.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (form.controls.name.hasError('required')) {
                  <mat-error>Role name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-span">
                <mat-label>{{ 'roles.fields.description' | translate }}</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <div class="permissions-header">
              <div class="permissions-header-left">
                <h3 class="permissions-title">{{ 'roles.fields.permissions' | translate }}</h3>
                <mat-checkbox
                  class="select-all-checkbox"
                  [checked]="isAllSelected()"
                  [indeterminate]="isPartiallySelected()"
                  [disabled]="(isEditMode() && role()?.isSystemRole) || allPermissions().length === 0"
                  (change)="toggleAll()">
                  <strong>{{ 'common.selectAll' | translate }}</strong>
                </mat-checkbox>
              </div>
              @if (allPermissions().length > 0) {
                <span class="selection-count">
                  {{ selectedPermissionIds().size }} / {{ allPermissions().length }} selected
                </span>
              }
            </div>
            <div class="permission-tree">
              @for (entry of permissionsByModule() | keyvalue; track entry.key) {
                <div class="module-group">
                  <mat-checkbox
                    [checked]="isModuleAllSelected(entry.value)"
                    [indeterminate]="isModulePartiallySelected(entry.value)"
                    [disabled]="isEditMode() && role()?.isSystemRole"
                    (change)="toggleModule(entry.value)">
                    <strong>{{ entry.key | titlecase }}</strong>
                  </mat-checkbox>
                  <div class="permission-list">
                    @for (perm of entry.value; track perm.id) {
                      <mat-checkbox
                        [checked]="isPermissionSelected(perm.id)"
                        [disabled]="isEditMode() && role()?.isSystemRole"
                        (change)="togglePermission(perm.id)">
                        {{ perm.displayName }}
                      </mat-checkbox>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          @if (!(isEditMode() && role()?.isSystemRole)) {
            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ isEditMode() ? ('common.save' | translate) : ('common.create' | translate) }}
                }
              </button>
            </div>
          }
        </form>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 900px; }
    .form-section { margin-bottom: 2rem; }
    .form-section h3 {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-span { grid-column: 1 / -1; }
    .permission-tree { display: flex; flex-direction: column; gap: 1rem; }
    .module-group {
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      padding: 1rem;
    }
    .permission-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding-left: 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .permissions-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .permissions-header-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .permissions-title {
      margin: 0 !important;
      padding-bottom: 0 !important;
      border-bottom: none !important;
    }
    .select-all-checkbox {
      font-weight: 500;
    }
    .selection-count {
      font-size: 0.8125rem;
      color: var(--text-secondary, #64748b);
      background: #f1f5f9;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-weight: 500;
    }
    .system-badge { color: var(--text-secondary, #666); }
    .system-label { color: var(--text-secondary, #666); font-size: 0.875rem; margin-left: 0.25rem; }
  `,
})
export default class RoleDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly roleId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.roleId());

  readonly role = this.store.selectSignal(selectSelectedRole);
  readonly loading = this.store.selectSignal(selectRolesLoading);
  readonly permissionsByModule = this.store.selectSignal(selectPermissionsByModule);
  readonly allPermissions = this.store.selectSignal(selectAllPermissions);

  readonly selectedPermissionIds = signal<Set<string>>(new Set());

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  constructor() {
    effect(() => {
      const role = this.role();
      if (role && this.isEditMode()) {
        this.form.patchValue({
          name: role.name,
          description: role.description ?? '',
        });
        this.selectedPermissionIds.set(new Set(role.permissions.map(p => p.id)));
        if (role.isSystemRole) {
          this.form.disable();
        }
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.roleId.set(id);
      this.store.dispatch(RoleActions.loadRole({ id }));
    }
    this.store.dispatch(RoleActions.loadPermissions());
  }

  isPermissionSelected(id: string): boolean {
    return this.selectedPermissionIds().has(id);
  }

  togglePermission(id: string): void {
    const current = new Set(this.selectedPermissionIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedPermissionIds.set(current);
  }

  isModuleAllSelected(permissions: PermissionDto[]): boolean {
    return permissions.every(p => this.selectedPermissionIds().has(p.id));
  }

  isModulePartiallySelected(permissions: PermissionDto[]): boolean {
    const selected = permissions.filter(p => this.selectedPermissionIds().has(p.id));
    return selected.length > 0 && selected.length < permissions.length;
  }

  toggleModule(permissions: PermissionDto[]): void {
    if (this.isEditMode() && this.role()?.isSystemRole) return;
    const current = new Set(this.selectedPermissionIds());
    if (this.isModuleAllSelected(permissions)) {
      permissions.forEach(p => current.delete(p.id));
    } else {
      permissions.forEach(p => current.add(p.id));
    }
    this.selectedPermissionIds.set(current);
  }

  isAllSelected(): boolean {
    const all = this.allPermissions();
    return all.length > 0 && all.every(p => this.selectedPermissionIds().has(p.id));
  }

  isPartiallySelected(): boolean {
    const all = this.allPermissions();
    if (!all.length) return false;
    const selectedCount = all.filter(p => this.selectedPermissionIds().has(p.id)).length;
    return selectedCount > 0 && selectedCount < all.length;
  }

  toggleAll(): void {
    if (this.isEditMode() && this.role()?.isSystemRole) return;
    const all = this.allPermissions();
    if (!all.length) return;
    if (this.isAllSelected()) {
      this.selectedPermissionIds.set(new Set());
    } else {
      this.selectedPermissionIds.set(new Set(all.map(p => p.id)));
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const permissionIds = Array.from(this.selectedPermissionIds());

    if (this.isEditMode()) {
      this.store.dispatch(RoleActions.updateRole({
        id: this.roleId()!,
        request: { name: value.name, description: value.description || undefined, permissionIds },
      }));
    } else {
      this.store.dispatch(RoleActions.createRole({
        request: { name: value.name, description: value.description || undefined, permissionIds },
      }));
    }
  }

  onCancel(): void {
    this.router.navigate(['/roles']);
  }
}
