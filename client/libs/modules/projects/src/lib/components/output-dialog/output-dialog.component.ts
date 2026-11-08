import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface OutputDialogData {
  mode: 'create' | 'edit';
  outcomeId: string;
  outcomeCode?: string;
  output?: {
    id?: string;
    code: string;
    description: string;
    baselineValue?: number;
    targetValue?: number;
    assumptions?: string;
  };
}

@Component({
  selector: 'ethel-output-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-title">
        <mat-icon class="header-icon">inventory_2</mat-icon>
        <h2>{{ data.mode === 'create' ? 'Add Output' : 'Edit Output' }}</h2>
      </div>
      <button mat-icon-button (click)="onCancel()" type="button" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        <p class="section-hint">
          An Output represents the tangible, direct products or services delivered by project activities (e.g., 300 farmers trained on sustainable practices).
          @if (data.outcomeCode) {
            <br /><strong>Parent Outcome:</strong> {{ data.outcomeCode }}
          }
        </p>

        <div class="form-grid">
          <!-- Code -->
          <mat-form-field appearance="outline" class="col-code">
            <mat-label>Output Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. OP-1.1" />
            <mat-error *ngIf="form.get('code')?.hasError('required')">Code is required</mat-error>
          </mat-form-field>

          <!-- Baseline Value -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Baseline Value</mat-label>
            <input matInput type="number" formControlName="baselineValue" placeholder="e.g. 0" />
          </mat-form-field>

          <!-- Target Value -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Target Value</mat-label>
            <input matInput type="number" formControlName="targetValue" placeholder="e.g. 300" />
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Output Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Describe the tangible output to be delivered..."></textarea>
            <mat-error *ngIf="form.get('description')?.hasError('required')">Description is required</mat-error>
          </mat-form-field>

          <!-- Assumptions -->
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Assumptions</mat-label>
            <textarea matInput formControlName="assumptions" rows="2" placeholder="Key assumptions for delivering this output..."></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
          <span *ngIf="!isSubmitting()">{{ data.mode === 'create' ? 'Add Output' : 'Save Changes' }}</span>
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
      color: #2e7d32;
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
    .col-code {
      grid-column: span 2;
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
export class OutputDialogComponent implements OnInit {
  form!: FormGroup;
  readonly isSubmitting = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<OutputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: OutputDialogData
  ) {}

  ngOnInit(): void {
    const o = this.data.output;
    this.form = this.fb.group({
      code: [o?.code || '', [Validators.required, Validators.maxLength(50)]],
      description: [o?.description || '', [Validators.required, Validators.maxLength(1000)]],
      baselineValue: [o?.baselineValue ?? null],
      targetValue: [o?.targetValue ?? null],
      assumptions: [o?.assumptions || ''],
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
      description: raw.description,
      baselineValue: raw.baselineValue != null && raw.baselineValue !== '' ? Number(raw.baselineValue) : null,
      targetValue: raw.targetValue != null && raw.targetValue !== '' ? Number(raw.targetValue) : null,
      assumptions: raw.assumptions || null,
    });
  }
}
