import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProcurementActions } from '../../store/procurement.actions';
import {
  selectPurchaseRequests,
  selectRequestTotalCount,
  selectProcurementLoading,
} from '../../store/procurement.selectors';
import { ProcurementStatus } from '../../models/procurement-plan.model';

@Component({
  selector: 'ethel-request-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'procurement.requests.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'procurement.requests.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'procurement.requests.create' | translate }}
      </button>
      <button mat-stroked-button (click)="onSuppliers()">
        <mat-icon>business</mat-icon>
        {{ 'procurement.suppliers.title' | translate }}
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
        [data]="requests()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No purchase requests found"
        emptyMessage="Create your first purchase request."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #amountTpl let-row>
      {{ row.totalAmount | number:'1.2-2' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class RequestListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly requests = this.store.selectSignal(selectPurchaseRequests);
  readonly totalCount = this.store.selectSignal(selectRequestTotalCount);
  readonly loading = this.store.selectSignal(selectProcurementLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly statusFilter = signal<ProcurementStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: ProcurementStatus[] = ['Draft', 'Submitted', 'UnderReview', 'Approved', 'Rejected', 'Cancelled'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly amountTpl = viewChild<TemplateRef<unknown>>('amountTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'referenceNumber', label: 'Reference Number', sortable: true },
    { key: 'projectId', label: 'Project' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'totalAmount', label: 'Total Amount', template: this.amountTpl() },
    { key: 'method', label: 'Method' },
  ]);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.store.dispatch(
      ProcurementActions.loadPurchaseRequests({
        status: this.statusFilter(),
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onStatusFilter(status: ProcurementStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadRequests();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadRequests();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
    this.loadRequests();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/procurement/requests', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/procurement/requests/create']);
  }

  onSuppliers(): void {
    this.router.navigate(['/procurement/suppliers']);
  }
}
