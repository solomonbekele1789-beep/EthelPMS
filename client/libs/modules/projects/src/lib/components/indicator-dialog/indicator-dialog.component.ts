import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface IndicatorDialogData {
  mode: 'create' | 'edit';
  projectId: string;
  outcomeId?: string;
  outputId?: string;
  parentLabel?: string;
  indicator?: {
    id?: string;
    code: string;
    name: string;
    description?: string;
    baselineValue?: number;
    targetValue?: number;
    dataSource?: string;
    collectionFrequency?: string;
  };
}

@Component({
  selector: 'ethel-indicator-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-title">
        <mat-icon class="header-icon">insights</mat-icon>
        <h2>{{ data.mode === 'create' ? 'Add Performance Indicator' : 'Edit Indicator' }}</h2>
      </div>
      <button mat-icon-button (click)="onCancel()" type="button" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        <p class="section-hint">
          An Indicator provides specific evidence of whether results (outcomes or outputs) are being achieved.
          @if (data.parentLabel) {
            <br /><strong>Linked to:</strong> {{ data.parentLabel }}
          }
        </p>

        <div class="form-grid">
          <!-- Code -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Indicator Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. IND-01" />
            <mat-error *ngIf="form.get('code')?.hasError('required')">Code is required</mat-error>
          </mat-form-field>

          <!-- Frequency -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Collection Frequency</mat-label>
            <mat-select formControlName="collectionFrequency">
              <mat-option value="Monthly">Monthly</mat-option>
              <mat-option value="Quarterly">Quarterly</mat-option>
              <mat-option value="Semi-Annually">Semi-Annually</mat-option>
              <mat-option value="Annually">Annually</mat-option>
              <mat-option value="Endline">End of Project</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Name -->
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Indicator Name / Metric</mat-label>
            <input matInput formControlName="name" placeholder="e.g. % of households with improved food security" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Indicator name is required</mat-error>
          </mat-form-field>

          <!-- Baseline Value -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Baseline Value</mat-label>
            <input matInput type="number" formControlName="baselineValue" placeholder="e.g. 20" />
          </mat-form-field>

          <!-- Target Value -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Target Value</mat-label>
            <input matInput type="number" formControlName="targetValue" placeholder="e.g. 80" />
          </mat-form-field>

          <!-- Data Source -->
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Data Source / Means of Verification</mat-label>
            <input matInput formControlName="dataSource" placeholder="e.g. Household surveys, training attendance sheets" />
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Definition & Calculation Method</mat-label>
            <textarea matInput formControlName="description" rows="2" placeholder="Precise definition of numerator, denominator, or counting criteria..."></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
          <span *ngIf="!isSubmitting()">{{ data.mode === 'create' ? 'Add Indicator' : 'Save Changes' }}</span>
          <span *ngIf="isSubmitting()" class="button-spinner">
            <mat-progress-spinner mode="indeterminate" diameter="18"></mat-progress-spinner>
            Saving...
          </span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem 0.75rem;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .header-icon {
      color: #7b1fa2;
    }
    .header-title h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .dialog-content {
      padding: 1.25rem 1.5rem;
      min-width: 480px;
      max-width: 600px;
    }
    .section-hint {
      margin: 0 0 1rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      line-height: 1.4;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem 1rem;
    }
    .col-half {
      grid-column: span 1;
    }
    .col-full {
      grid-column: span 2;
    }
    .dialog-actions {
      padding: 0.75rem 1.5rem 1.25rem;
      border-top: 1px solid var(--border-color, #e0e0e0);
      margin: 0;
    }
    .button-spinner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `,
})
export class IndicatorDialogComponent implements OnInit {
  form!: FormGroup;
  readonly isSubmitting = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<IndicatorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: IndicatorDialogData
  ) {}

  ngOnInit(): void {
    const ind = this.data.indicator;
    this.form = this.fb.group({
      code: [ind?.code || '', [Validators.required, Validators.maxLength(50)]],
      name: [ind?.name || '', [Validators.required, Validators.maxLength(250)]],
      description: [ind?.description || '', [Validators.maxLength(1000)]],
      baselineValue: [ind?.baselineValue ?? null],
      targetValue: [ind?.targetValue ?? null],
      dataSource: [ind?.dataSource || '', [Validators.maxLength(250)]],
      collectionFrequency: [ind?.collectionFrequency || 'Quarterly'],
    });

    if (this.data.mode === 'edit') {
      this.form.get('code')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      code: raw.code,
      name: raw.name,
      description: raw.description || null,
      baselineValue: raw.baselineValue != null && raw.baselineValue !== '' ? Number(raw.baselineValue) : null,
      targetValue: raw.targetValue != null && raw.targetValue !== '' ? Number(raw.targetValue) : null,
      dataSource: raw.dataSource || null,
      collectionFrequency: raw.collectionFrequency || null,
    });
  }
}
