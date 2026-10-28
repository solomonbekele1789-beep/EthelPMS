import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { MealActions } from '../../store/meal.actions';
import { selectMealPlans, selectMealPlanTotalCount, selectMealLoading } from '../../store/meal.selectors';
import { MealPlanStatus } from '../../models/meal-plan.model';

@Component({
  selector: 'ethel-meal-plan-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'meal.plans.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'meal.plans.create'" (click)="onCreatePlan()">
        <mat-icon>add</mat-icon>
        {{ 'common.create' | translate }}
      </button>
      <button mat-stroked-button (click)="onViewEvaluations()">
        <mat-icon>assessment</mat-icon>
        {{ 'meal.evaluations.title' | translate }}
      </button>
      <button mat-stroked-button (click)="onViewGesi()">
        <mat-icon>people</mat-icon>
        {{ 'meal.gesi.title' | translate }}
      </button>
      <button mat-stroked-button (click)="onViewLessons()">
        <mat-icon>lightbulb</mat-icon>
        {{ 'meal.lessons.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="list-toolbar">
        <app-search-input placeholder="Search MEAL plans..." (search)="onSearch($event)"></app-search-input>
      </div>

      <div class="filter-chips">
        <span class="filter-label">{{ 'meal.fields.status' | translate }}:</span>
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
              <app-status-badge [status]="status" [label]="'meal.planStatus.' + status | translate"></app-status-badge>
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
        emptyTitle="No MEAL plans found"
        emptyMessage="Get started by creating your first MEAL plan."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="'meal.planStatus.' + row.status | translate"></app-status-badge>
    </ng-template>

    <ng-template #completenessTpl let-row>
      <div class="completeness-bar">
        <div class="completeness-fill" [style.width.%]="row.overallCompleteness"></div>
        <span class="completeness-text">{{ row.overallCompleteness | number:'1.0-0' }}%</span>
      </div>
    </ng-template>

    <ng-template #createdTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .list-toolbar { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .filter-label { font-weight: 500; white-space: nowrap; }
    .completeness-bar {
      position: relative;
      height: 20px;
      background: rgba(0, 0, 0, 0.08);
      border-radius: 10px;
      min-width: 100px;
      overflow: hidden;
    }
    .completeness-fill {
      height: 100%;
      background: #4caf50;
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    .completeness-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.75rem;
      font-weight: 500;
    }
  `,
})
export default class MealPlanListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly plans = this.store.selectSignal(selectMealPlans);
  readonly totalCount = this.store.selectSignal(selectMealPlanTotalCount);
  readonly loading = this.store.selectSignal(selectMealLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<MealPlanStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: MealPlanStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly completenessTpl = viewChild<TemplateRef<unknown>>('completenessTpl');
  readonly createdTpl = viewChild<TemplateRef<unknown>>('createdTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'projectId', label: 'Project', sortable: true },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'overallCompleteness', label: 'Completeness', template: this.completenessTpl() },
    { key: 'createdAt', label: 'Created', template: this.createdTpl() },
  ]);

  readonly filteredPlans = computed(() => {
    const plans = this.plans();
    const status = this.statusFilter();
    const term = this.search().toLowerCase();
    let filtered = plans;
    if (status) {
      filtered = filtered.filter(p => p.status === status);
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
    this.store.dispatch(
      MealActions.loadPlans({
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
  }

  onStatusFilter(status: MealPlanStatus | undefined): void {
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
    this.router.navigate(['/meal', row.id]);
  }

  onCreatePlan(): void {
    this.router.navigate(['/meal/create']);
  }

  onViewEvaluations(): void {
    this.router.navigate(['/meal/evaluations']);
  }

  onViewGesi(): void {
    this.router.navigate(['/meal/gesi']);
  }

  onViewLessons(): void {
    this.router.navigate(['/meal/lessons']);
  }
}
