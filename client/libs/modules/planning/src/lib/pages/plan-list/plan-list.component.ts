import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe, CurrencyPipe, DecimalPipe, LowerCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PlanActions } from '../../store/plan.actions';
import { selectPlans, selectPlanTotalCount, selectPlanningLoading } from '../../store/plan.selectors';
import { ApprovalStatus } from '../../models/plan.model';
import { ProjectService, ProjectListItemDto } from '@ethelpms/modules/projects';

@Component({
  selector: 'ethel-plan-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    LowerCasePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'planning.list.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'planning.annual.create'" (click)="onCreatePlan()">
        <mat-icon>add</mat-icon>
        {{ 'planning.list.createButton' | translate }}
      </button>
      <button mat-stroked-button (click)="onViewHierarchy()">
        <mat-icon>account_tree</mat-icon>
        {{ 'planning.list.viewHierarchy' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="list-toolbar">
        <app-search-input placeholder="Search plans..." (search)="onSearch($event)"></app-search-input>

        <mat-form-field appearance="outline" class="project-select">
          <mat-label>Filter by Project</mat-label>
          <mat-select [value]="projectId()" (selectionChange)="onProjectSelect($event.value)">
            <mat-option value="">-- All Projects --</mat-option>
            @for (proj of projects(); track proj.id) {
              <mat-option [value]="proj.id">
                [{{ proj.code }}] {{ proj.name }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

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
        [data]="filteredPlans()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No plans found"
        emptyMessage="Get started by selecting a project and creating your first operational plan."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #projectTpl let-row>
      <span class="project-tag">{{ getProjectCode(row.projectId) }}</span>
    </ng-template>

    <ng-template #levelTpl let-row>
      <span class="level-pill level-{{ row.level | lowercase }}">{{ row.level }}</span>
    </ng-template>

    <ng-template #periodTpl let-row>
      @if (row.fiscalYear) {
        <span class="period-text">FY{{ row.fiscalYear }}</span>
      }
      @if (row.quarter) {
        <span class="period-text">Q{{ row.quarter }}</span>
      }
      @if (row.month) {
        <span class="period-text">M{{ row.month }}</span>
      }
      @if (row.weekNumber) {
        <span class="period-text">Wk {{ row.weekNumber }}</span>
      }
    </ng-template>

    <ng-template #startDateTpl let-row>
      {{ row.plannedStartDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #endDateTpl let-row>
      {{ row.plannedEndDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #budgetTpl let-row>
      {{ row.plannedBudget | currency:'USD':'symbol':'1.0-0' }}
    </ng-template>

    <ng-template #beneficiariesTpl let-row>
      <span class="beneficiaries-text">
        {{ (row.totalBeneficiaries ?? 0) | number }}
      </span>
    </ng-template>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.approvalStatus" [label]="row.approvalStatus"></app-status-badge>
    </ng-template>

    <ng-template #progressTpl let-row>
      {{ row.progressPercentage | number:'1.0-1' }}%
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .list-toolbar { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .project-select { min-width: 320px; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .project-tag {
      font-weight: 600;
      color: #3b82f6;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.8rem;
    }
    .level-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .level-annual { background: #e0e7ff; color: #3730a3; }
    .level-quarterly { background: #dbeafe; color: #1e40af; }
    .level-monthly { background: #e0f2fe; color: #0369a1; }
    .level-weekly { background: #f0fdf4; color: #166534; }
    .level-daily { background: #fef3c7; color: #92400e; }
    .period-text {
      background: #f1f5f9;
      color: #475569;
      font-size: 0.75rem;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      margin-right: 0.25rem;
      font-weight: 500;
    }
    .beneficiaries-text {
      font-weight: 500;
      color: #0f766e;
    }
  `,
})
export default class PlanListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  readonly plans = this.store.selectSignal(selectPlans);
  readonly totalCount = this.store.selectSignal(selectPlanTotalCount);
  readonly loading = this.store.selectSignal(selectPlanningLoading);

  readonly projects = signal<ProjectListItemDto[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly projectId = signal('');
  readonly statusFilter = signal<ApprovalStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: ApprovalStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

  readonly projectTpl = viewChild<TemplateRef<unknown>>('projectTpl');
  readonly levelTpl = viewChild<TemplateRef<unknown>>('levelTpl');
  readonly periodTpl = viewChild<TemplateRef<unknown>>('periodTpl');
  readonly startDateTpl = viewChild<TemplateRef<unknown>>('startDateTpl');
  readonly endDateTpl = viewChild<TemplateRef<unknown>>('endDateTpl');
  readonly budgetTpl = viewChild<TemplateRef<unknown>>('budgetTpl');
  readonly beneficiariesTpl = viewChild<TemplateRef<unknown>>('beneficiariesTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly progressTpl = viewChild<TemplateRef<unknown>>('progressTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'projectId', label: 'Project', template: this.projectTpl() },
    { key: 'level', label: 'Level', sortable: true, template: this.levelTpl() },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'period', label: 'Period', template: this.periodTpl() },
    { key: 'plannedStartDate', label: 'Start Date', sortable: true, template: this.startDateTpl() },
    { key: 'plannedEndDate', label: 'End Date', sortable: true, template: this.endDateTpl() },
    { key: 'plannedBudget', label: 'Budget', sortable: true, template: this.budgetTpl() },
    { key: 'beneficiaries', label: 'Target Beneficiaries', template: this.beneficiariesTpl() },
    { key: 'approvalStatus', label: 'Status', template: this.statusTpl() },
    { key: 'progressPercentage', label: 'Progress', template: this.progressTpl() },
  ]);

  readonly filteredPlans = computed(() => {
    const plans = this.plans();
    const status = this.statusFilter();
    const term = this.search().toLowerCase();
    let filtered = plans;
    if (status) {
      filtered = filtered.filter(p => p.approvalStatus === status);
    }
    if (term) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
    }
    return filtered;
  });

  ngOnInit(): void {
    this.loadProjects();
    this.loadPlans();
  }

  loadProjects(): void {
    this.projectService.listProjects(1, 100).subscribe({
      next: (res) => this.projects.set(res.items),
    });
  }

  getProjectCode(projectId?: string): string {
    if (!projectId) return '-';
    const proj = this.projects().find(p => p.id === projectId);
    return proj ? proj.code : projectId.substring(0, 8);
  }

  loadPlans(): void {
    const pid = this.projectId();
    this.store.dispatch(
      PlanActions.loadPlans({
        projectId: pid || undefined,
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onProjectSelect(projectId: string): void {
    this.projectId.set(projectId);
    this.page.set(1);
    this.loadPlans();
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
  }

  onStatusFilter(status: ApprovalStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadPlans();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
  }

  onRowClick(row: any): void {
    this.router.navigate(['/planning', row.id]);
  }

  onCreatePlan(): void {
    const pid = this.projectId();
    this.router.navigate(['/planning/create'], {
      queryParams: pid ? { projectId: pid } : {},
    });
  }

  onViewHierarchy(): void {
    const pid = this.projectId();
    this.router.navigate(['/planning/hierarchy'], {
      queryParams: pid ? { projectId: pid } : {},
    });
  }
}
