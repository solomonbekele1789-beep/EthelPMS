import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DonorsActions } from '../../store/donors.actions';
import {
  selectDonors,
  selectDonorsTotalCount,
  selectDonorsLoading,
} from '../../store/donors.selectors';

@Component({
  selector: 'ethel-donor-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'donors.donors.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'donors.donors.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'donors.donors.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <app-search-input placeholder="Search donors..." (search)="onSearch($event)"></app-search-input>

        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>{{ 'donors.fields.status' | translate }}</mat-label>
          <mat-select [value]="isActiveFilter()" (selectionChange)="onActiveFilter($event.value)">
            <mat-option [value]="null">{{ 'common.all' | translate }}</mat-option>
            <mat-option [value]="true">Active</mat-option>
            <mat-option [value]="false">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="donors()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No donors found"
        emptyMessage="Get started by adding your first donor."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #activeTpl let-row>
      <mat-chip [highlighted]="row.isActive">
        {{ row.isActive ? 'Active' : 'Inactive' }}
      </mat-chip>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .status-filter { width: 180px; }
  `,
})
export default class DonorListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly donors = this.store.selectSignal(selectDonors);
  readonly totalCount = this.store.selectSignal(selectDonorsTotalCount);
  readonly loading = this.store.selectSignal(selectDonorsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly isActiveFilter = signal<boolean | null>(null);

  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'acronym', label: 'Acronym' },
    { key: 'country', label: 'Country' },
    { key: 'email', label: 'Email' },
    { key: 'grantCount', label: 'Grants' },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
  ]);

  ngOnInit(): void {
    this.loadDonors();
  }

  loadDonors(): void {
    this.store.dispatch(
      DonorsActions.loadDonors({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
        isActive: this.isActiveFilter() ?? undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadDonors();
  }

  onActiveFilter(value: boolean | null): void {
    this.isActiveFilter.set(value);
    this.page.set(1);
    this.loadDonors();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadDonors();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/donors', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/donors/create']);
  }
}
