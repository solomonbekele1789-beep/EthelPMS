import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FundAccountingActions } from '../../store/fund-accounting.actions';
import {
  selectJournalEntries,
  selectJournalEntriesTotalCount,
  selectFundAccountingLoading,
} from '../../store/fund-accounting.selectors';
import { JournalEntryService } from '../../services/journal-entry.service';
import { JournalEntryStatus } from '../../models/journal-entry.model';

@Component({
  selector: 'ethel-journal-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'finance.journals.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'fundacct.journals.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'finance.journals.create' | translate }}
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
        [data]="entries()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No journal entries found"
        emptyMessage="Get started by creating your first journal entry."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #debitTpl let-row>
      {{ row.totalDebit | number:'1.2-2' }}
    </ng-template>

    <ng-template #creditTpl let-row>
      {{ row.totalCredit | number:'1.2-2' }}
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.transactionDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #actionsTpl let-row>
      @if (row.status === 'Draft') {
        <button mat-stroked-button color="primary" *appHasPermission="'fundacct.journals.post'" (click)="onPost(row.id, $event)">
          <mat-icon>check_circle</mat-icon>
          {{ 'finance.journals.post' | translate }}
        </button>
      }
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class JournalListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly journalService = inject(JournalEntryService);
  private readonly notification = inject(NotificationService);

  readonly entries = this.store.selectSignal(selectJournalEntries);
  readonly totalCount = this.store.selectSignal(selectJournalEntriesTotalCount);
  readonly loading = this.store.selectSignal(selectFundAccountingLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly statusFilter = signal<JournalEntryStatus | undefined>(undefined);

  readonly statuses: JournalEntryStatus[] = ['Draft', 'Posted', 'Reversed'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly debitTpl = viewChild<TemplateRef<unknown>>('debitTpl');
  readonly creditTpl = viewChild<TemplateRef<unknown>>('creditTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'referenceNumber', label: 'Reference Number', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'transactionDate', label: 'Date', template: this.dateTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'totalDebit', label: 'Total Debit', template: this.debitTpl() },
    { key: 'totalCredit', label: 'Total Credit', template: this.creditTpl() },
    { key: 'actions', label: 'Actions', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.store.dispatch(
      FundAccountingActions.loadJournalEntries({
        status: this.statusFilter(),
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onStatusFilter(status: JournalEntryStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadEntries();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadEntries();
  }

  onRowClick(row: any): void {
    // Navigate to detail view if needed
  }

  onCreate(): void {
    this.router.navigate(['/finance/journals/create']);
  }

  onPost(id: string, event: Event): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to post this journal entry? This action cannot be undone.')) return;
    this.journalService.postEntry(id).subscribe({
      next: () => {
        this.notification.success('Journal entry posted successfully');
        this.loadEntries();
      },
      error: () => this.notification.error('Failed to post journal entry'),
    });
  }
}
