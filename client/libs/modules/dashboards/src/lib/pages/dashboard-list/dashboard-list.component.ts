import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DashboardActions } from '../../store/dashboards.actions';
import { selectDashboards, selectDashboardsLoading } from '../../store/dashboards.selectors';
import { DashboardSummaryDto, DashboardType } from '../../models/dashboard.model';

@Component({
  selector: 'ethel-dashboard-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'dashboards.dashboards.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'dashboards.configs.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'dashboards.dashboards.create' | translate }}
      </button>
      <button mat-stroked-button *appHasPermission="'dashboards.filters.read'" (click)="onFilters()">
        <mat-icon>filter_list</mat-icon>
        {{ 'dashboards.filters.title' | translate }}
      </button>
    </app-page-header>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (dashboards().length === 0) {
      <app-empty-state
        icon="dashboard"
        title="No dashboards found"
        message="Create a new dashboard to get started.">
      </app-empty-state>
    } @else {
      <div class="dashboard-grid">
        @for (dashboard of dashboards(); track dashboard.id) {
          <mat-card class="dashboard-card" (click)="onSelect(dashboard)">
            <mat-card-header>
              <mat-icon mat-card-avatar>dashboard</mat-icon>
              <mat-card-title>{{ dashboard.name }}</mat-card-title>
              <mat-card-subtitle>
                <mat-chip [class]="'type-' + dashboard.dashboardType.toLowerCase()">
                  {{ dashboard.dashboardType }}
                </mat-chip>
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="card-stats">
                <span class="stat">
                  <mat-icon>widgets</mat-icon>
                  {{ dashboard.widgetCount }} {{ 'dashboards.fields.widgets' | translate }}
                </span>
                @if (dashboard.isDefault) {
                  <mat-chip class="default-chip">
                    {{ 'dashboards.fields.default' | translate }}
                  </mat-chip>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .dashboard-card {
      cursor: pointer;
      transition: box-shadow 0.2s ease;
    }
    .dashboard-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .card-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }
    .stat mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .default-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
    .type-executive { --mdc-chip-elevated-container-color: #e1bee7; }
    .type-projectportfolio { --mdc-chip-elevated-container-color: #bbdefb; }
    .type-finance { --mdc-chip-elevated-container-color: #c8e6c9; }
    .type-meal { --mdc-chip-elevated-container-color: #ffe0b2; }
    .type-participant { --mdc-chip-elevated-container-color: #b2dfdb; }
    .type-risk { --mdc-chip-elevated-container-color: #ffcdd2; }
    .type-procurement { --mdc-chip-elevated-container-color: #d1c4e9; }
    .type-performance { --mdc-chip-elevated-container-color: #f0f4c3; }
    .type-custom { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class DashboardListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly dashboards = this.store.selectSignal(selectDashboards);
  readonly loading = this.store.selectSignal(selectDashboardsLoading);

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadDashboards());
  }

  onSelect(dashboard: DashboardSummaryDto): void {
    this.router.navigate(['/dashboards', dashboard.id]);
  }

  onCreate(): void {
    this.router.navigate(['/dashboards/create']);
  }

  onFilters(): void {
    this.router.navigate(['/dashboards/filters']);
  }
}
