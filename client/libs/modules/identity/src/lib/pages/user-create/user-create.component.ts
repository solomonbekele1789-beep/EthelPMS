import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
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
import { UserService } from '../../services/user.service';
import { OfficeListItemDto } from '../../models/office.model';
import { RoleListItemDto } from '../../models/role.model';
import { UserListItemDto, CreateUserRequest } from '../../models/user.model';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPasswordCtrl = control.get('confirmPassword');
  const confirmPassword = confirmPasswordCtrl?.value;

  if (!password || !confirmPassword) return null;

  if (password !== confirmPassword) {
    confirmPasswordCtrl?.setErrors({ ...confirmPasswordCtrl.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPasswordCtrl?.hasError('passwordMismatch')) {
      const errors = { ...confirmPasswordCtrl.errors };
      delete errors['passwordMismatch'];
      confirmPasswordCtrl.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
}

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
    <app-page-header title="Create User" subtitle="Add a new staff member and configure their account, employment, and office details.">
      <button mat-stroked-button (click)="onCancel()">
        <mat-icon>arrow_back</mat-icon>
        Back to Users
      </button>
    </app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="cards-grid">

          <!-- Card 1: Personal Information -->
          <div class="card">
            <div class="card-title">
              <mat-icon>person</mat-icon>
              <span>Personal Information</span>
            </div>
            <div class="fields-grid-2">
              <mat-form-field appearance="outline">
                <mat-label>First Name *</mat-label>
                <input matInput formControlName="firstName" placeholder="First Name" />
                @if (form.controls.firstName.hasError('required')) {
                  <mat-error>First name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Middle Name</mat-label>
                <input matInput formControlName="middleName" placeholder="Middle Name" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name *</mat-label>
                <input matInput formControlName="lastName" placeholder="Last Name" />
                @if (form.controls.lastName.hasError('required')) {
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
                  @for (g of genders; track g.value) {
                    <mat-option [value]="g.value">{{ g.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phone" placeholder="+251..." />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address" placeholder="Physical Address / Subcity / Woreda" />
              </mat-form-field>
            </div>
          </div>

          <!-- Card 2: Account Information -->
          <div class="card">
            <div class="card-title">
              <mat-icon>lock</mat-icon>
              <span>Account Information</span>
            </div>
            <div class="fields-grid-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email *</mat-label>
                <input matInput formControlName="email" type="email" placeholder="user@organization.org" />
                @if (form.controls.email.hasError('required')) {
                  <mat-error>Email is required</mat-error>
                } @else if (form.controls.email.hasError('email')) {
                  <mat-error>Invalid email format</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password *</mat-label>
                <input
                  matInput
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Min. 6 characters"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hidePassword.set(!hidePassword())"
                  [attr.aria-label]="'Toggle password visibility'"
                >
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.controls.password.hasError('required')) {
                  <mat-error>Password is required</mat-error>
                } @else if (form.controls.password.hasError('minlength')) {
                  <mat-error>Min 6 characters required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Confirm Password *</mat-label>
                <input
                  matInput
                  [type]="hideConfirmPassword() ? 'password' : 'text'"
                  formControlName="confirmPassword"
                  placeholder="Re-enter password"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hideConfirmPassword.set(!hideConfirmPassword())"
                  [attr.aria-label]="'Toggle confirm password visibility'"
                >
                  <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.controls.confirmPassword.hasError('required')) {
                  <mat-error>Please confirm password</mat-error>
                } @else if (form.controls.confirmPassword.hasError('passwordMismatch')) {
                  <mat-error>Passwords do not match</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Role *</mat-label>
                <mat-select formControlName="roleId">
                  <mat-option value="">--Select Role--</mat-option>
                  @for (role of roles(); track role.id) {
                    <mat-option [value]="role.id">{{ role.name }}</mat-option>
                  }
                </mat-select>
                @if (form.controls.roleId.hasError('required')) {
                  <mat-error>Role is required</mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          <!-- Card 3: Employment Information -->
          <div class="card">
            <div class="card-title">
              <mat-icon>badge</mat-icon>
              <span>Employment Information</span>
            </div>
            <div class="fields-grid-2">
              <mat-form-field appearance="outline">
                <mat-label>Employee ID</mat-label>
                <input matInput formControlName="employeeId" placeholder="EMP-001" />
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
                <input matInput formControlName="qualification" placeholder="e.g. M.Sc. in Economics" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Basic Salary (ETB)</mat-label>
                <input matInput type="number" formControlName="basicSalary" placeholder="0.00" min="0" step="0.01" />
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

          <!-- Card 4: Profile Photo -->
          <div class="card photo-card">
            <div class="card-title">
              <mat-icon>account_box</mat-icon>
              <span>Profile Photo</span>
            </div>
            <div class="photo-upload-wrapper">
              <div class="photo-preview-box">
                @if (profilePhotoUrl()) {
                  <img [src]="profilePhotoUrl()" alt="Profile preview" class="preview-img" />
                } @else {
                  <mat-icon class="placeholder-icon">person</mat-icon>
                }
              </div>
              <div class="photo-controls">
                <input
                  #fileInput
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  (change)="onFileSelected($event)"
                  style="display: none;"
                />
                <button mat-stroked-button type="button" (click)="fileInput.click()">
                  <mat-icon>cloud_upload</mat-icon>
                  {{ profilePhotoUrl() ? 'Change Photo' : 'Upload Photo' }}
                </button>
                @if (profilePhotoUrl()) {
                  <button mat-button color="warn" type="button" (click)="removePhoto(fileInput)">
                    <mat-icon>delete</mat-icon>
                    Remove Photo
                  </button>
                }
                <span class="photo-hint">Square image, max 2MB (JPG, PNG, WebP)</span>
                @if (photoError()) {
                  <span class="photo-error">{{ photoError() }}</span>
                }
              </div>
            </div>
          </div>

          <!-- Card 5: Location Information -->
          <div class="card">
            <div class="card-title">
              <mat-icon>location_on</mat-icon>
              <span>Location Information</span>
            </div>
            <div class="fields-grid-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Region</mat-label>
                <mat-select formControlName="region">
                  <mat-option value="">--Select Region--</mat-option>
                  @for (r of regions; track r) {
                    <mat-option [value]="r">{{ r }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Card 6: Office Assignment -->
          <div class="card">
            <div class="card-title">
              <mat-icon>business</mat-icon>
              <span>Office Assignment</span>
            </div>
            <div class="fields-grid-2">
              <mat-form-field appearance="outline">
                <mat-label>Office Level *</mat-label>
                <mat-select formControlName="officeLevel">
                  <mat-option value="">--Select Office Level--</mat-option>
                  @for (lvl of officeLevels; track lvl) {
                    <mat-option [value]="lvl">{{ lvl }}</mat-option>
                  }
                </mat-select>
                @if (form.controls.officeLevel.hasError('required')) {
                  <mat-error>Office level is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Office</mat-label>
                <mat-select formControlName="officeId">
                  <mat-option value="">--Select Office--</mat-option>
                  @for (office of offices(); track office.id) {
                    <mat-option [value]="office.id">{{ office.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>

        </div>

        <div class="form-actions">
          <button mat-stroked-button type="button" (click)="onCancel()" class="btn-cancel">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            class="btn-submit"
          >
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>person_add</mat-icon>
              <span>Create User</span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .form-container {
      max-width: 1200px;
      margin: 0 auto;
      padding-bottom: 2.5rem;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-top: 1rem;
    }
    @media (max-width: 900px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .card-title mat-icon {
      color: #2563eb;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .fields-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1rem;
    }
    @media (max-width: 600px) {
      .fields-grid-2 {
        grid-template-columns: 1fr;
      }
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .photo-upload-wrapper {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0.5rem 0;
    }
    .photo-preview-box {
      width: 110px;
      height: 110px;
      border-radius: 12px;
      border: 2px dashed #cbd5e1;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #94a3b8;
    }
    .photo-controls {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }
    .photo-hint {
      font-size: 0.75rem;
      color: #64748b;
    }
    .photo-error {
      font-size: 0.75rem;
      color: #ef4444;
      font-weight: 500;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .btn-submit {
      min-width: 140px;
    }
    .btn-submit mat-icon {
      margin-right: 4px;
    }
  `,
})
export default class UserCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly officeService = inject(OfficeService);
  private readonly roleService = inject(RoleService);
  private readonly userService = inject(UserService);

  readonly loading = this.store.selectSignal(selectUsersLoading);
  readonly offices = signal<OfficeListItemDto[]>([]);
  readonly roles = signal<RoleListItemDto[]>([]);
  readonly managers = signal<UserListItemDto[]>([]);

  readonly hidePassword = signal<boolean>(true);
  readonly hideConfirmPassword = signal<boolean>(true);
  readonly profilePhotoUrl = signal<string | null>(null);
  readonly photoError = signal<string | null>(null);

  readonly genders = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ];

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

  readonly form = this.fb.group(
    {
      // Card 1: Personal Information
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', [Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      dateOfBirth: [''],
      gender: [''],
      phone: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]],

      // Card 2: Account Information
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      roleId: ['', [Validators.required]],

      // Card 3: Employment Information
      employeeId: ['', [Validators.maxLength(50)]],
      employmentDate: [''],
      levelOfEducation: [''],
      qualification: ['', [Validators.maxLength(200)]],
      basicSalary: [null as number | null],
      managerId: [''],

      // Card 5: Location Information
      region: [''],

      // Card 6: Office Assignment
      officeLevel: ['', [Validators.required]],
      officeId: [''],
    },
    { validators: [passwordMatchValidator] }
  );

  ngOnInit(): void {
    this.officeService.listOffices(1, 100).subscribe({
      next: (result) => this.offices.set(result.items),
      error: () => {},
    });
    this.roleService.listRoles(1, 100).subscribe({
      next: (result) => this.roles.set(result.items),
      error: () => {},
    });
    this.userService.listUsers(1, 100).subscribe({
      next: (result) => this.managers.set(result.items),
      error: () => {},
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.photoError.set('File size exceeds 2MB limit.');
      return;
    }
    this.photoError.set(null);

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePhotoUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removePhoto(fileInput?: HTMLInputElement): void {
    this.profilePhotoUrl.set(null);
    this.photoError.set(null);
    if (fileInput) fileInput.value = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateUserRequest = {
      email: value.email!.trim(),
      firstName: value.firstName!.trim(),
      middleName: value.middleName?.trim() || undefined,
      lastName: value.lastName!.trim(),
      phone: value.phone?.trim() || undefined,
      dateOfBirth: value.dateOfBirth || undefined,
      gender: value.gender || undefined,
      address: value.address?.trim() || undefined,
      password: value.password || undefined,
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
      roleIds: value.roleId ? [value.roleId] : [],
    };

    this.store.dispatch(UserActions.createUser({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
