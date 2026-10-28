import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { SettingsActions } from '../../store/settings.actions';
import { selectApprovalConfigs, selectSettingsLoading } from '../../store/settings.selectors';
import {
  ApprovalConfigDto,
  CreateApprovalConfigRequest,
  UpdateApprovalConfigRequest,
} from '../../models/approval-config.model';

@Component({
  selector: 'ethel-approval-configs',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'settings.approvals.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'settings.approvals.create'" (click)="onToggleForm()">
        <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
        {{ (showForm() ? 'common.cancel' : 'settings.approvals.addButton') | translate }}
      </button>
    </app-page-header>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.approvals.module' | translate }}</mat-label>
              <input matInput formControlName="module" [readonly]="!!editingId()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.approvals.entityType' | translate }}</mat-label>
              <input matInput formControlName="entityType" [readonly]="!!editingId()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.approvals.requiredLevels' | translate }}</mat-label>
              <mat-select formControlName="requiredApprovalLevels">
                @for (level of approvalLevels; track level) {
                  <mat-option [value]="level">{{ level }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.approvals.autoApproveBelow' | translate }}</mat-label>
              <input matInput type="number" formControlName="autoApproveBelow" />
            </mat-form-field>

            <div class="toggle-row">
              <mat-slide-toggle formControlName="isActive">
                {{ 'settings.approvals.isActive' | translate }}
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                {{ (editingId() ? 'common.update' : 'common.create') | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <div class="filter-row">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>{{ 'settings.approvals.filterModule' | translate }}</mat-label>
        <input matInput [value]="moduleFilter()" (input)="onModuleFilter($any($event.target).value)" />
      </mat-form-field>
    </div>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (approvalConfigs().length === 0) {
      <app-empty-state
        title="No approval configs"
        message="Create an approval configuration to define approval workflows.">
      </app-empty-state>
    } @else {
      <table mat-table [dataSource]="approvalConfigs()" class="full-width-table">
        <ng-container matColumnDef="module">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.approvals.module' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.module }}</td>
        </ng-container>

        <ng-container matColumnDef="entityType">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.approvals.entityType' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.entityType }}</td>
        </ng-container>

        <ng-container matColumnDef="requiredApprovalLevels">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.approvals.requiredLevels' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.requiredApprovalLevels }}</td>
        </ng-container>

        <ng-container matColumnDef="autoApproveBelow">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.approvals.autoApproveBelow' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.autoApproveBelow ?? '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="isActive">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.approvals.isActive' | translate }}</th>
          <td mat-cell *matCellDef="let row">
            <mat-slide-toggle [checked]="row.isActive" [disabled]="true"></mat-slide-toggle>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="onEditRow(row)" *appHasPermission="'settings.approvals.update'">
              <mat-icon>edit</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    }
  `,
  styles: `
    :host { display: block; }
    .form-card { margin-bottom: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1rem;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
    }
    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
    }
    .filter-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .filter-field { flex: 1; max-width: 300px; }
    .full-width-table { width: 100%; }
  `,
})
export default class ApprovalConfigsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly approvalConfigs = this.store.selectSignal(selectApprovalConfigs);
  readonly loading = this.store.selectSignal(selectSettingsLoading);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly moduleFilter = signal('');

  readonly approvalLevels = [1, 2, 3, 4, 5];
  readonly displayedColumns = ['module', 'entityType', 'requiredApprovalLevels', 'autoApproveBelow', 'isActive', 'actions'];

  readonly form: FormGroup = this.fb.group({
    module: ['', Validators.required],
    entityType: ['', Validators.required],
    requiredApprovalLevels: [1, Validators.required],
    autoApproveBelow: [null],
    isActive: [true],
  });

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.loadApprovalConfigs({}));
  }

  onToggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.editingId.set(null);
      this.form.reset({ requiredApprovalLevels: 1, isActive: true });
    }
  }

  onModuleFilter(value: string): void {
    this.moduleFilter.set(value);
    this.store.dispatch(SettingsActions.loadApprovalConfigs({ module: value || undefined }));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const id = this.editingId();

    if (id) {
      const request: UpdateApprovalConfigRequest = {
        id,
        requiredApprovalLevels: val.requiredApprovalLevels,
        autoApproveBelow: val.autoApproveBelow || undefined,
        isActive: val.isActive,
      };
      this.store.dispatch(SettingsActions.updateApprovalConfig({ id, request }));
    } else {
      const request: CreateApprovalConfigRequest = {
        module: val.module,
        entityType: val.entityType,
        requiredApprovalLevels: val.requiredApprovalLevels,
        autoApproveBelow: val.autoApproveBelow || undefined,
        isActive: val.isActive,
      };
      this.store.dispatch(SettingsActions.createApprovalConfig({ request }));
    }

    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset({ requiredApprovalLevels: 1, isActive: true });
  }

  onEditRow(row: ApprovalConfigDto): void {
    this.editingId.set(row.id);
    this.form.patchValue({
      module: row.module,
      entityType: row.entityType,
      requiredApprovalLevels: row.requiredApprovalLevels,
      autoApproveBelow: row.autoApproveBelow ?? null,
      isActive: row.isActive,
    });
    this.showForm.set(true);
  }
}
