import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { TasksActions } from '../../store/tasks.actions';
import { selectTasks, selectTasksTotalCount, selectTasksLoading } from '../../store/tasks.selectors';
import { TaskItemStatus } from '../../models/task-item.model';

@Component({
  selector: 'ethel-board-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'tasks.boards.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'tasks.boards.create'" (click)="onCreateBoard()">
        <mat-icon>add</mat-icon>
        {{ 'tasks.boards.createButton' | translate }}
      </button>
      <button mat-flat-button color="accent" *appHasPermission="'tasks.tasks.create'" (click)="onCreateTask()">
        <mat-icon>add_task</mat-icon>
        {{ 'tasks.tasks.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <!-- Board Lookup -->
      <div class="board-lookup">
        <mat-form-field appearance="outline" class="board-id-field">
          <mat-label>{{ 'tasks.boards.lookupLabel' | translate }}</mat-label>
          <input matInput [value]="boardIdInput()" (input)="onBoardIdInput($event)" placeholder="Enter Board ID" />
        </mat-form-field>
        <button mat-stroked-button color="primary" [disabled]="!boardIdInput()" (click)="onViewBoard()">
          <mat-icon>dashboard</mat-icon>
          {{ 'tasks.boards.viewBoard' | translate }}
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="filter-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>{{ 'common.search' | translate }}</mat-label>
          <input matInput [value]="search()" (keyup.enter)="onSearch($event)" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'tasks.fields.assignedToUserId' | translate }}</mat-label>
          <input matInput [value]="assignedToFilter()" (keyup.enter)="onAssignedToFilter($event)" />
        </mat-form-field>
      </div>

      <!-- Status Filter Chips -->
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
              [class]="'status-chip-' + status.toLowerCase()"
              (click)="onStatusFilter(status)">
              {{ status }}
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <!-- Task List DataTable -->
      <app-data-table
        [columns]="columns()"
        [data]="tasks()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No tasks found"
        emptyMessage="Get started by creating your first task."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <mat-chip [class]="getStatusChipClass(row.status)">
        {{ row.status }}
      </mat-chip>
    </ng-template>

    <ng-template #priorityTpl let-row>
      <mat-chip [class]="getPriorityChipClass(row.priority)">
        {{ row.priority }}
      </mat-chip>
    </ng-template>

    <ng-template #progressTpl let-row>
      <div class="progress-cell">
        <mat-progress-bar mode="determinate" [value]="row.progressPercentage"></mat-progress-bar>
        <span class="progress-label">{{ row.progressPercentage | number:'1.0-0' }}%</span>
      </div>
    </ng-template>

    <ng-template #dateTpl let-row>
      @if (row.dueDate) {
        {{ row.dueDate | date:'mediumDate' }}
      } @else {
        <span class="text-muted">--</span>
      }
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .board-lookup { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--mat-sys-surface-container-low); border-radius: 8px; }
    .board-id-field { width: 320px; }
    .filter-row { display: flex; align-items: center; gap: 1rem; }
    .search-field { width: 280px; }
    .filter-field { width: 240px; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .progress-cell { display: flex; align-items: center; gap: 0.5rem; min-width: 120px; }
    .progress-label { font-size: 12px; white-space: nowrap; }
    .text-muted { color: var(--mat-sys-outline); }
    .status-chip-todo { background-color: #e0e0e0 !important; }
    .status-chip-inprogress { background-color: #bbdefb !important; color: #1565c0 !important; }
    .status-chip-inreview { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .status-chip-approved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-chip-rejected { background-color: #fff3e0 !important; color: #e65100 !important; }
    .status-chip-done { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .priority-low { background-color: #e0e0e0 !important; }
    .priority-medium { background-color: #fff9c4 !important; color: #f57f17 !important; }
    .priority-high { background-color: #fff3e0 !important; color: #e65100 !important; }
    .priority-critical { background-color: #ffebee !important; color: #c62828 !important; }
  `,
})
export default class BoardListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly tasks = this.store.selectSignal(selectTasks);
  readonly totalCount = this.store.selectSignal(selectTasksTotalCount);
  readonly loading = this.store.selectSignal(selectTasksLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<TaskItemStatus | undefined>(undefined);
  readonly assignedToFilter = signal('');
  readonly boardIdInput = signal('');

  readonly statuses: TaskItemStatus[] = ['ToDo', 'InProgress', 'InReview', 'Approved', 'Rejected', 'Done'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly priorityTpl = viewChild<TemplateRef<unknown>>('priorityTpl');
  readonly progressTpl = viewChild<TemplateRef<unknown>>('progressTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'priority', label: 'Priority', template: this.priorityTpl() },
    { key: 'assignedToName', label: 'Assigned To' },
    { key: 'dueDate', label: 'Due Date', template: this.dateTpl() },
    { key: 'progressPercentage', label: 'Progress', template: this.progressTpl() },
    { key: 'commentsCount', label: 'Comments' },
  ]);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.store.dispatch(
      TasksActions.loadTasks({
        page: this.page(),
        pageSize: this.pageSize(),
        status: this.statusFilter(),
        search: this.search() || undefined,
        assignedToUserId: this.assignedToFilter() || undefined,
      })
    );
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.page.set(1);
    this.loadTasks();
  }

  onStatusFilter(status: TaskItemStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadTasks();
  }

  onAssignedToFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.assignedToFilter.set(value);
    this.page.set(1);
    this.loadTasks();
  }

  onBoardIdInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.boardIdInput.set(value);
  }

  onViewBoard(): void {
    const boardId = this.boardIdInput();
    if (boardId) {
      this.router.navigate(['/tasks/boards', boardId]);
    }
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadTasks();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/tasks', row.id]);
  }

  onCreateBoard(): void {
    this.router.navigate(['/tasks/boards/create']);
  }

  onCreateTask(): void {
    this.router.navigate(['/tasks/create']);
  }

  getStatusChipClass(status: string): string {
    return 'status-chip-' + status.toLowerCase();
  }

  getPriorityChipClass(priority: string): string {
    return 'priority-' + priority.toLowerCase();
  }
}
