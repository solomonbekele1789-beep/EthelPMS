import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '@ethelpms/shared/core';

interface TenantSummary {
  id: string;
  name: string;
  identifier: string;
  status: 'Active' | 'Suspended' | 'PendingSetup';
  packageName: string;
  createdAt: string;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'admin-tenant-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
  ],
  template: `
    <div class="tenant-list">
      <div class="page-header">
        <div class="header-left">
          <h1>{{ 'tenants.title' | translate }}</h1>
          <p class="subtitle">{{ 'tenants.subtitle' | translate }}</p>
        </div>
        <button mat-flat-button color="primary" (click)="createTenant()">
          <mat-icon>add</mat-icon>
          New Tenant
        </button>
      </div>

      <!-- Search and filter bar -->
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search tenants</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name or identifier..." />
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
            <div class="status-filters">
              @for (status of statusFilters; track status) {
                <button
                  mat-stroked-button
                  [class.active-filter]="activeStatus() === status"
                  (click)="filterByStatus(status)"
                >
                  {{ status }}
                </button>
              }
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tenants table -->
      <mat-card class="table-card">
        @if (isLoading()) {
          <div class="loading-overlay">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }

        <table mat-table [dataSource]="tenants()" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let tenant">
              <div class="tenant-name">
                <span class="material-symbols-outlined tenant-icon">business</span>
                <span>{{ tenant.name }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="identifier">
            <th mat-header-cell *matHeaderCellDef>Identifier</th>
            <td mat-cell *matCellDef="let tenant">
              <code class="identifier-code">{{ tenant.identifier }}</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let tenant">
              <span class="status-chip" [class]="'status-' + tenant.status.toLowerCase()">
                {{ tenant.status }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="packageName">
            <th mat-header-cell *matHeaderCellDef>Package</th>
            <td mat-cell *matCellDef="let tenant">{{ tenant.packageName }}</td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let tenant">{{ tenant.createdAt | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let tenant">
              <button mat-icon-button [matMenuTriggerFor]="rowMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #rowMenu="matMenu">
                <button mat-menu-item (click)="viewTenant(tenant.id)">
                  <mat-icon>visibility</mat-icon>
                  <span>View Details</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>block</mat-icon>
                  <span>Suspend</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="clickable-row"
            (click)="viewTenant(row.id)"
          ></tr>
        </table>

        @if (tenants().length === 0 && !isLoading()) {
          <div class="empty-state">
            <span class="material-symbols-outlined">domain_disabled</span>
            <p>No tenants found. Create a new tenant to get started.</p>
          </div>
        }

        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        ></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .tenant-list {
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

    .filter-card {
      margin-bottom: 20px;
      border-radius: 12px;
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 280px;
    }

    .status-filters {
      display: flex;
      gap: 8px;

      .active-filter {
        background: rgba(124, 58, 237, 0.1);
        color: var(--accent-primary);
        border-color: var(--accent-primary);
      }
    }

    .table-card {
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.7);
      z-index: 10;
    }

    .full-width {
      width: 100%;
    }

    .tenant-name {
      display: flex;
      align-items: center;
      gap: 8px;

      .tenant-icon {
        font-size: 20px;
        color: var(--accent-primary);
      }
    }

    .identifier-code {
      font-family: 'Roboto Mono', monospace;
      font-size: 13px;
      padding: 2px 8px;
      background: var(--bg-secondary);
      border-radius: 4px;
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

    .clickable-row {
      cursor: pointer;

      &:hover {
        background: var(--bg-secondary);
      }
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

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  `],
})
export default class TenantListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  readonly searchControl = new FormControl('');
  readonly statusFilters = ['All', 'Active', 'Suspended', 'PendingSetup'];
  readonly displayedColumns = ['name', 'identifier', 'status', 'packageName', 'createdAt', 'actions'];
  readonly pageSize = 10;

  readonly tenants = signal<TenantSummary[]>([]);
  readonly totalCount = signal(0);
  readonly isLoading = signal(false);
  readonly activeStatus = signal('All');

  ngOnInit(): void {
    this.loadTenants();
  }

  filterByStatus(status: string): void {
    this.activeStatus.set(status);
    this.loadTenants();
  }

  onPageChange(event: PageEvent): void {
    this.loadTenants(event.pageIndex + 1, event.pageSize);
  }

  createTenant(): void {
    this.router.navigate(['/tenants/create']);
  }

  viewTenant(id: string): void {
    this.router.navigate(['/tenants', id]);
  }

  private loadTenants(page = 1, pageSize = this.pageSize): void {
    this.isLoading.set(true);

    const status = this.activeStatus() === 'All' ? undefined : this.activeStatus();
    const search = this.searchControl.value || undefined;

    this.api.get<any>('/platform/tenants', undefined).subscribe({
      next: (result) => {
        const rawItems = (result?.items || result?.data || []) as any[];
        const items: TenantSummary[] = rawItems.map((t: any) => ({
          id: t.id,
          name: t.name,
          identifier: t.identifier || t.slug || t.id,
          status: t.status || 'Active',
          packageName: t.packageName || t.subscriptionName || 'Standard',
          createdAt: t.createdAt,
        }));
        this.tenants.set(items);
        this.totalCount.set(result.totalCount ?? items.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
