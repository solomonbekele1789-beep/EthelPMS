import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BreadcrumbNavComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProjectActions } from '../../store/project.actions';
import { selectProjects, selectProjectTotalCount, selectProjectsLoading } from '../../store/project.selectors';
import { ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'ethel-project-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    BreadcrumbNavComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <div class="project-list-header">
      <app-breadcrumb-nav></app-breadcrumb-nav>

      <div class="header-row">
        <!-- Left: Project Management -->
        <div class="header-left">
          <h1 class="page-title">{{ 'projects.list.title' | translate }}</h1>
        </div>

        <!-- Center: Search Input -->
        <div class="header-center">
          <app-search-input
            placeholder="Search projects..."
            (search)="onSearch($event)">
          </app-search-input>
        </div>

        <!-- Right: New Project Button -->
        <div class="header-right">
          <button
            mat-flat-button
            color="primary"
            class="create-project-btn"
            *appHasPermission="'projects.projects.create'"
            (click)="onCreateProject()"
          >
            <mat-icon>add</mat-icon>
            <span>{{ 'projects.list.createButton' | translate }}</span>
          </button>
        </div>
      </div>
    </div>

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
        [data]="projects()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No projects found"
        emptyMessage="Get started by creating your first project."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.startDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #endDateTpl let-row>
      {{ row.endDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #budgetTpl let-row>
      {{ row.totalBudget | currency:'USD':'symbol':'1.0-0' }}
    </ng-template>

    <ng-template #beneficiariesTpl let-row>
      {{ row.totalDirectBeneficiaries | number }}
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .project-list-header {
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
    .create-project-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.25rem;
      height: 40px;
      font-weight: 500;
      white-space: nowrap;
    }
    .create-project-btn mat-icon {
      margin-right: 4px;
    }
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .filter-chips {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
export default class ProjectListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly projects = this.store.selectSignal(selectProjects);
  readonly totalCount = this.store.selectSignal(selectProjectTotalCount);
  readonly loading = this.store.selectSignal(selectProjectsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<ProjectStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: ProjectStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly endDateTpl = viewChild<TemplateRef<unknown>>('endDateTpl');
  readonly budgetTpl = viewChild<TemplateRef<unknown>>('budgetTpl');
  readonly beneficiariesTpl = viewChild<TemplateRef<unknown>>('beneficiariesTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'donorName', label: 'Donor' },
    { key: 'startDate', label: 'Start Date', sortable: true, template: this.dateTpl() },
    { key: 'endDate', label: 'End Date', sortable: true, template: this.endDateTpl() },
    { key: 'totalBudget', label: 'Budget', sortable: true, template: this.budgetTpl() },
    { key: 'totalDirectBeneficiaries', label: 'Beneficiaries', template: this.beneficiariesTpl() },
  ]);

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.store.dispatch(
      ProjectActions.loadProjects({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
        status: this.statusFilter(),
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadProjects();
  }

  onStatusFilter(status: ProjectStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadProjects();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadProjects();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
    this.loadProjects();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/projects', row.id]);
  }

  onCreateProject(): void {
    this.router.navigate(['/projects/create']);
  }
}
