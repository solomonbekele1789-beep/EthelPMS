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
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ReportActions } from '../../store/report.actions';
import { selectReportingLoading, selectReportTemplates } from '../../store/report.selectors';
import { CreateReportRequest, ReportType } from '../../models/report.model';

@Component({
  selector: 'ethel-report-create',
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
    <app-page-header [title]="'reporting.create.title' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.reportType' | translate }}</mat-label>
            <mat-select formControlName="reportType">
              @for (type of reportTypes; track type) {
                <mat-option [value]="type">{{ 'reporting.reportType.' + type | translate }}</mat-option>
              }
            </mat-select>
            @if (form.controls.reportType.hasError('required')) {
              <mat-error>Report type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.template' | translate }}</mat-label>
            <mat-select formControlName="reportTemplateId">
              <mat-option [value]="''">-- None --</mat-option>
              @for (template of templates(); track template.id) {
                <mat-option [value]="template.id">{{ template.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.periodStart' | translate }}</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="periodStart" />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            @if (form.controls.periodStart.hasError('required')) {
              <mat-error>Period start is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.periodEnd' | translate }}</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="periodEnd" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            @if (form.controls.periodEnd.hasError('required')) {
              <mat-error>Period end is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.fiscalYear' | translate }}</mat-label>
            <input matInput formControlName="fiscalYear" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.quarter' | translate }}</mat-label>
            <input matInput formControlName="quarter" type="number" min="1" max="4" />
            @if (form.controls.quarter.hasError('min') || form.controls.quarter.hasError('max')) {
              <mat-error>Quarter must be between 1 and 4</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.month' | translate }}</mat-label>
            <input matInput formControlName="month" type="number" min="1" max="12" />
            @if (form.controls.month.hasError('min') || form.controls.month.hasError('max')) {
              <mat-error>Month must be between 1 and 12</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.weekNumber' | translate }}</mat-label>
            <input matInput formControlName="weekNumber" type="number" min="1" max="53" />
            @if (form.controls.weekNumber.hasError('min') || form.controls.weekNumber.hasError('max')) {
              <mat-error>Week must be between 1 and 53</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.plannedBudget' | translate }}</mat-label>
            <input matInput formControlName="plannedBudget" type="number" />
            @if (form.controls.plannedBudget.hasError('required')) {
              <mat-error>Planned budget is required</mat-error>
            } @else if (form.controls.plannedBudget.hasError('min')) {
              <mat-error>Budget must be zero or greater</mat-error>
            }
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
            *appHasPermission="'reporting.reports.create'">
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
export default class ReportCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectReportingLoading);
  readonly templates = this.store.selectSignal(selectReportTemplates);

  readonly reportTypes: ReportType[] = ['Activity', 'Weekly', 'Monthly', 'Quarterly', 'BiAnnual', 'Annual', 'Incident'];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    reportType: ['' as string, [Validators.required]],
    projectId: ['', [Validators.required]],
    reportTemplateId: [''],
    periodStart: ['', [Validators.required]],
    periodEnd: ['', [Validators.required]],
    fiscalYear: [null as number | null],
    quarter: [null as number | null, [Validators.min(1), Validators.max(4)]],
    month: [null as number | null, [Validators.min(1), Validators.max(12)]],
    weekNumber: [null as number | null, [Validators.min(1), Validators.max(53)]],
    plannedBudget: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.store.dispatch(ReportActions.loadTemplates({}));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateReportRequest = {
      title: value.title,
      reportType: value.reportType as ReportType,
      projectId: value.projectId,
      periodStart: value.periodStart,
      periodEnd: value.periodEnd,
      reportTemplateId: value.reportTemplateId || undefined,
      fiscalYear: value.fiscalYear ?? undefined,
      quarter: value.quarter ?? undefined,
      month: value.month ?? undefined,
      weekNumber: value.weekNumber ?? undefined,
      plannedBudget: value.plannedBudget,
    };
    this.store.dispatch(ReportActions.createReport({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/reporting']);
  }
}
