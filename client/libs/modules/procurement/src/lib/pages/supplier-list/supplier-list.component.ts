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
  selectSuppliers,
  selectProcurementLoading,
} from '../../store/procurement.selectors';
import { SupplierStatus } from '../../models/supplier.model';

@Component({
  selector: 'ethel-supplier-list',
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
    <app-page-header [title]="'procurement.suppliers.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'procurement.suppliers.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'procurement.suppliers.create' | translate }}
      </button>
      <button mat-stroked-button (click)="onRequests()">
        <mat-icon>description</mat-icon>
        {{ 'procurement.requests.title' | translate }}
      </button>
      <button mat-stroked-button (click)="onOrders()">
        <mat-icon>shopping_cart</mat-icon>
        {{ 'procurement.orders.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <app-search-input placeholder="Search suppliers..." (search)="onSearch($event)"></app-search-input>

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
        [data]="suppliers()"
        [loading]="loading()"
        emptyTitle="No suppliers found"
        emptyMessage="Get started by adding your first supplier."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #ratingTpl let-row>
      {{ row.rating | number:'1.1-1' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class SupplierListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly suppliers = this.store.selectSignal(selectSuppliers);
  readonly loading = this.store.selectSignal(selectProcurementLoading);

  readonly search = signal('');
  readonly statusFilter = signal<SupplierStatus | undefined>(undefined);

  readonly statuses: SupplierStatus[] = ['Active', 'Inactive', 'Blacklisted'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly ratingTpl = viewChild<TemplateRef<unknown>>('ratingTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'rating', label: 'Rating', template: this.ratingTpl() },
  ]);

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.store.dispatch(
      ProcurementActions.loadSuppliers({
        status: this.statusFilter(),
        search: this.search() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.loadSuppliers();
  }

  onStatusFilter(status: SupplierStatus | undefined): void {
    this.statusFilter.set(status);
    this.loadSuppliers();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/procurement/suppliers', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/procurement/suppliers/create']);
  }

  onRequests(): void {
    this.router.navigate(['/procurement/requests']);
  }

  onOrders(): void {
    this.router.navigate(['/procurement/orders']);
  }
}
