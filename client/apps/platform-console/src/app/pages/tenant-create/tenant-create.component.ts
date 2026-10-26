import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '@ethelpms/shared/core';

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  enabledModules: string[];
  pricePerMonth: number;
}

interface CreateTenantRequest {
  name: string;
  identifier: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  subscriptionPackageId: string;
}

@Component({
  selector: 'admin-tenant-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="tenant-create">
      <div class="page-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ 'tenants.create.title' | translate }}</h1>
          <p class="subtitle">{{ 'tenants.create.subtitle' | translate }}</p>
        </div>
      </div>

      <mat-card class="wizard-card">
        <mat-stepper [linear]="true" #stepper>
          <!-- Step 1: Organization Info -->
          <mat-step [stepControl]="orgForm" label="Organization Info">
            <form [formGroup]="orgForm">
              <div class="step-content">
                <h2>Organization Details</h2>
                <p class="step-description">Enter the basic information about the new tenant organization.</p>

                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Organization Name</mat-label>
                    <input matInput formControlName="name" placeholder="e.g. Save The Children Ethiopia" />
                    @if (orgForm.controls.name.hasError('required')) {
                      <mat-error>Organization name is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Identifier</mat-label>
                    <input matInput formControlName="identifier" placeholder="e.g. save-children-eth" />
                    <mat-hint>URL-safe slug used for tenant routing</mat-hint>
                    @if (orgForm.controls.identifier.hasError('required')) {
                      <mat-error>Identifier is required</mat-error>
                    }
                    @if (orgForm.controls.identifier.hasError('pattern')) {
                      <mat-error>Only lowercase letters, numbers, and hyphens allowed</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Admin First Name</mat-label>
                    <input matInput formControlName="adminFirstName" placeholder="First name" />
                    @if (orgForm.controls.adminFirstName.hasError('required')) {
                      <mat-error>First name is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Admin Last Name</mat-label>
                    <input matInput formControlName="adminLastName" placeholder="Last name" />
                    @if (orgForm.controls.adminLastName.hasError('required')) {
                      <mat-error>Last name is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Admin Email</mat-label>
                    <input matInput formControlName="adminEmail" type="email" placeholder="admin@organization.org" />
                    @if (orgForm.controls.adminEmail.hasError('required')) {
                      <mat-error>Email is required</mat-error>
                    }
                    @if (orgForm.controls.adminEmail.hasError('email')) {
                      <mat-error>Please enter a valid email</mat-error>
                    }
                  </mat-form-field>
                </div>
              </div>

              <div class="step-actions">
                <span></span>
                <button mat-flat-button color="primary" matStepperNext [disabled]="orgForm.invalid">
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Package Selection -->
          <mat-step [stepControl]="packageForm" label="Package Selection">
            <form [formGroup]="packageForm">
              <div class="step-content">
                <h2>Select Subscription Package</h2>
                <p class="step-description">Choose the subscription tier for this tenant.</p>

                <mat-radio-group formControlName="subscriptionPackageId" class="package-grid">
                  @for (pkg of packages(); track pkg.id) {
                    <mat-card
                      class="package-option"
                      [class.selected]="packageForm.controls.subscriptionPackageId.value === pkg.id"
                      (click)="selectPackage(pkg.id)"
                    >
                      <mat-radio-button [value]="pkg.id">
                        <div class="package-info">
                          <strong class="package-name">{{ pkg.name }}</strong>
                          <p class="package-desc">{{ pkg.description }}</p>
                          <div class="package-meta">
                            <span>Up to {{ pkg.maxUsers }} users</span>
                            <span>{{ pkg.enabledModules.length }} modules</span>
                          </div>
                        </div>
                      </mat-radio-button>
                    </mat-card>
                  }
                </mat-radio-group>

                @if (packages().length === 0) {
                  <div class="empty-packages">
                    <span class="material-symbols-outlined">inventory_2</span>
                    <p>No packages available. Please create subscription packages first.</p>
                  </div>
                }
              </div>

              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-flat-button color="primary" matStepperNext [disabled]="packageForm.invalid">
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Confirm -->
          <mat-step label="Confirm">
            <div class="step-content">
              <h2>Review &amp; Confirm</h2>
              <p class="step-description">Review the tenant details before provisioning.</p>

              <div class="review-grid">
                <div class="review-item">
                  <span class="review-label">Organization</span>
                  <span class="review-value">{{ orgForm.controls.name.value }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Identifier</span>
                  <code class="review-value">{{ orgForm.controls.identifier.value }}</code>
                </div>
                <div class="review-item">
                  <span class="review-label">Admin</span>
                  <span class="review-value">
                    {{ orgForm.controls.adminFirstName.value }} {{ orgForm.controls.adminLastName.value }}
                    ({{ orgForm.controls.adminEmail.value }})
                  </span>
                </div>
                <div class="review-item">
                  <span class="review-label">Package</span>
                  <span class="review-value">{{ selectedPackageName() }}</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button
                mat-flat-button
                color="primary"
                (click)="submit()"
                [disabled]="isSubmitting()"
              >
                @if (isSubmitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>check</mat-icon>
                  Provision Tenant
                }
              </button>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-card>
    </div>
  `,
  styles: [`
    .tenant-create {
      max-width: 900px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;

      h1 {
        margin: 0 0 4px;
        font-size: 28px;
        font-weight: 500;
        color: var(--text-primary);
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
      }
    }

    .wizard-card {
      border-radius: 12px;
      padding: 16px;
    }

    .step-content {
      padding: 24px 0;

      h2 {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 500;
      }

      .step-description {
        margin: 0 0 24px;
        color: var(--text-secondary);
        font-size: 14px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 20px;

      .full-width {
        grid-column: 1 / -1;
      }
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }

    .package-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .package-option {
      cursor: pointer;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.15s ease;
      border: 2px solid transparent;

      &.selected {
        border-color: var(--accent-primary);
        background: rgba(124, 58, 237, 0.04);
      }

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }

    .package-info {
      margin-left: 8px;

      .package-name {
        font-size: 16px;
        display: block;
        margin-bottom: 4px;
      }

      .package-desc {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0 0 12px;
      }

      .package-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--text-secondary);
      }
    }

    .empty-packages {
      text-align: center;
      padding: 32px;
      color: var(--text-secondary);

      .material-symbols-outlined {
        font-size: 48px;
        opacity: 0.4;
      }
    }

    .review-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--bg-secondary);
      padding: 24px;
      border-radius: 12px;
    }

    .review-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .review-label {
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .review-value {
        font-size: 14px;
        color: var(--text-primary);
      }
    }
  `],
})
export default class TenantCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly packages = signal<SubscriptionPackage[]>([]);
  readonly isSubmitting = signal(false);

  readonly orgForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    identifier: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    adminFirstName: ['', [Validators.required]],
    adminLastName: ['', [Validators.required]],
    adminEmail: ['', [Validators.required, Validators.email]],
  });

  readonly packageForm = this.fb.nonNullable.group({
    subscriptionPackageId: ['', [Validators.required]],
  });

  constructor() {
    this.loadPackages();
  }

  selectedPackageName(): string {
    const selectedId = this.packageForm.controls.subscriptionPackageId.value;
    return this.packages().find(p => p.id === selectedId)?.name ?? '--';
  }

  selectPackage(id: string): void {
    this.packageForm.controls.subscriptionPackageId.setValue(id);
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }

  submit(): void {
    if (this.orgForm.invalid || this.packageForm.invalid) return;

    this.isSubmitting.set(true);
    const orgValues = this.orgForm.getRawValue();
    const pkgValues = this.packageForm.getRawValue();

    const request: CreateTenantRequest = {
      ...orgValues,
      subscriptionPackageId: pkgValues.subscriptionPackageId,
    };

    this.api.post<{ id: string }>('/platform/tenants', request).subscribe({
      next: (result) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Tenant provisioned successfully!', 'View', {
          duration: 5000,
          panelClass: 'snackbar-success',
        }).onAction().subscribe(() => {
          this.router.navigate(['/tenants', result.id]);
        });
        this.router.navigate(['/tenants']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  private loadPackages(): void {
    this.api.get<SubscriptionPackage[]>('/platform/packages').subscribe({
      next: (pkgs) => this.packages.set(pkgs),
    });
  }
}
