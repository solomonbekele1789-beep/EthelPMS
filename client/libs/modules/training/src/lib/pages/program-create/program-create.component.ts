import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { TrainingActions } from '../../store/training.actions';
import { selectTrainingLoading } from '../../store/training.selectors';
import { CreateTrainingProgramRequest, TrainingCategory } from '../../models/training-program.model';

@Component({
  selector: 'ethel-program-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'training.programs.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.category' | translate }}</mat-label>
            <mat-select formControlName="category">
              @for (cat of categories; track cat) {
                <mat-option [value]="cat">{{ cat }}</mat-option>
              }
            </mat-select>
            @if (form.controls.category.hasError('required')) {
              <mat-error>Category is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project ID is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.totalSessions' | translate }}</mat-label>
            <input matInput formControlName="totalSessions" type="number" />
            @if (form.controls.totalSessions.hasError('required')) {
              <mat-error>Total sessions is required</mat-error>
            } @else if (form.controls.totalSessions.hasError('min')) {
              <mat-error>Must be at least 1</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'training.fields.description' | translate }}</mat-label>
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
export default class ProgramCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectTrainingLoading);

  readonly categories: TrainingCategory[] = ['Technical', 'LifeSkills', 'Financial', 'Health', 'Agriculture', 'Other'];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    totalSessions: [1, [Validators.required, Validators.min(1)]],
    description: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateTrainingProgramRequest = {
      title: value.title,
      category: value.category as TrainingCategory,
      projectId: value.projectId,
      totalSessions: value.totalSessions,
      description: value.description || undefined,
    };
    this.store.dispatch(TrainingActions.createProgram({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/training/programs']);
  }
}
