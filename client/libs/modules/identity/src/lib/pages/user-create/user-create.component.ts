import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { UserActions } from '../../store/user.actions';
import { selectUsersLoading } from '../../store/user.selectors';
import { OfficeService } from '../../services/office.service';
import { RoleService } from '../../services/role.service';
import { OfficeListItemDto } from '../../models/office.model';
import { RoleListItemDto } from '../../models/role.model';
import { CreateUserRequest } from '../../models/user.model';

@Component({
  selector: 'ethel-user-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Create User"></app-page-header>

    <div class="form-container">
      <div class="info-banner">
        <mat-icon>info</mat-icon>
        <span>{{ 'users.create.invitationNote' | translate }}</span>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'users.fields.email' | translate }}</mat-label>
            <input matInput formControlName="email" type="email" />
            @if (form.controls.email.hasError('required')) {
              <mat-error>Email is required</mat-error>
            } @else if (form.controls.email.hasError('email')) {
              <mat-error>Invalid email format</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'users.fields.firstName' | translate }}</mat-label>
            <input matInput formControlName="firstName" />
            @if (form.controls.firstName.hasError('required')) {
              <mat-error>First name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'users.fields.lastName' | translate }}</mat-label>
            <input matInput formControlName="lastName" />
            @if (form.controls.lastName.hasError('required')) {
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

          <mat-form-field appearance="outline">
            <mat-label>{{ 'users.fields.roles' | translate }}</mat-label>
            <mat-select formControlName="roleIds" multiple>
              @for (role of roles(); track role.id) {
                <mat-option [value]="role.id">{{ role.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 800px; }
    .info-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #1e40af;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class UserCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly officeService = inject(OfficeService);
  private readonly roleService = inject(RoleService);

  readonly loading = this.store.selectSignal(selectUsersLoading);
  readonly offices = signal<OfficeListItemDto[]>([]);
  readonly roles = signal<RoleListItemDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: [''],
    officeId: [''],
    roleIds: [[] as string[]],
  });

  ngOnInit(): void {
    this.officeService.listOffices(1, 100).subscribe(result => this.offices.set(result.items));
    this.roleService.listRoles(1, 100).subscribe(result => this.roles.set(result.items));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateUserRequest = {
      email: value.email,
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone || undefined,
      officeId: value.officeId || undefined,
      roleIds: value.roleIds,
    };
    this.store.dispatch(UserActions.createUser({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
