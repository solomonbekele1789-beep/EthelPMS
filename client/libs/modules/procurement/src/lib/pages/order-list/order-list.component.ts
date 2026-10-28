import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
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
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProcurementActions } from '../../store/procurement.actions';
import {
  selectPurchaseOrders,
  selectOrderTotalCount,
  selectProcurementLoading,
} from '../../store/procurement.selectors';
import { PurchaseOrderStatus } from '../../models/purchase-order.model';

@Component({
  selector: 'ethel-order-list',
  standalone: true,
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
    <app-page-header [title]="'procurement.orders.title' | translate">
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
        [data]="orders()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No purchase orders found"
        emptyMessage="Purchase orders will appear here."
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

    <ng-template #dateTpl let-row>
      {{ row.expectedDeliveryDate ? (row.expectedDeliveryDate | date:'mediumDate') : '-' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class OrderListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly orders = this.store.selectSignal(selectPurchaseOrders);
  readonly totalCount = this.store.selectSignal(selectOrderTotalCount);
  readonly loading = this.store.selectSignal(selectProcurementLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly statusFilter = signal<PurchaseOrderStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: PurchaseOrderStatus[] = ['Draft', 'Issued', 'PartiallyReceived', 'FullyReceived', 'Closed', 'Cancelled'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly amountTpl = viewChild<TemplateRef<unknown>>('amountTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'referenceNumber', label: 'Reference Number', sortable: true },
    { key: 'supplierId', label: 'Supplier ID' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'totalAmount', label: 'Total Amount', template: this.amountTpl() },
    { key: 'expectedDeliveryDate', label: 'Expected Delivery', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.store.dispatch(
      ProcurementActions.loadPurchaseOrders({
        status: this.statusFilter(),
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onStatusFilter(status: PurchaseOrderStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadOrders();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadOrders();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
    this.loadOrders();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/procurement/orders', row.id]);
  }

  onSuppliers(): void {
    this.router.navigate(['/procurement/suppliers']);
  }
}
