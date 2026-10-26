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
import { ProjectActions } from '../../store/project.actions';
import { selectProjectsLoading } from '../../store/project.selectors';
import { CreateProjectRequest } from '../../models/project.model';

@Component({
  selector: 'ethel-project-create',
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
    <app-page-header [title]="'projects.create.title' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.code' | translate }}</mat-label>
            <input matInput formControlName="code" />
            @if (form.controls.code.hasError('required')) {
              <mat-error>Project code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Project name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'projects.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.startDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            @if (form.controls.startDate.hasError('required')) {
              <mat-error>Start date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.endDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            @if (form.controls.endDate.hasError('required')) {
              <mat-error>End date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.budget' | translate }}</mat-label>
            <input matInput formControlName="totalBudget" type="number" />
            @if (form.controls.totalBudget.hasError('required')) {
              <mat-error>Budget is required</mat-error>
            } @else if (form.controls.totalBudget.hasError('min')) {
              <mat-error>Budget must be zero or greater</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Currency</mat-label>
            <input matInput formControlName="currencyId" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.donor' | translate }}</mat-label>
            <input matInput formControlName="donorName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.sector' | translate }}</mat-label>
            <input matInput formControlName="sector" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.programPillar' | translate }}</mat-label>
            <input matInput formControlName="programPillar" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.office' | translate }}</mat-label>
            <input matInput formControlName="officeId" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.projectManager' | translate }}</mat-label>
            <input matInput formControlName="projectManagerId" />
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
export default class ProjectCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectProjectsLoading);

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    totalBudget: [0, [Validators.required, Validators.min(0)]],
    currencyId: [''],
    donorName: [''],
    sector: [''],
    programPillar: [''],
    officeId: [''],
    projectManagerId: [''],
  });

  ngOnInit(): void {
    // Lookup data could be loaded here for office/currency dropdowns
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateProjectRequest = {
      code: value.code,
      name: value.name,
      description: value.description || undefined,
      startDate: value.startDate,
      endDate: value.endDate,
      totalBudget: value.totalBudget,
      currencyId: value.currencyId || '',
      donorName: value.donorName || undefined,
      sector: value.sector || undefined,
      programPillar: value.programPillar || undefined,
      officeId: value.officeId || undefined,
      projectManagerId: value.projectManagerId || undefined,
    };
    this.store.dispatch(ProjectActions.createProject({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/projects']);
  }
}
