import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { TasksActions } from '../../store/tasks.actions';
import { selectTasksLoading } from '../../store/tasks.selectors';
import { CreateTaskRequest, TaskPriority } from '../../models/task-item.model';

@Component({
  selector: 'ethel-task-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'tasks.tasks.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.taskListId' | translate }}</mat-label>
            <input matInput formControlName="taskListId" />
            @if (form.controls.taskListId.hasError('required')) {
              <mat-error>Task List ID is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
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
            <input matInput [matDatepicker]="duePicker" formControlName="dueDate" />
            <mat-datepicker-toggle matSuffix [for]="duePicker"></mat-datepicker-toggle>
            <mat-datepicker #duePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.assignedToUserId' | translate }}</mat-label>
            <input matInput formControlName="assignedToUserId" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.assignedToName' | translate }}</mat-label>
            <input matInput formControlName="assignedToName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.parentTaskId' | translate }}</mat-label>
            <input matInput formControlName="parentTaskId" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'tasks.fields.sortOrder' | translate }}</mat-label>
            <input matInput formControlName="sortOrder" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'tasks.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 800px; }
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
      margin-top: 1.5rem;
    }
  `,
})
export default class TaskCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectTasksLoading);

  readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  readonly form = this.fb.nonNullable.group({
    taskListId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    projectId: [''],
    description: [''],
    priority: ['Medium' as TaskPriority],
    dueDate: [null as Date | null],
    assignedToUserId: [''],
    assignedToName: [''],
    parentTaskId: [''],
    sortOrder: [0],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateTaskRequest = {
      taskListId: value.taskListId,
      title: value.title,
      projectId: value.projectId || undefined,
      description: value.description || undefined,
      priority: value.priority,
      dueDate: value.dueDate ? value.dueDate.toISOString() : undefined,
      assignedToUserId: value.assignedToUserId || undefined,
      assignedToName: value.assignedToName || undefined,
      parentTaskId: value.parentTaskId || undefined,
      sortOrder: value.sortOrder || undefined,
    };
    this.store.dispatch(TasksActions.createTask({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
