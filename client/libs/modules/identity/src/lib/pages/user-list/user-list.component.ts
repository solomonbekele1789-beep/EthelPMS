import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { UserActions } from '../../store/user.actions';
import { selectUsers, selectUserTotalCount, selectUsersLoading } from '../../store/user.selectors';

@Component({
  selector: 'ethel-user-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header title="User Management">
      <button mat-flat-button color="primary" *appHasPermission="'identity.users.create'" (click)="onCreateUser()">
        <mat-icon>add</mat-icon>
        {{ 'users.list.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <app-search-input placeholder="Search users..." (search)="onSearch($event)"></app-search-input>

      <app-data-table
        [columns]="columns()"
        [data]="users()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No users found"
        emptyMessage="Get started by inviting your first user."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #rolesTpl let-row>
      <mat-chip-set>
        @for (role of row.roles; track role) {
          <mat-chip>{{ role }}</mat-chip>
        }
      </mat-chip-set>
    </ng-template>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.isActive ? 'active' : 'inactive'" [label]="row.isActive ? 'Active' : 'Inactive'"></app-status-badge>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
  `,
})
export default class UserListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly users = this.store.selectSignal(selectUsers);
  readonly totalCount = this.store.selectSignal(selectUserTotalCount);
  readonly loading = this.store.selectSignal(selectUsersLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly rolesTpl = viewChild<TemplateRef<unknown>>('rolesTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'roles', label: 'Roles', template: this.rolesTpl() },
    { key: 'officeName', label: 'Office' },
    { key: 'isActive', label: 'Status', template: this.statusTpl() },
    { key: 'createdAt', label: 'Created', sortable: true, template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.store.dispatch(
      UserActions.loadUsers({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
        sortBy: this.sortBy(),
        sortDirection: this.sortDir(),
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadUsers();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
    this.loadUsers();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/users', row.id]);
  }

  onCreateUser(): void {
    this.router.navigate(['/users/create']);
  }
}
