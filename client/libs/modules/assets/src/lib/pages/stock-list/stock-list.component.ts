import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  LoadingSpinnerComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import {
  selectStockItems,
  selectAssetsLoading,
} from '../../store/assets.selectors';
import { StockItemDto } from '../../models/stock.model';

@Component({
  selector: 'ethel-stock-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'assets.stock.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'assets.stock.create'" (click)="onCreateStockItem()">
        <mat-icon>add</mat-icon>
        {{ 'assets.stock.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="category-filter">
          <mat-label>{{ 'assets.fields.category' | translate }}</mat-label>
          <input matInput [value]="categoryFilter()" (input)="onCategoryFilter($any($event.target).value)" />
        </mat-form-field>

        <app-search-input placeholder="Search stock items..." (search)="onSearch($event)"></app-search-input>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="stockItems()"
        [loading]="loading()"
        emptyTitle="No stock items found"
        emptyMessage="Get started by creating your first stock item."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #quantityTpl let-row>
      <span [class.low-stock]="row.quantityOnHand <= row.reorderLevel">
        {{ row.quantityOnHand }}
        @if (row.quantityOnHand <= row.reorderLevel) {
          <mat-icon class="low-stock-icon" [matTooltip]="'assets.messages.lowStock' | translate">warning</mat-icon>
        }
      </span>
    </ng-template>

    <ng-template #unitCostTpl let-row>
      {{ row.unitCost | number:'1.2-2' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .category-filter { width: 200px; }
    .low-stock { color: #e65100; font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem; }
    .low-stock-icon { font-size: 18px; width: 18px; height: 18px; color: #e65100; }
  `,
})
export default class StockListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly stockItems = this.store.selectSignal(selectStockItems);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly search = signal('');
  readonly categoryFilter = signal('');

  readonly quantityTpl = viewChild<TemplateRef<unknown>>('quantityTpl');
  readonly unitCostTpl = viewChild<TemplateRef<unknown>>('unitCostTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'itemCode', label: 'Item Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'quantityOnHand', label: 'Qty on Hand', template: this.quantityTpl() },
    { key: 'reorderLevel', label: 'Reorder Level' },
    { key: 'unitCost', label: 'Unit Cost', template: this.unitCostTpl() },
    { key: 'storageLocation', label: 'Storage Location' },
  ]);

  ngOnInit(): void {
    this.loadStockItems();
  }

  loadStockItems(): void {
    this.store.dispatch(
      AssetsActions.loadStockItems({
        category: this.categoryFilter() || undefined,
        search: this.search() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.loadStockItems();
  }

  onCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
    this.loadStockItems();
  }

  onRowClick(row: StockItemDto): void {
    this.router.navigate(['/assets/stock', row.id]);
  }

  onCreateStockItem(): void {
    this.router.navigate(['/assets/stock/create']);
  }
}
