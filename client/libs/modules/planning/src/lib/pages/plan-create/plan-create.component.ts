import { Component, inject, OnInit, signal } from '@angular/core';
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
import { PlanActions } from '../../store/plan.actions';
import { selectPlanningLoading } from '../../store/plan.selectors';
import { CreatePlanEntryRequest, PlanLevel } from '../../models/plan.model';

@Component({
  selector: 'ethel-plan-create',
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
  ],
  template: `
    <app-page-header [title]="'planning.create.title' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.level' | translate }}</mat-label>
            <mat-select formControlName="level">
              @for (level of planLevels; track level) {
                <mat-option [value]="level">{{ level }}</mat-option>
              }
            </mat-select>
            @if (form.controls.level.hasError('required')) {
              <mat-error>Level is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.parentId' | translate }}</mat-label>
            <input matInput formControlName="parentId" placeholder="Optional parent plan ID" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'planning.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.plannedStartDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="plannedStartDate" />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            @if (form.controls.plannedStartDate.hasError('required')) {
              <mat-error>Start date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.plannedEndDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="plannedEndDate" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            @if (form.controls.plannedEndDate.hasError('required')) {
              <mat-error>End date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.plannedBudget' | translate }}</mat-label>
            <input matInput formControlName="plannedBudget" type="number" />
            @if (form.controls.plannedBudget.hasError('required')) {
              <mat-error>Budget is required</mat-error>
            } @else if (form.controls.plannedBudget.hasError('min')) {
              <mat-error>Budget must be zero or greater</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.fiscalYear' | translate }}</mat-label>
            <input matInput formControlName="fiscalYear" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.quarter' | translate }}</mat-label>
            <input matInput formControlName="quarter" type="number" min="1" max="4" />
            @if (form.controls.quarter.hasError('min') || form.controls.quarter.hasError('max')) {
              <mat-error>Quarter must be between 1 and 4</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.month' | translate }}</mat-label>
            <input matInput formControlName="month" type="number" min="1" max="12" />
            @if (form.controls.month.hasError('min') || form.controls.month.hasError('max')) {
              <mat-error>Month must be between 1 and 12</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'planning.fields.weekNumber' | translate }}</mat-label>
            <input matInput formControlName="weekNumber" type="number" min="1" max="53" />
            @if (form.controls.weekNumber.hasError('min') || form.controls.weekNumber.hasError('max')) {
              <mat-error>Week must be between 1 and 53</mat-error>
            }
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
export default class PlanCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectPlanningLoading);

  readonly planLevels: PlanLevel[] = ['Annual', 'Quarterly', 'Monthly', 'Weekly', 'Daily'];

  readonly form = this.fb.nonNullable.group({
    level: ['' as string, [Validators.required]],
    projectId: ['', [Validators.required]],
    parentId: [''],
    title: ['', [Validators.required]],
    description: [''],
    plannedStartDate: ['', [Validators.required]],
    plannedEndDate: ['', [Validators.required]],
    plannedBudget: [0, [Validators.required, Validators.min(0)]],
    fiscalYear: [null as number | null],
    quarter: [null as number | null, [Validators.min(1), Validators.max(4)]],
    month: [null as number | null, [Validators.min(1), Validators.max(12)]],
    weekNumber: [null as number | null, [Validators.min(1), Validators.max(53)]],
  });

  ngOnInit(): void {
    // Lookup data could be loaded here for project dropdowns
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreatePlanEntryRequest = {
      level: value.level as PlanLevel,
      projectId: value.projectId,
      parentId: value.parentId || undefined,
      title: value.title,
      description: value.description || undefined,
      plannedStartDate: value.plannedStartDate,
      plannedEndDate: value.plannedEndDate,
      plannedBudget: value.plannedBudget,
      fiscalYear: value.fiscalYear ?? undefined,
      quarter: value.quarter ?? undefined,
      month: value.month ?? undefined,
      weekNumber: value.weekNumber ?? undefined,
    };
    this.store.dispatch(PlanActions.createPlan({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/planning']);
  }
}
