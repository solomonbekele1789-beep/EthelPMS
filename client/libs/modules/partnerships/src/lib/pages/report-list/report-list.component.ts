import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectReports, selectPartnershipsLoading } from '../../store/partnerships.selectors';
import { ReportStatus } from '../../models/partner-report.model';

@Component({
  selector: 'ethel-report-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'partnerships.reports.title' | translate">
      <button mat-stroked-button (click)="onBackToPartners()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'partnerships.partners.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!statusFilter()"
            (click)="onStatusFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (status of statuses; track status) {
            <mat-chip
              [highlighted]="statusFilter() === status"
              (click)="onStatusFilter(status)">
              <app-status-badge [status]="status" [label]="status"></app-status-badge>
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="reports()"
        [loading]="loading()"
        emptyTitle="No reports found"
        emptyMessage="Partner reports will appear here once created."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class ReportListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly reports = this.store.selectSignal(selectReports);
  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  readonly statusFilter = signal<ReportStatus | undefined>(undefined);

  readonly statuses: ReportStatus[] = ['Draft', 'Submitted', 'UnderReview', 'Approved', 'Rejected', 'RevisionRequested'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'subGranteeName', label: 'Partner', sortable: true },
    { key: 'title', label: 'Title' },
    { key: 'reportType', label: 'Type' },
    { key: 'reportingPeriodStart', label: 'Period Start' },
    { key: 'reportingPeriodEnd', label: 'Period End' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
  ]);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.store.dispatch(
      PartnershipsActions.loadReports({
        status: this.statusFilter(),
      })
    );
  }

  onStatusFilter(status: ReportStatus | undefined): void {
    this.statusFilter.set(status);
    this.loadReports();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/partnerships/reports', row.id]);
  }

  onBackToPartners(): void {
    this.router.navigate(['/partnerships/partners']);
  }
}
