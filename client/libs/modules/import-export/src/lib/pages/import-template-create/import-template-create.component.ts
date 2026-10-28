import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, NotificationService } from '@ethelpms/shared/ui';
import { ImportTemplateService } from '../../services/import-template.service';
import { ImportFileFormat, CreateImportTemplateRequest } from '../../models/import-template.model';

@Component({
  selector: 'ethel-import-template-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'importexport.templates.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'importexport.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'importexport.fields.module' | translate }}</mat-label>
            <mat-select formControlName="module">
              @for (m of modules; track m) {
                <mat-option [value]="m">{{ m }}</mat-option>
              }
            </mat-select>
            @if (form.controls.module.hasError('required')) {
              <mat-error>Module is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'importexport.fields.entityType' | translate }}</mat-label>
            <input matInput formControlName="entityType" />
            @if (form.controls.entityType.hasError('required')) {
              <mat-error>Entity type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'importexport.fields.fileFormat' | translate }}</mat-label>
            <mat-select formControlName="fileFormat">
              @for (f of fileFormats; track f) {
                <mat-option [value]="f">{{ f }}</mat-option>
              }
            </mat-select>
            @if (form.controls.fileFormat.hasError('required')) {
              <mat-error>File format is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'importexport.fields.columnMappings' | translate }}</mat-label>
            <textarea matInput formControlName="columnMappings" rows="6"
                      placeholder='{"sourceColumn": "targetField", ...}'></textarea>
            @if (form.controls.columnMappings.hasError('required')) {
              <mat-error>Column mappings are required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'importexport.fields.validationRules' | translate }}</mat-label>
            <textarea matInput formControlName="validationRules" rows="4"
                      placeholder='Optional JSON validation rules'></textarea>
          </mat-form-field>

          <div class="toggle-row">
            <mat-slide-toggle formControlName="isSystemTemplate">
              {{ 'importexport.fields.isSystemTemplate' | translate }}
            </mat-slide-toggle>
          </div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || submitting()">
            @if (submitting()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.save' | translate }}
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
    .toggle-row {
      grid-column: 1 / -1;
      margin-bottom: 1rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class ImportTemplateCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly templateService = inject(ImportTemplateService);
  private readonly notification = inject(NotificationService);

  readonly submitting = signal(false);

  readonly modules = ['Projects', 'Participants', 'FundAccounting', 'Assets', 'Training', 'Procurement'];
  readonly fileFormats: ImportFileFormat[] = ['CSV', 'Excel', 'JSON', 'KoboToolbox'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    module: ['' as string, [Validators.required]],
    entityType: ['', [Validators.required]],
    fileFormat: ['' as string, [Validators.required]],
    columnMappings: ['', [Validators.required]],
    validationRules: [''],
    isSystemTemplate: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const value = this.form.getRawValue();
    const request: CreateImportTemplateRequest = {
      name: value.name,
      module: value.module,
      entityType: value.entityType,
      fileFormat: value.fileFormat as ImportFileFormat,
      columnMappings: value.columnMappings,
      validationRules: value.validationRules || undefined,
      isSystemTemplate: value.isSystemTemplate,
    };
    this.templateService.create(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notification.success('Template created successfully');
        this.router.navigate(['/import-export/templates']);
      },
      error: () => {
        this.submitting.set(false);
        this.notification.error('Failed to create template');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/import-export/templates']);
  }
}
