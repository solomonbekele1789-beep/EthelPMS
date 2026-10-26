import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '@ethelpms/shared/core';

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  enabledModules: string[];
  pricePerMonth: number;
  isActive: boolean;
  tenantCount: number;
}

@Component({
  selector: 'admin-package-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CurrencyPipe,
    TranslatePipe,
  ],
  template: `
    <div class="package-list">
      <div class="page-header">
        <div class="header-left">
          <h1>{{ 'packages.title' | translate }}</h1>
          <p class="subtitle">{{ 'packages.subtitle' | translate }}</p>
        </div>
        <button mat-flat-button color="primary" (click)="showCreateForm = !showCreateForm">
          <mat-icon>{{ showCreateForm ? 'close' : 'add' }}</mat-icon>
          {{ showCreateForm ? 'Cancel' : 'New Package' }}
        </button>
      </div>

      <!-- Create form (inline) -->
      @if (showCreateForm) {
        <mat-card class="create-card">
          <mat-card-content>
            <h2>Create New Package</h2>
            <form [formGroup]="createForm" (ngSubmit)="createPackage()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Package Name</mat-label>
                  <input matInput formControlName="name" placeholder="e.g. Enterprise" />
                  @if (createForm.controls.name.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Max Users</mat-label>
                  <input matInput formControlName="maxUsers" type="number" placeholder="50" />
                  @if (createForm.controls.maxUsers.hasError('required')) {
                    <mat-error>Max users is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" placeholder="Brief description..."></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Price / Month (USD)</mat-label>
                  <input matInput formControlName="pricePerMonth" type="number" placeholder="99.00" />
                  @if (createForm.controls.pricePerMonth.hasError('required')) {
                    <mat-error>Price is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Enabled Modules (comma-separated)</mat-label>
                  <input matInput formControlName="enabledModulesRaw" placeholder="Projects, Planning, Reporting" />
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="showCreateForm = false">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid || isCreating()">
                  @if (isCreating()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    Create Package
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- Packages grid -->
      @if (isLoading()) {
        <div class="loading-center">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="packages-grid">
          @for (pkg of packages(); track pkg.id) {
            <mat-card class="package-card" [class.inactive]="!pkg.isActive">
              <mat-card-content>
                <div class="package-header">
                  <h3>{{ pkg.name }}</h3>
                  <span class="status-chip" [class]="pkg.isActive ? 'status-active' : 'status-suspended'">
                    {{ pkg.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <p class="package-description">{{ pkg.description }}</p>

                <div class="package-price">
                  <span class="price">{{ pkg.pricePerMonth | currency:'USD' }}</span>
                  <span class="period">/month</span>
                </div>

                <div class="package-stats">
                  <div class="stat">
                    <span class="stat-value">{{ pkg.maxUsers }}</span>
                    <span class="stat-label">Max Users</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ pkg.enabledModules.length }}</span>
                    <span class="stat-label">Modules</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ pkg.tenantCount }}</span>
                    <span class="stat-label">Tenants</span>
                  </div>
                </div>

                <div class="modules-list">
                  @for (mod of pkg.enabledModules; track mod) {
                    <span class="module-tag">{{ mod }}</span>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        @if (packages().length === 0) {
          <div class="empty-state">
            <span class="material-symbols-outlined">inventory_2</span>
            <h3>No Subscription Packages</h3>
            <p>Create your first subscription package to start provisioning tenants.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .package-list {
      max-width: 1200px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .header-left {
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
    }

    .create-card {
      margin-bottom: 24px;
      border-radius: 12px;
      padding: 8px;

      h2 {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 500;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .packages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .package-card {
      border-radius: 12px;
      transition: transform 0.15s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.inactive {
        opacity: 0.6;
      }
    }

    .package-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .package-description {
      margin: 0 0 16px;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .package-price {
      margin-bottom: 20px;

      .price {
        font-size: 32px;
        font-weight: 500;
        color: var(--accent-primary);
      }

      .period {
        font-size: 14px;
        color: var(--text-secondary);
        margin-left: 4px;
      }
    }

    .package-stats {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      padding: 12px 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);

      .stat {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-value {
          font-size: 18px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }

    .modules-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .module-tag {
      display: inline-block;
      padding: 4px 10px;
      background: var(--bg-secondary);
      border-radius: 12px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .status-chip {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background: rgba(22, 163, 74, 0.1);
      color: var(--accent-success);
    }

    .status-suspended {
      background: rgba(220, 38, 38, 0.1);
      color: var(--accent-danger);
    }

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 16px;
      color: var(--text-secondary);

      .material-symbols-outlined {
        font-size: 64px;
        opacity: 0.3;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        color: var(--text-primary);
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  `],
})
export default class PackageListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly packages = signal<SubscriptionPackage[]>([]);
  readonly isLoading = signal(false);
  readonly isCreating = signal(false);
  showCreateForm = false;

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    maxUsers: [50, [Validators.required, Validators.min(1)]],
    pricePerMonth: [0, [Validators.required, Validators.min(0)]],
    enabledModulesRaw: [''],
  });

  ngOnInit(): void {
    this.loadPackages();
  }

  createPackage(): void {
    if (this.createForm.invalid) return;

    this.isCreating.set(true);
    const raw = this.createForm.getRawValue();
    const enabledModules = raw.enabledModulesRaw
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const payload = {
      name: raw.name,
      description: raw.description,
      maxUsers: raw.maxUsers,
      pricePerMonth: raw.pricePerMonth,
      enabledModules,
    };

    this.api.post('/platform/packages', payload).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.showCreateForm = false;
        this.createForm.reset({ maxUsers: 50, pricePerMonth: 0 });
        this.snackBar.open('Package created successfully!', 'Close', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
        this.loadPackages();
      },
      error: () => {
        this.isCreating.set(false);
      },
    });
  }

  private loadPackages(): void {
    this.isLoading.set(true);
    this.api.get<SubscriptionPackage[]>('/platform/packages').subscribe({
      next: (data) => {
        this.packages.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
