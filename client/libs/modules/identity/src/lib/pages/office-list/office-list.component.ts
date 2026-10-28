import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { OfficeActions } from '../../store/office.actions';
import { selectOffices, selectOfficeTotalCount, selectOfficesLoading } from '../../store/office.selectors';

@Component({
  selector: 'ethel-office-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header title="Office Management">
      <button mat-flat-button color="primary" *appHasPermission="'identity.offices.create'" (click)="onCreateOffice()">
        <mat-icon>add</mat-icon>
        {{ 'offices.list.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <app-search-input placeholder="Search offices..." (search)="onSearch($event)"></app-search-input>

      <app-data-table
        [columns]="columns()"
        [data]="offices()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No offices found"
        emptyMessage="Get started by creating your first office."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
  `,
})
export default class OfficeListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly offices = this.store.selectSignal(selectOffices);
  readonly totalCount = this.store.selectSignal(selectOfficeTotalCount);
  readonly loading = this.store.selectSignal(selectOfficesLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code' },
    { key: 'parentOfficeName', label: 'Parent Office' },
    { key: 'locationName', label: 'Location' },
    { key: 'userCount', label: 'Users' },
  ]);

  ngOnInit(): void {
    this.loadOffices();
  }

  loadOffices(): void {
    this.store.dispatch(
      OfficeActions.loadOffices({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadOffices();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadOffices();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.loadOffices();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/offices', row.id]);
  }

  onCreateOffice(): void {
    this.router.navigate(['/offices/create']);
  }
}
