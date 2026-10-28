import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { TasksActions } from '../../store/tasks.actions';
import { selectBoard, selectBoardLists, selectTasks, selectTasksLoading } from '../../store/tasks.selectors';
import { TaskListService } from '../../services/task-list.service';
import { TaskListDto, CreateTaskListRequest } from '../../models/task-board.model';
import { TaskItemDto } from '../../models/task-item.model';

@Component({
  selector: 'ethel-board-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="board()?.name ?? ('tasks.boards.detail' | translate)">
      @if (board()) {
        @if (board()!.isDefault) {
          <mat-chip highlighted>{{ 'tasks.boards.default' | translate }}</mat-chip>
        }
      }
    </app-page-header>

    @if (loading() && !board()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (board()) {
      <!-- Board Header Info -->
      <div class="board-info">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.projectId' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ board()!.projectId }}</mat-card-content>
        </mat-card>
        @if (board()!.description) {
          <mat-card>
            <mat-card-header><mat-card-title>{{ 'tasks.fields.description' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ board()!.description }}</mat-card-content>
          </mat-card>
        }
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.createdAt' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ board()!.createdAt | date:'mediumDate' }}</mat-card-content>
        </mat-card>
      </div>

      <!-- Kanban Columns -->
      <div class="kanban-header">
        <h3>{{ 'tasks.boards.lists' | translate }}</h3>
        <button mat-stroked-button *appHasPermission="'tasks.lists.create'" (click)="toggleAddListForm()">
          <mat-icon>{{ showAddListForm() ? 'close' : 'add' }}</mat-icon>
          {{ showAddListForm() ? ('common.cancel' | translate) : ('tasks.lists.add' | translate) }}
        </button>
      </div>

      @if (showAddListForm()) {
        <form [formGroup]="listForm" (ngSubmit)="onAddList()" class="add-list-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.sortOrder' | translate }}</mat-label>
            <input matInput formControlName="sortOrder" type="number" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.color' | translate }}</mat-label>
            <input matInput formControlName="color" placeholder="#3f51b5" />
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="listForm.invalid || savingList()">
            @if (savingList()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.add' | translate }}
            }
          </button>
        </form>
      }

      @if (boardLists().length > 0) {
        <div class="kanban-board">
          @for (list of boardLists(); track list.id) {
            <div class="kanban-column">
              <div class="column-header" [style.border-top-color]="list.color || '#9e9e9e'">
                <span class="column-title">{{ list.name }}</span>
                <span class="column-count">{{ list.taskCount }}</span>
              </div>
              <div class="column-cards">
                @for (task of getTasksForList(list.id); track task.id) {
                  <mat-card class="task-card" (click)="onTaskClick(task.id)">
                    <mat-card-content>
                      <div class="task-title">{{ task.title }}</div>
                      <div class="task-meta">
                        <mat-chip [class]="'priority-' + task.priority.toLowerCase()" class="mini-chip">
                          {{ task.priority }}
                        </mat-chip>
                        @if (task.assignedToName) {
                          <span class="task-assignee">{{ task.assignedToName }}</span>
                        }
                      </div>
                    </mat-card-content>
                  </mat-card>
                } @empty {
                  <div class="column-empty">{{ 'tasks.lists.empty' | translate }}</div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          icon="view_column"
          title="No lists"
          message="Add lists to organize your board.">
        </app-empty-state>
      }
    } @else {
      <app-empty-state
        icon="dashboard"
        title="Board not found"
        message="The requested board could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .board-info {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .kanban-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .add-list-form {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--mat-sys-surface-container-low);
      border-radius: 8px;
    }
    .kanban-board {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 1rem;
    }
    .kanban-column {
      min-width: 280px;
      max-width: 320px;
      flex-shrink: 0;
      background: var(--mat-sys-surface-container-low);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-top: 3px solid #9e9e9e;
      border-radius: 8px 8px 0 0;
      font-weight: 500;
    }
    .column-title { font-size: 14px; }
    .column-count {
      background: var(--mat-sys-surface-container-high);
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
    }
    .column-cards { padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .task-card { cursor: pointer; }
    .task-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
    .task-title { font-size: 14px; margin-bottom: 0.5rem; }
    .task-meta { display: flex; align-items: center; gap: 0.5rem; }
    .mini-chip { font-size: 11px; min-height: 24px; padding: 0 8px; }
    .task-assignee { font-size: 12px; color: var(--mat-sys-outline); }
    .column-empty { padding: 1rem; text-align: center; color: var(--mat-sys-outline); font-size: 13px; }
    .priority-low { background-color: #e0e0e0 !important; }
    .priority-medium { background-color: #fff9c4 !important; color: #f57f17 !important; }
    .priority-high { background-color: #fff3e0 !important; color: #e65100 !important; }
    .priority-critical { background-color: #ffebee !important; color: #c62828 !important; }
  `,
})
export default class BoardDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly taskListService = inject(TaskListService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly board = this.store.selectSignal(selectBoard);
  readonly boardLists = this.store.selectSignal(selectBoardLists);
  readonly tasks = this.store.selectSignal(selectTasks);
  readonly loading = this.store.selectSignal(selectTasksLoading);

  readonly showAddListForm = signal(false);
  readonly savingList = signal(false);

  readonly listForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    sortOrder: [0, [Validators.required]],
    color: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadBoard({ id: this.id() }));
    this.store.dispatch(TasksActions.loadTasks({ boardId: this.id(), page: 1, pageSize: 200 }));
  }

  getTasksForList(listId: string): TaskItemDto[] {
    return this.tasks().filter(t => t.taskListId === listId);
  }

  toggleAddListForm(): void {
    this.showAddListForm.update(v => !v);
    if (this.showAddListForm()) {
      this.listForm.reset({ name: '', sortOrder: 0, color: '' });
    }
  }

  onAddList(): void {
    if (this.listForm.invalid) return;
    const value = this.listForm.getRawValue();
    const request: CreateTaskListRequest = {
      taskBoardId: this.id(),
      name: value.name,
      sortOrder: value.sortOrder,
      color: value.color || undefined,
    };
    this.savingList.set(true);
    this.taskListService.createList(request).subscribe({
      next: () => {
        this.notification.success('List added successfully');
        this.showAddListForm.set(false);
        this.savingList.set(false);
        this.store.dispatch(TasksActions.loadBoard({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add list');
        this.savingList.set(false);
      },
    });
  }

  onTaskClick(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }
}
