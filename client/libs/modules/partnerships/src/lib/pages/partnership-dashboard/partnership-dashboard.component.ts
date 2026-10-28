import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe, CurrencyPipe, KeyValuePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
} from '@ethelpms/shared/ui';
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectDashboard, selectPartnershipsLoading } from '../../store/partnerships.selectors';

@Component({
  selector: 'ethel-partnership-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    DecimalPipe,
    CurrencyPipe,
    KeyValuePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'partnerships.dashboard.title' | translate">
      <button mat-stroked-button (click)="onBackToPartners()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'partnerships.partners.title' | translate }}
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
              <mat-card-title>{{ 'partnerships.dashboard.totalPartners' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value">{{ dashboard()!.totalPartners }}</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>{{ 'partnerships.dashboard.activePartners' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value active">{{ dashboard()!.activePartners }}</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>{{ 'partnerships.dashboard.totalDisbursed' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value">{{ dashboard()!.totalDisbursed | currency:'USD':'symbol':'1.0-0' }}</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card" [class.warning-card]="dashboard()!.pendingReports > 0">
            <mat-card-header>
              <mat-card-title>{{ 'partnerships.dashboard.pendingReports' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value" [class.warning]="dashboard()!.pendingReports > 0">
                {{ dashboard()!.pendingReports }}
              </span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card" [class.danger-card]="dashboard()!.overdueCompliance > 0">
            <mat-card-header>
              <mat-card-title>{{ 'partnerships.dashboard.overdueCompliance' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <span class="summary-value" [class.danger]="dashboard()!.overdueCompliance > 0">
                {{ dashboard()!.overdueCompliance }}
              </span>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Risk Distribution -->
        <div class="risk-section">
          <h3 class="section-title">{{ 'partnerships.dashboard.riskDistribution' | translate }}</h3>
          <div class="risk-grid">
            @for (entry of dashboard()!.riskDistribution | keyvalue; track entry.key) {
              <mat-card class="risk-card">
                <mat-card-content>
                  <mat-chip [class.risk-low]="entry.key === 'Low'"
                            [class.risk-medium]="entry.key === 'Medium'"
                            [class.risk-high]="entry.key === 'High'"
                            [class.risk-critical]="entry.key === 'Critical'">
                    {{ entry.key }}
                  </mat-chip>
                  <span class="risk-count">{{ entry.value }}</span>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </div>
      </div>
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
    .summary-value.active { color: #388e3c; }
    .summary-value.warning { color: #f57c00; }
    .summary-value.danger { color: #d32f2f; }
    .warning-card { border: 2px solid #ffe0b2; }
    .danger-card { border: 2px solid #ffcdd2; }
    .section-title {
      margin: 0 0 0.75rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .risk-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }
    .risk-card mat-card-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .risk-count {
      font-size: 1.5rem;
      font-weight: 600;
    }
    .risk-low { --mdc-chip-elevated-container-color: #c8e6c9; }
    .risk-medium { --mdc-chip-elevated-container-color: #ffe0b2; }
    .risk-high { --mdc-chip-elevated-container-color: #ffcdd2; }
    .risk-critical { --mdc-chip-elevated-container-color: #f8bbd0; }
  `,
})
export default class PartnershipDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly dashboard = this.store.selectSignal(selectDashboard);
  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  ngOnInit(): void {
    this.store.dispatch(PartnershipsActions.loadDashboard({}));
  }

  onBackToPartners(): void {
    this.router.navigate(['/partnerships/partners']);
  }
}
