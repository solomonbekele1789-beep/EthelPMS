import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { MealActions } from '../../store/meal.actions';
import { selectMealLoading } from '../../store/meal.selectors';
import {
  CreateEvaluationRequest,
  EvaluationType,
  DacCriteria,
} from '../../models/evaluation.model';

@Component({
  selector: 'ethel-evaluation-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'meal.evaluations.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'meal.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'meal.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'meal.evaluations.type' | translate }}</mat-label>
            <mat-select formControlName="evaluationType">
              @for (type of evaluationTypes; track type) {
                <mat-option [value]="type">{{ 'meal.evalType.' + type | translate }}</mat-option>
              }
            </mat-select>
            @if (form.controls.evaluationType.hasError('required')) {
              <mat-error>Type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'meal.evaluations.dacCriteria' | translate }}</mat-label>
            <mat-select formControlName="primaryDacCriteria">
              <mat-option [value]="''">-- None --</mat-option>
              @for (criteria of dacCriteriaList; track criteria) {
                <mat-option [value]="criteria">{{ 'meal.dacCriteria.' + criteria | translate }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Planned Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="plannedStartDate" />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            @if (form.controls.plannedStartDate.hasError('required')) {
              <mat-error>Start date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Planned End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="plannedEndDate" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            @if (form.controls.plannedEndDate.hasError('required')) {
              <mat-error>End date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'meal.evaluations.budget' | translate }}</mat-label>
            <input matInput formControlName="budget" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'meal.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'meal.evaluations.create'">
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
export default class EvaluationCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectMealLoading);

  readonly evaluationTypes: EvaluationType[] = ['Monitoring', 'Evaluation', 'Learning'];
  readonly dacCriteriaList: DacCriteria[] = [
    'Relevance', 'Coherence', 'Effectiveness', 'Efficiency', 'Impact', 'Sustainability',
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    evaluationType: ['' as string, [Validators.required]],
    plannedStartDate: ['', [Validators.required]],
    plannedEndDate: ['', [Validators.required]],
    primaryDacCriteria: [''],
    budget: [null as number | null],
    description: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateEvaluationRequest = {
      title: value.title,
      projectId: value.projectId,
      evaluationType: value.evaluationType as EvaluationType,
      plannedStartDate: value.plannedStartDate,
      plannedEndDate: value.plannedEndDate,
      primaryDacCriteria: (value.primaryDacCriteria as DacCriteria) || undefined,
      budget: value.budget ?? undefined,
      description: value.description || undefined,
    };
    this.store.dispatch(MealActions.createEvaluation({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/meal/evaluations']);
  }
}
