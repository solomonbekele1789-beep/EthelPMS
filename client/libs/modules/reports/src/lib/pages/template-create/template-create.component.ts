import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { ReportsActions } from '../../store/reports.actions';
import { selectReportsLoading } from '../../store/reports.selectors';
import { ReportFormat, CreateReportTemplateRequest } from '../../models/report-template.model';

@Component({
  selector: 'ethel-template-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="'reports.templates.create.title' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'reports.templates.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Template name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reports.templates.fields.module' | translate }}</mat-label>
            <mat-select formControlName="module">
              @for (mod of modules; track mod) {
                <mat-option [value]="mod">{{ mod }}</mat-option>
              }
            </mat-select>
            @if (form.controls.module.hasError('required')) {
              <mat-error>Module is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'reports.templates.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reports.templates.fields.reportFormat' | translate }}</mat-label>
            <mat-select formControlName="reportFormat">
              @for (fmt of formats; track fmt) {
                <mat-option [value]="fmt">{{ fmt }}</mat-option>
              }
            </mat-select>
            @if (form.controls.reportFormat.hasError('required')) {
              <mat-error>Report format is required</mat-error>
            }
          </mat-form-field>

          <div class="toggle-field">
            <mat-slide-toggle formControlName="isSystemTemplate">
              {{ 'reports.templates.fields.isSystemTemplate' | translate }}
            </mat-slide-toggle>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'reports.templates.fields.queryDefinition' | translate }}</mat-label>
            <textarea matInput formControlName="queryDefinition" rows="6" placeholder="Enter SQL or query definition..."></textarea>
            @if (form.controls.queryDefinition.hasError('required')) {
              <mat-error>Query definition is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'reports.templates.fields.templateContent' | translate }}</mat-label>
            <textarea matInput formControlName="templateContent" rows="6" placeholder="Optional template content..."></textarea>
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
    .toggle-field {
      display: flex;
      align-items: center;
      padding-top: 0.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class TemplateCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectReportsLoading);

  readonly modules = ['Projects', 'Planning', 'Reporting', 'MEAL', 'Procurement', 'FundAccounting', 'Assets'];
  readonly formats: ReportFormat[] = ['PDF', 'Excel', 'Word', 'CSV'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    module: ['', [Validators.required]],
    reportFormat: ['PDF' as ReportFormat, [Validators.required]],
    queryDefinition: ['', [Validators.required]],
    templateContent: [''],
    isSystemTemplate: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateReportTemplateRequest = {
      name: value.name,
      description: value.description || undefined,
      module: value.module,
      reportFormat: value.reportFormat,
      queryDefinition: value.queryDefinition,
      templateContent: value.templateContent || undefined,
      isSystemTemplate: value.isSystemTemplate,
    };
    this.store.dispatch(ReportsActions.createTemplate({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/reports/templates']);
  }
}
