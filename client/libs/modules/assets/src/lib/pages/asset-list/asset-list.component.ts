import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
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
  SearchInputComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import {
  selectAssets,
  selectAssetsTotalCount,
  selectAssetsLoading,
} from '../../store/assets.selectors';
import { AssetDto, AssetStatus } from '../../models/asset.model';

@Component({
  selector: 'ethel-asset-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'assets.register.list' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'assets.register.create'" (click)="onRegisterAsset()">
        <mat-icon>add</mat-icon>
        {{ 'assets.actions.register' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <div class="status-chips">
          @for (status of statusFilters; track status.value) {
            <mat-chip-option
              [selected]="statusFilter() === status.value"
              (selectionChange)="onStatusFilter(status.value)">
              {{ status.label }}
            </mat-chip-option>
          }
        </div>

        <app-search-input placeholder="Search assets..." (search)="onSearch($event)"></app-search-input>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="assets()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No assets found"
        emptyMessage="Get started by registering your first asset."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #conditionTpl let-row>
      <mat-chip>{{ row.condition }}</mat-chip>
    </ng-template>

    <ng-template #bookValueTpl let-row>
      {{ row.currentBookValue | number:'1.2-2' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .status-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  `,
})
export default class AssetListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly assets = this.store.selectSignal(selectAssets);
  readonly totalCount = this.store.selectSignal(selectAssetsTotalCount);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly search = signal('');
  readonly statusFilter = signal<string | undefined>(undefined);
  readonly page = signal(1);
  readonly pageSize = signal(20);

  readonly statusFilters: { value: string | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'InMaintenance', label: 'In Maintenance' },
    { value: 'Disposed', label: 'Disposed' },
    { value: 'Lost', label: 'Lost' },
    { value: 'Transferred', label: 'Transferred' },
  ];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly conditionTpl = viewChild<TemplateRef<unknown>>('conditionTpl');
  readonly bookValueTpl = viewChild<TemplateRef<unknown>>('bookValueTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'assetCode', label: 'Asset Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'categoryName', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'condition', label: 'Condition', template: this.conditionTpl() },
    { key: 'currentBookValue', label: 'Book Value', template: this.bookValueTpl() },
  ]);

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.store.dispatch(
      AssetsActions.loadAssets({
        status: this.statusFilter(),
        search: this.search() || undefined,
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadAssets();
  }

  onStatusFilter(status: string | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadAssets();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadAssets();
  }

  onRowClick(row: AssetDto): void {
    this.router.navigate(['/assets', row.id]);
  }

  onRegisterAsset(): void {
    this.router.navigate(['/assets/register']);
  }
}
