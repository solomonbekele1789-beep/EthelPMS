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

import { UserService } from '@ethelpms/modules/identity';
import { UserListItemDto } from '@ethelpms/modules/identity';

export interface TeamMemberDialogData {
  projectId: string;
  projectName?: string;
  existingUserIds?: string[];
}

@Component({
  selector: 'ethel-team-member-dialog',
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
        <mat-icon class="header-icon">person_add</mat-icon>
        <h2>Assign Team Member</h2>
      </div>
      <button mat-icon-button (click)="onCancel()" type="button" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        <p class="section-hint">
          Assign an organization team member to this project and define their operational role.
          @if (data.projectName) {
            <br /><strong>Project:</strong> {{ data.projectName }}
          }
        </p>

        @if (loadingUsers()) {
          <div class="loading-users">
            <mat-progress-spinner mode="indeterminate" diameter="24"></mat-progress-spinner>
            <span>Loading organization users...</span>
          </div>
        } @else {
          <div class="form-fields">
            <!-- User Selector -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select User</mat-label>
              <mat-select formControlName="userId" placeholder="Choose a user">
                @for (user of availableUsers(); track user.id) {
                  <mat-option [value]="user.id">
                    <div class="user-option">
                      <span class="user-name">{{ user.fullName }}</span>
                      <span class="user-email">({{ user.email }})</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
              <mat-error *ngIf="form.get('userId')?.hasError('required')">Please select a user</mat-error>
            </mat-form-field>

            <!-- Role Selector -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Project Role</mat-label>
              <mat-select formControlName="rolePreset" (selectionChange)="onRolePresetChange($event.value)">
                <mat-option value="Project Manager">Project Manager</mat-option>
                <mat-option value="Project Coordinator">Project Coordinator</mat-option>
                <mat-option value="MEAL Officer">MEAL Officer</mat-option>
                <mat-option value="Field Coordinator">Field Coordinator</mat-option>
                <mat-option value="Field Officer">Field Officer</mat-option>
                <mat-option value="Finance Officer">Finance Officer</mat-option>
                <mat-option value="Procurement & Logistics Officer">Procurement & Logistics Officer</mat-option>
                <mat-option value="Agronomist / Technical Specialist">Agronomist / Technical Specialist</mat-option>
                <mat-option value="WASH Specialist">WASH Specialist</mat-option>
                <mat-option value="Health & Nutrition Officer">Health & Nutrition Officer</mat-option>
                <mat-option value="Community Facilitator">Community Facilitator</mat-option>
                <mat-option value="Custom">Other / Custom Role...</mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('rolePreset')?.hasError('required')">Please select a role</mat-error>
            </mat-form-field>

            <!-- Custom Role Input (visible if Custom selected) -->
            @if (form.get('rolePreset')?.value === 'Custom') {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Custom Role Title</mat-label>
                <input matInput formControlName="customRole" placeholder="e.g. Senior Gender Advisor" />
                <mat-error *ngIf="form.get('customRole')?.hasError('required')">Custom role title is required</mat-error>
              </mat-form-field>
            }
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || isSubmitting() || loadingUsers()"
        >
          <span *ngIf="!isSubmitting()">Assign Member</span>
          <span *ngIf="isSubmitting()" class="button-spinner">
            <mat-progress-spinner mode="indeterminate" diameter="18"></mat-progress-spinner>
            Assigning...
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
      color: #1976d2;
    }
    .header-title h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .dialog-content {
      padding: 1.25rem 1.5rem;
      min-width: 440px;
      max-width: 520px;
    }
    .section-hint {
      margin: 0 0 1.25rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      line-height: 1.4;
    }
    .loading-users {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 0;
      color: var(--text-secondary, #666);
      font-size: 0.875rem;
    }
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .full-width {
      width: 100%;
    }
    .user-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .user-name {
      font-weight: 500;
    }
    .user-email {
      font-size: 0.8125rem;
      color: var(--text-secondary, #757575);
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
export class TeamMemberDialogComponent implements OnInit {
  form!: FormGroup;
  readonly availableUsers = signal<UserListItemDto[]>([]);
  readonly loadingUsers = signal(true);
  readonly isSubmitting = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<TeamMemberDialogComponent>,
    private readonly userService: UserService,
    @Inject(MAT_DIALOG_DATA) public readonly data: TeamMemberDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: ['', [Validators.required]],
      rolePreset: ['Field Officer', [Validators.required]],
      customRole: [''],
    });

    this.loadUsers();
  }

  onRolePresetChange(role: string): void {
    const customControl = this.form.get('customRole');
    if (role === 'Custom') {
      customControl?.setValidators([Validators.required, Validators.maxLength(100)]);
    } else {
      customControl?.clearValidators();
    }
    customControl?.updateValueAndValidity();
  }

  private loadUsers(): void {
    this.userService.listUsers(1, 100).subscribe({
      next: (result) => {
        const existing = new Set(this.data.existingUserIds || []);
        const filtered = result.items.filter((u) => u.isActive && !existing.has(u.id));
        this.availableUsers.set(filtered);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const finalRole = raw.rolePreset === 'Custom' ? raw.customRole.trim() : raw.rolePreset;

    this.dialogRef.close({
      userId: raw.userId,
      role: finalRole,
    });
  }
}
