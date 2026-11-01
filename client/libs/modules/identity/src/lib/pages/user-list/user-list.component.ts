import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BreadcrumbNavComponent,
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
    BreadcrumbNavComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <div class="user-list-header">
      <app-breadcrumb-nav></app-breadcrumb-nav>

      <div class="header-row">
        <!-- Left: User Management -->
        <div class="header-left">
          <h1 class="page-title">User Management</h1>
        </div>

        <!-- Center: Search Input -->
        <div class="header-center">
          <app-search-input
            placeholder="Search users by name, email..."
            (search)="onSearch($event)">
          </app-search-input>
        </div>

        <!-- Right: New User Button -->
        <div class="header-right">
          <button
            mat-flat-button
            color="primary"
            class="create-user-btn"
            *appHasPermission="'identity.users.create'"
            (click)="onCreateUser()"
          >
            <mat-icon>add</mat-icon>
            <span>{{ 'users.list.createButton' | translate }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="list-container">
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
    :host {
      display: block;
      width: 100%;
    }
    .user-list-header {
      width: 100%;
      padding: 0.75rem 0 1rem;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      width: 100%;
      margin-top: 0.5rem;
    }
    .header-left {
      flex: 0 0 auto;
    }
    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.3;
      white-space: nowrap;
    }
    .header-center {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 480px;
    }
    .header-right {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
    }
    .create-user-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.25rem;
      height: 40px;
      font-weight: 500;
      white-space: nowrap;
    }
    .create-user-btn mat-icon {
      margin-right: 4px;
    }
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    @media (max-width: 800px) {
      .header-row {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      .header-center {
        max-width: 100%;
      }
      .header-right {
        justify-content: flex-end;
      }
    }
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
