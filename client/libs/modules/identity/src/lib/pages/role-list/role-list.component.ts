import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BreadcrumbNavComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { RoleActions } from '../../store/role.actions';
import { selectRoles, selectRoleTotalCount, selectRolesLoading } from '../../store/role.selectors';

@Component({
  selector: 'ethel-role-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    BreadcrumbNavComponent,
    DataTableComponent,
    SearchInputComponent,
    HasPermissionDirective,
  ],
  template: `
    <div class="role-list-header">
      <app-breadcrumb-nav></app-breadcrumb-nav>

      <div class="header-row">
        <!-- Left: Role Management -->
        <div class="header-left">
          <h1 class="page-title">{{ 'roles.list.title' | translate }}</h1>
        </div>

        <!-- Center: Search Input -->
        <div class="header-center">
          <app-search-input
            placeholder="Search roles..."
            (search)="onSearch($event)">
          </app-search-input>
        </div>

        <!-- Right: New Role Button -->
        <div class="header-right">
          <button
            mat-flat-button
            color="primary"
            class="create-role-btn"
            *appHasPermission="'identity.roles.create'"
            (click)="onCreateRole()"
          >
            <mat-icon>add</mat-icon>
            <span>{{ 'roles.list.createButton' | translate }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="list-container">
      <app-data-table
        [columns]="columns()"
        [data]="roles()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No roles found"
        emptyMessage="Get started by creating your first role."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #systemRoleTpl let-row>
      @if (row.isSystemRole) {
        <mat-icon class="system-icon" matTooltip="System role">lock</mat-icon>
      }
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .role-list-header {
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
    .create-role-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.25rem;
      height: 40px;
      font-weight: 500;
      white-space: nowrap;
    }
    .create-role-btn mat-icon {
      margin-right: 4px;
    }
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .system-icon {
      color: var(--text-secondary, #666);
      font-size: 20px;
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
export default class RoleListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly roles = this.store.selectSignal(selectRoles);
  readonly totalCount = this.store.selectSignal(selectRoleTotalCount);
  readonly loading = this.store.selectSignal(selectRolesLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');

  readonly systemRoleTpl = viewChild<TemplateRef<unknown>>('systemRoleTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'permissionCount', label: 'Permissions' },
    { key: 'userCount', label: 'Users' },
    { key: 'isSystemRole', label: 'System', template: this.systemRoleTpl() },
  ]);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.store.dispatch(
      RoleActions.loadRoles({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadRoles();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadRoles();
  }

  onSortChange(_event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.loadRoles();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/roles', row.id]);
  }

  onCreateRole(): void {
    this.router.navigate(['/roles/create']);
  }
}
