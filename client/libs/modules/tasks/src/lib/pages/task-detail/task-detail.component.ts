import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { TasksActions } from '../../store/tasks.actions';
import { selectSelectedTask, selectComments, selectTasksLoading } from '../../store/tasks.selectors';
import { TaskService } from '../../services/task.service';
import {
  TaskItemDto,
  TaskItemStatus,
  TaskPriority,
  TaskCommentDto,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  UpdateTaskProgressRequest,
  AssignTaskRequest,
  MoveTaskRequest,
  AddTaskCommentRequest,
  SubmitForApprovalRequest,
  ApproveTaskRequest,
  RejectTaskRequest,
} from '../../models/task-item.model';

@Component({
  selector: 'ethel-task-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="task()?.title ?? ('tasks.tasks.detail' | translate)">
      @if (task()) {
        <mat-chip [class]="getStatusChipClass(task()!.status)">
          {{ task()!.status }}
        </mat-chip>
        <mat-chip [class]="getPriorityChipClass(task()!.priority)">
          {{ task()!.priority }}
        </mat-chip>
      }
    </app-page-header>

    @if (loading() && !task()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (task()) {
      <!-- Detail Header Grid -->
      <div class="detail-grid">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.status' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-chip [class]="getStatusChipClass(task()!.status)">{{ task()!.status }}</mat-chip>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.priority' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-chip [class]="getPriorityChipClass(task()!.priority)">{{ task()!.priority }}</mat-chip>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.assignedToName' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ task()!.assignedToName || '--' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.dueDate' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ task()!.dueDate ? (task()!.dueDate! | date:'mediumDate') : '--' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.progress' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="progress-display">
              <mat-progress-bar mode="determinate" [value]="task()!.progressPercentage"></mat-progress-bar>
              <span>{{ task()!.progressPercentage | number:'1.0-0' }}%</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'tasks.fields.createdAt' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ task()!.createdAt | date:'mediumDate' }}</mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Tab 1: Task Info -->
        <mat-tab [label]="'tasks.tabs.info' | translate">
          <div class="tab-content">
            @if (task()!.description) {
              <mat-card class="narrative-card">
                <mat-card-header><mat-card-title>{{ 'tasks.fields.description' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ task()!.description }}</mat-card-content>
              </mat-card>
            }

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ 'tasks.fields.createdBy' | translate }}</span>
                <span class="info-value">{{ task()!.createdBy || '--' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ 'tasks.fields.taskListId' | translate }}</span>
                <span class="info-value">{{ task()!.taskListId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ 'tasks.fields.sortOrder' | translate }}</span>
                <span class="info-value">{{ task()!.sortOrder }}</span>
              </div>
              @if (task()!.parentTaskId) {
                <div class="info-item">
                  <span class="info-label">{{ 'tasks.fields.parentTaskId' | translate }}</span>
                  <span class="info-value">{{ task()!.parentTaskId }}</span>
                </div>
              }
              @if (task()!.projectId) {
                <div class="info-item">
                  <span class="info-label">{{ 'tasks.fields.projectId' | translate }}</span>
                  <span class="info-value">{{ task()!.projectId }}</span>
                </div>
              }
            </div>

            <!-- Inline Edit -->
            <div class="section-header" *appHasPermission="'tasks.tasks.update'">
              <button mat-stroked-button (click)="toggleEditMode()">
                <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
                {{ editing() ? ('common.cancel' | translate) : ('common.edit' | translate) }}
              </button>
            </div>

            @if (editing()) {
              <form [formGroup]="editForm" (ngSubmit)="onUpdateTask()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'tasks.fields.title' | translate }}</mat-label>
                    <input matInput formControlName="title" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'tasks.fields.priority' | translate }}</mat-label>
                    <mat-select formControlName="priority">
                      @for (p of priorities; track p) {
                        <mat-option [value]="p">{{ p }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'tasks.fields.dueDate' | translate }}</mat-label>
                    <input matInput [matDatepicker]="editDuePicker" formControlName="dueDate" />
                    <mat-datepicker-toggle matSuffix [for]="editDuePicker"></mat-datepicker-toggle>
                    <mat-datepicker #editDuePicker></mat-datepicker>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'tasks.fields.description' | translate }}</mat-label>
                    <textarea matInput formControlName="description" rows="3"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving()">
                    @if (saving()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Tab 2: Status & Progress -->
        <mat-tab [label]="'tasks.tabs.statusProgress' | translate">
          <div class="tab-content">
            <!-- Update Status -->
            <mat-card class="action-card" *appHasPermission="'tasks.tasks.update'">
              <mat-card-header><mat-card-title>{{ 'tasks.actions.updateStatus' | translate }}</mat-card-title></mat-card-header>
              <mat-card-content>
                <div class="inline-action">
                  <mat-form-field appearance="outline" class="action-field">
                    <mat-label>{{ 'tasks.fields.status' | translate }}</mat-label>
                    <mat-select [value]="task()!.status" (selectionChange)="onUpdateStatus($event.value)">
                      @for (s of statuses; track s) {
                        <mat-option [value]="s">{{ s }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Update Progress -->
            <mat-card class="action-card" *appHasPermission="'tasks.tasks.update'">
              <mat-card-header><mat-card-title>{{ 'tasks.actions.updateProgress' | translate }}</mat-card-title></mat-card-header>
              <mat-card-content>
                <div class="progress-action">
                  <mat-slider min="0" max="100" step="5" [displayWith]="formatProgress" class="progress-slider">
                    <input matSliderThumb [value]="task()!.progressPercentage" (valueChange)="progressValue.set($event)" />
                  </mat-slider>
                  <span class="progress-value">{{ progressValue() | number:'1.0-0' }}%</span>
                  <button mat-stroked-button color="primary" (click)="onUpdateProgress()">
                    {{ 'common.update' | translate }}
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Move Task -->
            <mat-card class="action-card" *appHasPermission="'tasks.tasks.update'">
              <mat-card-header><mat-card-title>{{ 'tasks.actions.moveTask' | translate }}</mat-card-title></mat-card-header>
              <mat-card-content>
                <form [formGroup]="moveForm" (ngSubmit)="onMoveTask()" class="inline-form">
                  <mat-form-field appearance="outline" class="action-field">
                    <mat-label>{{ 'tasks.fields.targetListId' | translate }}</mat-label>
                    <input matInput formControlName="targetListId" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="action-field-sm">
                    <mat-label>{{ 'tasks.fields.sortOrder' | translate }}</mat-label>
                    <input matInput formControlName="sortOrder" type="number" />
                  </mat-form-field>
                  <button mat-flat-button color="primary" type="submit" [disabled]="moveForm.invalid || savingMove()">
                    @if (savingMove()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'tasks.actions.move' | translate }}
                    }
                  </button>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab 3: Assignments -->
        <mat-tab [label]="'tasks.tabs.assignments' | translate">
          <div class="tab-content">
            @if (task()!.assignments && task()!.assignments.length > 0) {
              <div class="assignments-list">
                @for (assignment of task()!.assignments; track assignment.id) {
                  <mat-card class="assignment-card">
                    <mat-card-content>
                      <div class="assignment-info">
                        <mat-icon>person</mat-icon>
                        <div>
                          <div class="assignment-name">{{ assignment.assignedToName }}</div>
                          @if (assignment.role) {
                            <div class="assignment-role">{{ assignment.role }}</div>
                          }
                          <div class="assignment-date">{{ assignment.assignedDate | date:'mediumDate' }}</div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            } @else {
              <app-empty-state
                icon="group"
                title="No assignments"
                message="Assign team members to this task.">
              </app-empty-state>
            }

            <!-- Assign Form -->
            <div class="section-header" *appHasPermission="'tasks.tasks.assign'">
              <button mat-stroked-button (click)="toggleAssignForm()">
                <mat-icon>{{ showAssignForm() ? 'close' : 'person_add' }}</mat-icon>
                {{ showAssignForm() ? ('common.cancel' | translate) : ('tasks.actions.assign' | translate) }}
              </button>
            </div>

            @if (showAssignForm()) {
              <form [formGroup]="assignForm" (ngSubmit)="onAssignTask()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'tasks.fields.assignedToUserId' | translate }}</mat-label>
                    <input matInput formControlName="assignedToUserId" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'tasks.fields.assignedToName' | translate }}</mat-label>
                    <input matInput formControlName="assignedToName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'tasks.fields.role' | translate }}</mat-label>
                    <input matInput formControlName="role" />
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="assignForm.invalid || savingAssign()">
                    @if (savingAssign()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'tasks.actions.assign' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Tab 4: Comments & Approval -->
        <mat-tab [label]="'tasks.tabs.commentsApproval' | translate">
          <div class="tab-content">
            <!-- Comments Section -->
            <h3>{{ 'tasks.comments.title' | translate }}</h3>

            @if (comments().length > 0) {
              <div class="comments-list">
                @for (comment of comments(); track comment.id) {
                  <mat-card class="comment-card" [class.reply]="!!comment.parentCommentId">
                    <mat-card-content>
                      <div class="comment-header">
                        <span class="comment-author">{{ comment.authorName }}</span>
                        <span class="comment-date">{{ comment.createdAt | date:'medium' }}</span>
                      </div>
                      <div class="comment-body">{{ comment.content }}</div>
                      <button mat-button class="reply-btn" *appHasPermission="'tasks.comments.create'" (click)="onReplyTo(comment.id)">
                        <mat-icon>reply</mat-icon>
                        {{ 'tasks.comments.reply' | translate }}
                      </button>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            } @else {
              <app-empty-state
                icon="comment"
                title="No comments"
                message="Be the first to comment on this task.">
              </app-empty-state>
            }

            <!-- Add Comment Form -->
            <div class="section-header" *appHasPermission="'tasks.comments.create'">
              <button mat-stroked-button (click)="toggleCommentForm()">
                <mat-icon>{{ showCommentForm() ? 'close' : 'add_comment' }}</mat-icon>
                {{ showCommentForm() ? ('common.cancel' | translate) : ('tasks.comments.add' | translate) }}
              </button>
            </div>

            @if (showCommentForm()) {
              <form [formGroup]="commentForm" (ngSubmit)="onAddComment()" class="edit-form">
                @if (replyToCommentId()) {
                  <div class="reply-indicator">
                    {{ 'tasks.comments.replyingTo' | translate }} {{ replyToCommentId() }}
                    <button mat-icon-button (click)="onClearReply()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'tasks.fields.content' | translate }}</mat-label>
                  <textarea matInput formControlName="content" rows="3"></textarea>
                </mat-form-field>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="commentForm.invalid || savingComment()">
                    @if (savingComment()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'tasks.comments.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <!-- Approval Actions -->
            <h3 class="approval-header">{{ 'tasks.approvals.title' | translate }}</h3>

            <div class="approval-actions">
              <button mat-flat-button color="primary"
                *appHasPermission="'tasks.approvals.submit'"
                [disabled]="savingApproval()"
                (click)="onSubmitForApproval()">
                <mat-icon>send</mat-icon>
                {{ 'tasks.approvals.submit' | translate }}
              </button>
              <button mat-flat-button color="primary" class="approve-btn"
                *appHasPermission="'tasks.approvals.approve'"
                [disabled]="savingApproval()"
                (click)="onApproveTask()">
                <mat-icon>check_circle</mat-icon>
                {{ 'tasks.approvals.approve' | translate }}
              </button>
              <button mat-flat-button color="warn"
                *appHasPermission="'tasks.approvals.reject'"
                [disabled]="savingApproval()"
                (click)="onRejectTask()">
                <mat-icon>cancel</mat-icon>
                {{ 'tasks.approvals.reject' | translate }}
              </button>
            </div>

            @if (showApprovalComments()) {
              <mat-form-field appearance="outline" class="full-width approval-comments">
                <mat-label>{{ 'tasks.approvals.comments' | translate }}</mat-label>
                <textarea matInput [(ngModel)]="approvalComments" rows="2"></textarea>
              </mat-form-field>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="task"
        title="Task not found"
        message="The requested task could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .progress-display { display: flex; align-items: center; gap: 0.5rem; }
    .tab-content { padding: 1.5rem 0; }
    .narrative-card { margin-bottom: 1rem; }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-label { font-size: 12px; color: var(--mat-sys-outline); text-transform: uppercase; }
    .info-value { font-size: 14px; }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .edit-form { margin-top: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .action-card { margin-bottom: 1rem; }
    .inline-action { display: flex; align-items: center; gap: 1rem; padding-top: 0.5rem; }
    .inline-form { display: flex; align-items: center; gap: 1rem; padding-top: 0.5rem; }
    .action-field { width: 280px; }
    .action-field-sm { width: 120px; }
    .progress-action { display: flex; align-items: center; gap: 1rem; padding-top: 0.5rem; }
    .progress-slider { flex: 1; }
    .progress-value { font-weight: 500; min-width: 48px; text-align: right; }
    .assignments-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
    .assignment-card { }
    .assignment-info { display: flex; align-items: flex-start; gap: 0.75rem; }
    .assignment-name { font-weight: 500; }
    .assignment-role { font-size: 13px; color: var(--mat-sys-outline); }
    .assignment-date { font-size: 12px; color: var(--mat-sys-outline); }
    .comments-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
    .comment-card { }
    .comment-card.reply { margin-left: 2rem; border-left: 3px solid var(--mat-sys-primary); }
    .comment-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .comment-author { font-weight: 500; font-size: 14px; }
    .comment-date { font-size: 12px; color: var(--mat-sys-outline); }
    .comment-body { font-size: 14px; line-height: 1.5; }
    .reply-btn { margin-top: 0.25rem; }
    .reply-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: var(--mat-sys-surface-container-low);
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 13px;
    }
    .approval-header { margin-top: 2rem; }
    .approval-actions { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .approve-btn { background-color: #2e7d32 !important; }
    .approval-comments { margin-top: 1rem; }
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
export default class TaskDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly task = this.store.selectSignal(selectSelectedTask);
  readonly comments = this.store.selectSignal(selectComments);
  readonly loading = this.store.selectSignal(selectTasksLoading);

  readonly activeTab = signal(0);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly savingMove = signal(false);
  readonly showAssignForm = signal(false);
  readonly savingAssign = signal(false);
  readonly showCommentForm = signal(false);
  readonly savingComment = signal(false);
  readonly replyToCommentId = signal<string | null>(null);
  readonly savingApproval = signal(false);
  readonly showApprovalComments = signal(false);
  readonly progressValue = signal(0);
  approvalComments = '';

  readonly statuses: TaskItemStatus[] = ['ToDo', 'InProgress', 'InReview', 'Approved', 'Rejected', 'Done'];
  readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  readonly editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    priority: ['' as string, [Validators.required]],
    dueDate: [null as Date | null],
  });

  readonly moveForm = this.fb.nonNullable.group({
    targetListId: ['', [Validators.required]],
    sortOrder: [0],
  });

  readonly assignForm = this.fb.nonNullable.group({
    assignedToUserId: ['', [Validators.required]],
    assignedToName: ['', [Validators.required]],
    role: [''],
  });

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
    this.store.dispatch(TasksActions.loadComments({ taskId: this.id() }));
    this.progressValue.set(this.task()?.progressPercentage ?? 0);
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  // --- Task Info ---

  toggleEditMode(): void {
    if (!this.editing()) {
      const t = this.task();
      if (t) {
        this.editForm.patchValue({
          title: t.title,
          description: t.description ?? '',
          priority: t.priority,
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
        });
      }
    }
    this.editing.update(v => !v);
  }

  onUpdateTask(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateTaskRequest = {
      taskId: this.id(),
      title: value.title,
      description: value.description || undefined,
      priority: value.priority as TaskPriority,
      dueDate: value.dueDate ? value.dueDate.toISOString() : undefined,
    };
    this.saving.set(true);
    this.taskService.updateTask(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Task updated successfully');
        this.editing.set(false);
        this.saving.set(false);
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to update task');
        this.saving.set(false);
      },
    });
  }

  // --- Status & Progress ---

  onUpdateStatus(status: string): void {
    const request: UpdateTaskStatusRequest = {
      taskId: this.id(),
      status: status as TaskItemStatus,
    };
    this.taskService.updateStatus(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Status updated');
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to update status'),
    });
  }

  onUpdateProgress(): void {
    const request: UpdateTaskProgressRequest = {
      taskId: this.id(),
      progressPercentage: this.progressValue(),
    };
    this.taskService.updateProgress(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Progress updated');
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to update progress'),
    });
  }

  formatProgress(value: number): string {
    return `${value}%`;
  }

  onMoveTask(): void {
    if (this.moveForm.invalid) return;
    const value = this.moveForm.getRawValue();
    const request: MoveTaskRequest = {
      taskId: this.id(),
      targetListId: value.targetListId,
      sortOrder: value.sortOrder || undefined,
    };
    this.savingMove.set(true);
    this.taskService.moveTask(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Task moved successfully');
        this.savingMove.set(false);
        this.moveForm.reset({ targetListId: '', sortOrder: 0 });
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to move task');
        this.savingMove.set(false);
      },
    });
  }

  // --- Assignments ---

  toggleAssignForm(): void {
    this.showAssignForm.update(v => !v);
    if (this.showAssignForm()) {
      this.assignForm.reset();
    }
  }

  onAssignTask(): void {
    if (this.assignForm.invalid) return;
    const value = this.assignForm.getRawValue();
    const request: AssignTaskRequest = {
      taskId: this.id(),
      assignedToUserId: value.assignedToUserId,
      assignedToName: value.assignedToName,
      role: value.role || undefined,
    };
    this.savingAssign.set(true);
    this.taskService.assignTask(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Task assigned successfully');
        this.showAssignForm.set(false);
        this.savingAssign.set(false);
        this.assignForm.reset();
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to assign task');
        this.savingAssign.set(false);
      },
    });
  }

  // --- Comments ---

  toggleCommentForm(): void {
    this.showCommentForm.update(v => !v);
    if (this.showCommentForm()) {
      this.commentForm.reset();
      this.replyToCommentId.set(null);
    }
  }

  onReplyTo(commentId: string): void {
    this.replyToCommentId.set(commentId);
    this.showCommentForm.set(true);
  }

  onClearReply(): void {
    this.replyToCommentId.set(null);
  }

  onAddComment(): void {
    if (this.commentForm.invalid) return;
    const value = this.commentForm.getRawValue();
    const request: AddTaskCommentRequest = {
      taskItemId: this.id(),
      content: value.content,
      parentCommentId: this.replyToCommentId() || undefined,
    };
    this.savingComment.set(true);
    this.taskService.addComment(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Comment added');
        this.showCommentForm.set(false);
        this.savingComment.set(false);
        this.commentForm.reset();
        this.replyToCommentId.set(null);
        this.store.dispatch(TasksActions.loadComments({ taskId: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add comment');
        this.savingComment.set(false);
      },
    });
  }

  // --- Approvals ---

  onSubmitForApproval(): void {
    const request: SubmitForApprovalRequest = {
      taskId: this.id(),
      comments: this.approvalComments || undefined,
    };
    this.savingApproval.set(true);
    this.taskService.submitForApproval(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Submitted for approval');
        this.savingApproval.set(false);
        this.approvalComments = '';
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to submit for approval');
        this.savingApproval.set(false);
      },
    });
  }

  onApproveTask(): void {
    const request: ApproveTaskRequest = {
      taskId: this.id(),
      approvalLevel: 1,
      comments: this.approvalComments || undefined,
    };
    this.savingApproval.set(true);
    this.taskService.approveTask(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Task approved');
        this.savingApproval.set(false);
        this.approvalComments = '';
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to approve task');
        this.savingApproval.set(false);
      },
    });
  }

  onRejectTask(): void {
    const request: RejectTaskRequest = {
      taskId: this.id(),
      approvalLevel: 1,
      comments: this.approvalComments || undefined,
    };
    this.savingApproval.set(true);
    this.taskService.rejectTask(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Task rejected');
        this.savingApproval.set(false);
        this.approvalComments = '';
        this.store.dispatch(TasksActions.loadTask({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to reject task');
        this.savingApproval.set(false);
      },
    });
  }

  // --- Helpers ---

  getStatusChipClass(status: string): string {
    return 'status-chip-' + status.toLowerCase();
  }

  getPriorityChipClass(priority: string): string {
    return 'priority-' + priority.toLowerCase();
  }
}
