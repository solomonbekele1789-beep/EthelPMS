import { Component, ChangeDetectionStrategy, computed, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  LoadingSpinnerComponent,
} from '@ethelpms/shared/ui';
import { FeedbackActions } from '../../store/feedback.actions';
import { selectDashboard, selectFeedbackLoading } from '../../store/feedback.selectors';

@Component({
  selector: 'ethel-feedback-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'feedback.dashboard.title' | translate">
      <button mat-stroked-button (click)="onBackToList()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'feedback.feedback.title' | translate }}
      </button>
    </app-page-header>

    @if (loading() && !dashboard()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (dashboard()) {
      <div class="dashboard-container">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>{{ 'feedback.dashboard.totalCount' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value">{{ dashboard()!.totalCount }}</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>{{ 'feedback.dashboard.resolvedCount' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value resolved">{{ dashboard()!.resolvedCount }}</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>{{ 'feedback.dashboard.avgResolutionDays' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value">{{ dashboard()!.avgResolutionDays | number:'1.1-1' }} days</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card" [class.breached-card]="dashboard()!.slaBreachedCount > 0">
            <mat-card-header>
              <mat-card-title>{{ 'feedback.dashboard.slaBreachedCount' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value" [class.breached]="dashboard()!.slaBreachedCount > 0">
                {{ dashboard()!.slaBreachedCount }}
              </span>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- By Category Table -->
        <div class="table-section">
          <h3 class="section-title">{{ 'feedback.dashboard.byCategory' | translate }}</h3>
          <app-data-table
            [columns]="categoryColumns()"
            [data]="dashboard()!.byCategory"
            [loading]="false"
            emptyTitle="No category data"
            emptyMessage="No feedback data by category available.">
          </app-data-table>
        </div>

        <!-- By Status Table -->
        <div class="table-section">
          <h3 class="section-title">{{ 'feedback.dashboard.byStatus' | translate }}</h3>
          <app-data-table
            [columns]="statusColumns()"
            [data]="dashboard()!.byStatus"
            [loading]="false"
            emptyTitle="No status data"
            emptyMessage="No feedback data by status available.">
          </app-data-table>
        </div>
      </div>

      <ng-template #statusChipTpl let-row>
        <mat-chip [class.status-new]="row.status === 'New'"
                  [class.status-acknowledged]="row.status === 'Acknowledged'"
                  [class.status-under-review]="row.status === 'UnderReview'"
                  [class.status-escalated]="row.status === 'Escalated'"
                  [class.status-resolved]="row.status === 'Resolved'"
                  [class.status-closed]="row.status === 'Closed'">
          {{ row.status }}
        </mat-chip>
      </ng-template>
    }
  `,
  styles: `
    :host { display: block; }
    .dashboard-container { display: flex; flex-direction: column; gap: 2rem; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .summary-card { text-align: center; }
    .summary-value {
      font-size: 2rem;
      font-weight: 600;
      line-height: 1.2;
    }
    .summary-value.resolved { color: #388e3c; }
    .summary-value.breached { color: #d32f2f; }
    .breached-card {
      border: 2px solid #ffcdd2;
    }
    .section-title {
      margin: 0 0 0.75rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .table-section { margin-bottom: 1rem; }
    .status-new { --mdc-chip-elevated-container-color: #bbdefb; }
    .status-acknowledged { --mdc-chip-elevated-container-color: #b2dfdb; }
    .status-under-review { --mdc-chip-elevated-container-color: #ffe0b2; }
    .status-escalated { --mdc-chip-elevated-container-color: #ffcdd2; }
    .status-resolved { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-closed { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class FeedbackDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly dashboard = this.store.selectSignal(selectDashboard);
  readonly loading = this.store.selectSignal(selectFeedbackLoading);

  readonly statusChipTpl = viewChild<TemplateRef<unknown>>('statusChipTpl');

  readonly categoryColumns = computed<TableColumn[]>(() => [
    { key: 'categoryName', label: 'Category' },
    { key: 'count', label: 'Count' },
  ]);

  readonly statusColumns = computed<TableColumn[]>(() => [
    { key: 'status', label: 'Status', template: this.statusChipTpl() },
    { key: 'count', label: 'Count' },
  ]);

  ngOnInit(): void {
    this.store.dispatch(FeedbackActions.loadDashboard());
  }

  onBackToList(): void {
    this.router.navigate(['/feedback']);
  }
}
