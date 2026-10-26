import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, TranslatePipe],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>{{ 'dashboard.title' | translate }}</h1>
        <p class="subtitle">{{ 'dashboard.subtitle' | translate }}</p>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid">
        @for (card of statCards; track card.label) {
          <mat-card class="stat-card" (click)="navigateTo(card.route)">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-info">
                  <span class="stat-label">{{ card.label }}</span>
                  <span class="stat-value">{{ card.value }}</span>
                </div>
                <div class="stat-icon" [style.background]="card.color + '1a'" [style.color]="card.color">
                  <span class="material-symbols-outlined">{{ card.icon }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Quick actions -->
      <div class="section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <mat-card class="action-card" (click)="navigateTo('/tenants/create')">
            <mat-card-content>
              <mat-icon>add_business</mat-icon>
              <span>Provision Tenant</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="action-card" (click)="navigateTo('/packages')">
            <mat-card-content>
              <mat-icon>inventory_2</mat-icon>
              <span>Manage Packages</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="action-card" (click)="navigateTo('/tenants')">
            <mat-card-content>
              <mat-icon>list_alt</mat-icon>
              <span>View All Tenants</span>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Recent activity placeholder -->
      <div class="section">
        <h2>Recent Activity</h2>
        <mat-card class="activity-card">
          <mat-card-content>
            <div class="empty-state">
              <span class="material-symbols-outlined empty-icon">history</span>
              <p>Activity log will appear here once the platform is in use.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
    }

    .page-header {
      margin-bottom: 28px;

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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      border-radius: 12px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    .stat-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .stat-value {
      font-size: 32px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      .material-symbols-outlined {
        font-size: 28px;
      }
    }

    .section {
      margin-bottom: 32px;

      h2 {
        font-size: 18px;
        font-weight: 500;
        color: var(--text-primary);
        margin: 0 0 16px;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      cursor: pointer;
      border-radius: 12px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      mat-card-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        color: var(--text-primary);

        mat-icon {
          color: var(--accent-primary);
        }

        span {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .activity-card {
      border-radius: 12px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      color: var(--text-secondary);

      .empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.4;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  `],
})
export default class DashboardComponent {
  private readonly router = inject(Router);

  readonly statCards: StatCard[] = [
    {
      label: 'Total Tenants',
      value: '--',
      icon: 'business',
      color: '#7c3aed',
      route: '/tenants',
    },
    {
      label: 'Active Subscriptions',
      value: '--',
      icon: 'credit_card',
      color: '#16a34a',
      route: '/tenants',
    },
    {
      label: 'System Health',
      value: 'OK',
      icon: 'monitor_heart',
      color: '#0891b2',
      route: '/dashboard',
    },
    {
      label: 'Packages',
      value: '--',
      icon: 'inventory_2',
      color: '#d97706',
      route: '/packages',
    },
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
