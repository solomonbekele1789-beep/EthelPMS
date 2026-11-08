import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProjectService, ProjectListItemDto } from '@ethelpms/modules/projects';
import { ReportActions } from '../../store/report.actions';
import { selectReports, selectReportTotalCount, selectReportingLoading } from '../../store/report.selectors';
import { ReportStatus, ReportType } from '../../models/report.model';

@Component({
  selector: 'ethel-report-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'reporting.list.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'reporting.reports.create'" (click)="onCreateReport()">
        <mat-icon>add</mat-icon>
        {{ 'common.create' | translate }}
      </button>
      <button mat-stroked-button (click)="onViewTemplates()">
        <mat-icon>description</mat-icon>
        {{ 'reporting.list.templates' | translate }}
      </button>
      <button mat-stroked-button (click)="onViewFinancialSummary()">
        <mat-icon>account_balance</mat-icon>
        {{ 'reporting.list.financialSummary' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="list-toolbar">
        <app-search-input placeholder="Search reports..." (search)="onSearch($event)"></app-search-input>

        <mat-form-field appearance="outline" class="project-filter-field" subscriptSizing="dynamic">
          <mat-label>Project Filter</mat-label>
          <mat-select [value]="selectedProjectId()" (selectionChange)="onProjectFilter($event.value)">
            <mat-option [value]="undefined">-- All Projects --</mat-option>
            @for (project of projects(); track project.id) {
              <mat-option [value]="project.id">[{{ project.code }}] {{ project.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="filter-chips">
        <span class="filter-label">{{ 'reporting.fields.status' | translate }}:</span>
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
              <app-status-badge [status]="status" [label]="'reporting.status.' + status | translate"></app-status-badge>
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <div class="filter-chips">
        <span class="filter-label">{{ 'reporting.fields.reportType' | translate }}:</span>
        <mat-chip-set>
          <mat-chip
            [highlighted]="!typeFilter()"
            (click)="onTypeFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (type of reportTypes; track type) {
            <mat-chip
              [highlighted]="typeFilter() === type"
              (click)="onTypeFilter(type)">
              {{ 'reporting.reportType.' + type | translate }}
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="filteredReports()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No reports found"
        emptyMessage="Get started by creating your first report."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #projectTpl let-row>
      <span class="project-code-badge" [title]="getProjectName(row.projectId)">
        {{ getProjectCode(row.projectId) }}
      </span>
    </ng-template>

    <ng-template #reportTypeTpl let-row>
      {{ 'reporting.reportType.' + row.reportType | translate }}
    </ng-template>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="'reporting.status.' + row.status | translate"></app-status-badge>
    </ng-template>

    <ng-template #periodTpl let-row>
      {{ row.periodStart | date:'mediumDate' }} – {{ row.periodEnd | date:'mediumDate' }}
    </ng-template>

    <ng-template #budgetTpl let-row>
      {{ row.plannedBudget | currency:'USD':'symbol':'1.0-0' }}
    </ng-template>

    <ng-template #spentTpl let-row>
      {{ row.actualSpent | currency:'USD':'symbol':'1.0-0' }}
    </ng-template>

    <ng-template #deadlineTpl let-row>
      {{ row.submissionDeadline ? (row.submissionDeadline | date:'mediumDate') : '-' }}
    </ng-template>

    <ng-template #createdTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .list-toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .project-filter-field { min-width: 280px; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .filter-label { font-weight: 500; white-space: nowrap; font-size: 0.85rem; color: #475569; }
    .project-code-badge {
      display: inline-block;
      font-family: monospace;
      font-weight: 600;
      font-size: 0.8rem;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      padding: 0.15rem 0.4rem;
    }
  `,
})
export default class ReportListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  readonly reports = this.store.selectSignal(selectReports);
  readonly totalCount = this.store.selectSignal(selectReportTotalCount);
  readonly loading = this.store.selectSignal(selectReportingLoading);

  readonly projects = signal<ProjectListItemDto[]>([]);
  readonly selectedProjectId = signal<string | undefined>(undefined);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<ReportStatus | undefined>(undefined);
  readonly typeFilter = signal<ReportType | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: ReportStatus[] = ['Draft', 'Submitted', 'UnderReview', 'Approved', 'Rejected'];
  readonly reportTypes: ReportType[] = ['Activity', 'Weekly', 'Monthly', 'Quarterly', 'BiAnnual', 'Annual', 'Incident'];

  readonly projectTpl = viewChild<TemplateRef<unknown>>('projectTpl');
  readonly reportTypeTpl = viewChild<TemplateRef<unknown>>('reportTypeTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly periodTpl = viewChild<TemplateRef<unknown>>('periodTpl');
  readonly budgetTpl = viewChild<TemplateRef<unknown>>('budgetTpl');
  readonly spentTpl = viewChild<TemplateRef<unknown>>('spentTpl');
  readonly deadlineTpl = viewChild<TemplateRef<unknown>>('deadlineTpl');
  readonly createdTpl = viewChild<TemplateRef<unknown>>('createdTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'projectId', label: 'Project', template: this.projectTpl() },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'reportType', label: 'Type', sortable: true, template: this.reportTypeTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'periodStart', label: 'Coverage Period', template: this.periodTpl() },
    { key: 'fiscalYear', label: 'Fiscal Year' },
    { key: 'plannedBudget', label: 'Planned Budget', sortable: true, template: this.budgetTpl() },
    { key: 'actualSpent', label: 'Actual Spent', template: this.spentTpl() },
    { key: 'submissionDeadline', label: 'Deadline', template: this.deadlineTpl() },
    { key: 'createdAt', label: 'Created', template: this.createdTpl() },
  ]);

  readonly filteredReports = computed(() => {
    const reports = this.reports();
    const pid = this.selectedProjectId();
    const status = this.statusFilter();
    const type = this.typeFilter();
    const term = this.search().toLowerCase();

    let filtered = reports;
    if (pid) {
      filtered = filtered.filter(r => r.projectId === pid);
    }
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    if (type) {
      filtered = filtered.filter(r => r.reportType === type);
    }
    if (term) {
      filtered = filtered.filter(r => r.title.toLowerCase().includes(term));
    }
    return filtered;
  });

  ngOnInit(): void {
    this.loadProjects();
    this.loadReports();
  }

  loadProjects(): void {
    this.projectService.listProjects(1, 100).subscribe({
      next: (res) => this.projects.set(res.items),
      error: () => {},
    });
  }

  loadReports(): void {
    this.store.dispatch(
      ReportActions.loadReports({
        page: this.page(),
        pageSize: this.pageSize(),
        projectId: this.selectedProjectId(),
        reportType: this.typeFilter(),
        status: this.statusFilter(),
      })
    );
  }

  onProjectFilter(projectId: string | undefined): void {
    this.selectedProjectId.set(projectId);
    this.page.set(1);
    this.loadReports();
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
  }

  onStatusFilter(status: ReportStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadReports();
  }

  onTypeFilter(type: ReportType | undefined): void {
    this.typeFilter.set(type);
    this.page.set(1);
    this.loadReports();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadReports();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
  }

  onRowClick(row: any): void {
    this.router.navigate(['/reporting', row.id]);
  }

  onCreateReport(): void {
    const queryParams = this.selectedProjectId() ? { projectId: this.selectedProjectId() } : undefined;
    this.router.navigate(['/reporting/create'], { queryParams });
  }

  onViewTemplates(): void {
    this.router.navigate(['/reporting/templates']);
  }

  onViewFinancialSummary(): void {
    const queryParams = this.selectedProjectId() ? { projectId: this.selectedProjectId() } : undefined;
    this.router.navigate(['/reporting/financial-summary'], { queryParams });
  }

  getProjectCode(projectId: string): string {
    const proj = this.projects().find(p => p.id === projectId);
    return proj ? proj.code : projectId.substring(0, 8);
  }

  getProjectName(projectId: string): string {
    const proj = this.projects().find(p => p.id === projectId);
    return proj ? proj.name : projectId;
  }
}
