import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ActivityDialogData {
  mode: 'create' | 'edit';
  outputId: string;
  outputCode?: string;
  activity?: {
    id?: string;
    code: string;
    name: string;
    description?: string;
    unit?: string;
    lifetimeTarget?: number;
    budgetAllocated?: number;
  };
}

@Component({
  selector: 'ethel-activity-dialog',
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
        <mat-icon class="header-icon">task</mat-icon>
        <h2>{{ data.mode === 'create' ? 'Add Activity' : 'Edit Activity' }}</h2>
      </div>
      <button mat-icon-button (click)="onCancel()" type="button" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        <p class="section-hint">
          An Activity is a specific, actionable intervention undertaken to produce the intended output (e.g. Conduct training workshop, purchase seeds).
          @if (data.outputCode) {
            <br /><strong>Parent Output:</strong> {{ data.outputCode }}
          }
        </p>

        <div class="form-grid">
          <!-- Code -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Activity Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. ACT-1.1.1" />
            <mat-error *ngIf="form.get('code')?.hasError('required')">Code is required</mat-error>
          </mat-form-field>

          <!-- Unit of Measurement -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Unit of Measure</mat-label>
            <input matInput formControlName="unit" placeholder="e.g. Sessions, Farmers, Kits" />
          </mat-form-field>

          <!-- Name -->
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Activity Name / Title</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Conduct 5-day community training" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Activity name is required</mat-error>
          </mat-form-field>

          <!-- Target Quantity -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Lifetime Target Quantity</mat-label>
            <input matInput type="number" formControlName="lifetimeTarget" placeholder="e.g. 50" />
          </mat-form-field>

          <!-- Allocated Budget -->
          <mat-form-field appearance="outline" class="col-half">
            <mat-label>Allocated Budget (USD)</mat-label>
            <input matInput type="number" formControlName="budgetAllocated" placeholder="e.g. 15000" />
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Description & Implementation Notes</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Provide details on methodology, target participants, and execution steps..."></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
          <span *ngIf="!isSubmitting()">{{ data.mode === 'create' ? 'Add Activity' : 'Save Changes' }}</span>
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
      color: #e65100;
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
export class ActivityDialogComponent implements OnInit {
  form!: FormGroup;
  readonly isSubmitting = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ActivityDialogData
  ) {}

  ngOnInit(): void {
    const a = this.data.activity;
    this.form = this.fb.group({
      code: [a?.code || '', [Validators.required, Validators.maxLength(50)]],
      name: [a?.name || '', [Validators.required, Validators.maxLength(250)]],
      description: [a?.description || '', [Validators.maxLength(1000)]],
      unit: [a?.unit || '', [Validators.maxLength(50)]],
      lifetimeTarget: [a?.lifetimeTarget ?? null],
      budgetAllocated: [a?.budgetAllocated ?? null],
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
      unit: raw.unit || null,
      lifetimeTarget: raw.lifetimeTarget != null && raw.lifetimeTarget !== '' ? Number(raw.lifetimeTarget) : null,
      budgetAllocated: raw.budgetAllocated != null && raw.budgetAllocated !== '' ? Number(raw.budgetAllocated) : null,
    });
  }
}
