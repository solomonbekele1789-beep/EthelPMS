import { Component, ChangeDetectionStrategy, computed, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  LoadingSpinnerComponent,
} from '@ethelpms/shared/ui';
import { DonorsActions } from '../../store/donors.actions';
import { selectComplianceDashboard, selectDonorsLoading } from '../../store/donors.selectors';

@Component({
  selector: 'ethel-compliance-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'donors.compliance.title' | translate">
      <button mat-stroked-button (click)="onBackToGrants()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'donors.grants.title' | translate }}
      </button>
    </app-page-header>

    <div class="dashboard-container">
      <app-data-table
        [columns]="columns()"
        [data]="dashboardItems()"
        [loading]="loading()"
        emptyTitle="No compliance data"
        emptyMessage="No grants with compliance data found."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #complianceTpl let-row>
      <mat-chip [class.compliance-green]="row.complianceStatus === 'Green'"
                [class.compliance-amber]="row.complianceStatus === 'Amber'"
                [class.compliance-red]="row.complianceStatus === 'Red'">
        {{ row.complianceStatus }}
      </mat-chip>
    </ng-template>

    <ng-template #overdueTpl let-row>
      <span [class.overdue-badge]="row.overdueConditions > 0">
        {{ row.overdueConditions }}
      </span>
    </ng-template>

    <ng-template #nextDueDateTpl let-row>
      {{ row.nextDueDate ? (row.nextDueDate | date:'mediumDate') : '-' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .dashboard-container { display: flex; flex-direction: column; gap: 1rem; }
    .compliance-green { --mdc-chip-elevated-container-color: #c8e6c9; }
    .compliance-amber { --mdc-chip-elevated-container-color: #ffe0b2; }
    .compliance-red { --mdc-chip-elevated-container-color: #ffcdd2; }
    .overdue-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      border-radius: 12px;
      background-color: #f44336;
      color: white;
      font-weight: 500;
      font-size: 0.85rem;
      padding: 0 6px;
    }
  `,
})
export default class ComplianceDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly dashboardItems = this.store.selectSignal(selectComplianceDashboard);
  readonly loading = this.store.selectSignal(selectDonorsLoading);

  readonly complianceTpl = viewChild<TemplateRef<unknown>>('complianceTpl');
  readonly overdueTpl = viewChild<TemplateRef<unknown>>('overdueTpl');
  readonly nextDueDateTpl = viewChild<TemplateRef<unknown>>('nextDueDateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'donorName', label: 'Donor' },
    { key: 'grantNumber', label: 'Grant Number' },
    { key: 'complianceStatus', label: 'Compliance Status', template: this.complianceTpl() },
    { key: 'overdueConditions', label: 'Overdue Conditions', template: this.overdueTpl() },
    { key: 'nextDueDate', label: 'Next Due Date', template: this.nextDueDateTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(DonorsActions.loadComplianceDashboard());
  }

  onRowClick(row: any): void {
    this.router.navigate(['/donors/grants', row.grantId]);
  }

  onBackToGrants(): void {
    this.router.navigate(['/donors/grants']);
  }
}
