import { Component, inject, input, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '@ethelpms/shared/core';

interface TenantDetail {
  id: string;
  name: string;
  identifier: string;
  status: string;
  packageName: string;
  packageId: string;
  maxUsers: number;
  currentUserCount: number;
  enabledModules: string[];
  createdAt: string;
  adminEmail: string;
}

interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: 'admin-tenant-detail',
  standalone: true,
  imports: [
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe,
    TranslatePipe,
  ],
  template: `
    <div class="tenant-detail">
      <div class="page-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          @if (isLoading()) {
            <mat-spinner diameter="24"></mat-spinner>
          } @else {
            <h1>{{ tenant()?.name ?? 'Tenant Detail' }}</h1>
            <div class="header-meta">
              <code>{{ tenant()?.identifier }}</code>
              <span class="status-chip" [class]="'status-' + (tenant()?.status?.toLowerCase() ?? '')">
                {{ tenant()?.status }}
              </span>
            </div>
          }
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="warn" (click)="toggleSuspend()">
            <mat-icon>{{ tenant()?.status === 'Suspended' ? 'play_arrow' : 'pause' }}</mat-icon>
            {{ tenant()?.status === 'Suspended' ? 'Reactivate' : 'Suspend' }}
          </button>
        </div>
      </div>

      @if (!isLoading()) {
        <mat-tab-group animationDuration="200ms">
          <!-- Overview Tab -->
          <mat-tab label="Overview">
            <div class="tab-content">
              <div class="overview-grid">
                <mat-card class="info-card">
                  <mat-card-content>
                    <h3>Organization Info</h3>
                    <div class="info-list">
                      <div class="info-row">
                        <span class="info-label">Name</span>
                        <span class="info-value">{{ tenant()?.name }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Identifier</span>
                        <code class="info-value">{{ tenant()?.identifier }}</code>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Admin Email</span>
                        <span class="info-value">{{ tenant()?.adminEmail }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Created</span>
                        <span class="info-value">{{ tenant()?.createdAt | date:'medium' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-content>
                    <h3>Subscription</h3>
                    <div class="info-list">
                      <div class="info-row">
                        <span class="info-label">Package</span>
                        <span class="info-value">{{ tenant()?.packageName }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Users</span>
                        <span class="info-value">{{ tenant()?.currentUserCount }} / {{ tenant()?.maxUsers }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Status</span>
                        <span class="status-chip" [class]="'status-' + (tenant()?.status?.toLowerCase() ?? '')">
                          {{ tenant()?.status }}
                        </span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Modules Tab -->
          <mat-tab label="Modules">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <h3>Enabled Modules</h3>
                  <div class="modules-grid">
                    @for (mod of tenant()?.enabledModules ?? []; track mod) {
                      <div class="module-chip">
                        <span class="material-symbols-outlined">check_circle</span>
                        {{ mod }}
                      </div>
                    }
                    @if ((tenant()?.enabledModules ?? []).length === 0) {
                      <p class="no-modules">No modules enabled for this tenant.</p>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Users Tab -->
          <mat-tab label="Users">
            <div class="tab-content">
              <mat-card>
                @if (usersLoading()) {
                  <div class="loading-center">
                    <mat-spinner diameter="32"></mat-spinner>
                  </div>
                } @else {
                  <table mat-table [dataSource]="users()" class="full-width">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
                    </ng-container>

                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef>Email</th>
                      <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                    </ng-container>

                    <ng-container matColumnDef="role">
                      <th mat-header-cell *matHeaderCellDef>Role</th>
                      <td mat-cell *matCellDef="let user">{{ user.role }}</td>
                    </ng-container>

                    <ng-container matColumnDef="isActive">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let user">
                        <span class="status-chip" [class]="user.isActive ? 'status-active' : 'status-suspended'">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userColumns"></tr>
                  </table>

                  @if (users().length === 0) {
                    <div class="empty-state">
                      <span class="material-symbols-outlined">group_off</span>
                      <p>No users found for this tenant.</p>
                    </div>
                  }
                }
              </mat-card>
            </div>
          </mat-tab>

          <!-- Settings Tab -->
          <mat-tab label="Settings">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <h3>Tenant Settings</h3>
                  <p class="placeholder-text">
                    Tenant-level configuration settings will be available here.
                    This includes database connection strings, feature flags, and tenant-specific overrides.
                  </p>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .tenant-detail {
      max-width: 1200px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;

      .header-info {
        flex: 1;

        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .header-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;

          code {
            font-size: 13px;
            color: var(--text-secondary);
          }
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .info-card {
      border-radius: 12px;

      h3 {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .info-label {
        font-size: 14px;
        color: var(--text-secondary);
      }

      .info-value {
        font-size: 14px;
        color: var(--text-primary);
        font-weight: 500;
      }
    }

    .modules-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .module-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(124, 58, 237, 0.08);
      color: var(--accent-primary);
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;

      .material-symbols-outlined {
        font-size: 18px;
      }
    }

    .no-modules {
      color: var(--text-secondary);
      font-style: italic;
    }

    .full-width {
      width: 100%;
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

    .status-pendingsetup {
      background: rgba(217, 119, 6, 0.1);
      color: var(--accent-warning);
    }

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 32px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 16px;
      color: var(--text-secondary);

      .material-symbols-outlined {
        font-size: 48px;
        opacity: 0.4;
        margin-bottom: 12px;
      }

      p { margin: 0; font-size: 14px; }
    }

    .placeholder-text {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }
  `],
})
export default class TenantDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  /** Route param bound via withComponentInputBinding() */
  readonly id = input.required<string>();

  readonly tenant = signal<TenantDetail | null>(null);
  readonly users = signal<TenantUser[]>([]);
  readonly isLoading = signal(true);
  readonly usersLoading = signal(false);

  readonly userColumns = ['name', 'email', 'role', 'isActive'];

  ngOnInit(): void {
    this.loadTenant();
    this.loadUsers();
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }

  toggleSuspend(): void {
    const tenantId = this.id();
    const currentStatus = this.tenant()?.status;
    const action = currentStatus === 'Suspended' ? 'reactivate' : 'suspend';

    this.api.post(`/platform/tenants/${tenantId}/${action}`).subscribe({
      next: () => {
        this.snackBar.open(
          `Tenant ${action === 'suspend' ? 'suspended' : 'reactivated'} successfully.`,
          'Close',
          { duration: 3000, panelClass: 'snackbar-success' }
        );
        this.loadTenant();
      },
    });
  }

  private loadTenant(): void {
    this.isLoading.set(true);
    this.api.get<TenantDetail>(`/platform/tenants/${this.id()}`).subscribe({
      next: (data) => {
        this.tenant.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private loadUsers(): void {
    this.usersLoading.set(true);
    this.api.get<TenantUser[]>(`/platform/tenants/${this.id()}/users`).subscribe({
      next: (data) => {
        this.users.set(data);
        this.usersLoading.set(false);
      },
      error: () => {
        this.usersLoading.set(false);
      },
    });
  }
}
