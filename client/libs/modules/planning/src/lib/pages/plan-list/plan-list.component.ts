import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
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
          <mat-label>{{ 'planning.list.project' | translate }}</mat-label>
          <input matInput [value]="projectId()" (change)="onProjectIdChange($event)" placeholder="Enter Project ID" />
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
        emptyMessage="Get started by creating your first plan."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #levelTpl let-row>
      {{ row.level }}
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
    .project-select { min-width: 240px; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class PlanListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly plans = this.store.selectSignal(selectPlans);
  readonly totalCount = this.store.selectSignal(selectPlanTotalCount);
  readonly loading = this.store.selectSignal(selectPlanningLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly projectId = signal('');
  readonly statusFilter = signal<ApprovalStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: ApprovalStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

  readonly levelTpl = viewChild<TemplateRef<unknown>>('levelTpl');
  readonly startDateTpl = viewChild<TemplateRef<unknown>>('startDateTpl');
  readonly endDateTpl = viewChild<TemplateRef<unknown>>('endDateTpl');
  readonly budgetTpl = viewChild<TemplateRef<unknown>>('budgetTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly progressTpl = viewChild<TemplateRef<unknown>>('progressTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'level', label: 'Level', sortable: true, template: this.levelTpl() },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'fiscalYear', label: 'Fiscal Year', sortable: true },
    { key: 'quarter', label: 'Quarter' },
    { key: 'plannedStartDate', label: 'Start Date', sortable: true, template: this.startDateTpl() },
    { key: 'plannedEndDate', label: 'End Date', sortable: true, template: this.endDateTpl() },
    { key: 'plannedBudget', label: 'Budget', sortable: true, template: this.budgetTpl() },
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
    this.loadPlans();
  }

  loadPlans(): void {
    const pid = this.projectId();
    if (!pid) return;
    this.store.dispatch(
      PlanActions.loadPlans({
        projectId: pid,
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onProjectIdChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectId.set(value);
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
    this.router.navigate(['/planning/create']);
  }

  onViewHierarchy(): void {
    const pid = this.projectId();
    this.router.navigate(['/planning/hierarchy'], {
      queryParams: pid ? { projectId: pid } : {},
    });
  }
}
