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
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { SettingsNavComponent } from '../../components/settings-nav/settings-nav.component';
import { SettingsActions } from '../../store/settings.actions';
import { selectAlertThresholds, selectSettingsLoading } from '../../store/settings.selectors';
import {
  AlertThresholdDto,
  AlertSeverity,
  ComparisonOperator,
  CreateAlertThresholdRequest,
  UpdateAlertThresholdRequest,
} from '../../models/alert-threshold.model';

@Component({
  selector: 'ethel-alert-thresholds',
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
    MatChipsModule,
    MatTooltipModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
    SettingsNavComponent,
  ],
  template: `
    <app-page-header [title]="'settings.alerts.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'settings.alerts.create'" (click)="onToggleForm()">
        <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
        {{ (showForm() ? 'common.cancel' : 'settings.alerts.addButton') | translate }}
      </button>
    </app-page-header>

    <ethel-settings-nav></ethel-settings-nav>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.alerts.module' | translate }}</mat-label>
              <input matInput formControlName="module" [readonly]="!!editingId()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.alerts.metricName' | translate }}</mat-label>
              <input matInput formControlName="metricName" [readonly]="!!editingId()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.alerts.thresholdValue' | translate }}</mat-label>
              <input matInput type="number" formControlName="thresholdValue" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.alerts.operator' | translate }}</mat-label>
              <mat-select formControlName="operator">
                @for (op of operators; track op) {
                  <mat-option [value]="op">{{ $any(operatorLabels)[op] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.alerts.severity' | translate }}</mat-label>
              <mat-select formControlName="alertSeverity">
                @for (sev of severities; track sev) {
                  <mat-option [value]="sev">{{ sev }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="toggle-row">
              <mat-slide-toggle formControlName="isActive">
                {{ 'settings.alerts.isActive' | translate }}
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
        <mat-label>{{ 'settings.alerts.filterModule' | translate }}</mat-label>
        <input matInput [value]="moduleFilter()" (input)="onModuleFilter($any($event.target).value)" />
      </mat-form-field>
    </div>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (alertThresholds().length === 0) {
      <app-empty-state
        title="No alert thresholds"
        message="Create an alert threshold to monitor key metrics.">
      </app-empty-state>
    } @else {
      <table mat-table [dataSource]="alertThresholds()" class="full-width-table">
        <ng-container matColumnDef="module">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.alerts.module' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.module }}</td>
        </ng-container>

        <ng-container matColumnDef="metricName">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.alerts.metricName' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.metricName }}</td>
        </ng-container>

        <ng-container matColumnDef="thresholdValue">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.alerts.thresholdValue' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.thresholdValue }}</td>
        </ng-container>

        <ng-container matColumnDef="operator">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.alerts.operator' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ $any(operatorLabels)[row.operator] }}</td>
        </ng-container>

        <ng-container matColumnDef="alertSeverity">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.alerts.severity' | translate }}</th>
          <td mat-cell *matCellDef="let row">
            <span class="severity-chip" [class]="'severity-' + row.alertSeverity.toLowerCase()">
              {{ row.alertSeverity }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="isActive">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.alerts.isActive' | translate }}</th>
          <td mat-cell *matCellDef="let row">
            <mat-slide-toggle [checked]="row.isActive" [disabled]="true"></mat-slide-toggle>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="onEditRow(row)" *appHasPermission="'settings.alerts.update'" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="onDelete(row)" *appHasPermission="'settings.alerts.delete'" matTooltip="Delete">
              <mat-icon>delete</mat-icon>
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
    .severity-chip {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .severity-info {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    .severity-warning {
      background-color: #fff8e1;
      color: #f57f17;
    }
    .severity-critical {
      background-color: #ffebee;
      color: #c62828;
    }
  `,
})
export default class AlertThresholdsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly alertThresholds = this.store.selectSignal(selectAlertThresholds);
  readonly loading = this.store.selectSignal(selectSettingsLoading);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly moduleFilter = signal('');

  readonly operators: ComparisonOperator[] = ['GreaterThan', 'LessThan', 'GreaterThanOrEqual', 'LessThanOrEqual', 'Equal'];
  readonly severities: AlertSeverity[] = ['Info', 'Warning', 'Critical'];
  readonly displayedColumns = ['module', 'metricName', 'thresholdValue', 'operator', 'alertSeverity', 'isActive', 'actions'];

  readonly operatorLabels: Record<ComparisonOperator, string> = {
    GreaterThan: '>',
    LessThan: '<',
    GreaterThanOrEqual: '>=',
    LessThanOrEqual: '<=',
    Equal: '=',
  };

  readonly form: FormGroup = this.fb.group({
    module: ['', Validators.required],
    metricName: ['', Validators.required],
    thresholdValue: [0, Validators.required],
    operator: ['GreaterThan', Validators.required],
    alertSeverity: ['Warning', Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.loadAlertThresholds({}));
  }

  onToggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.editingId.set(null);
      this.form.reset({ thresholdValue: 0, operator: 'GreaterThan', alertSeverity: 'Warning', isActive: true });
    }
  }

  onModuleFilter(value: string): void {
    this.moduleFilter.set(value);
    this.store.dispatch(SettingsActions.loadAlertThresholds({ module: value || undefined }));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const id = this.editingId();

    if (id) {
      const request: UpdateAlertThresholdRequest = {
        id,
        thresholdValue: val.thresholdValue,
        operator: val.operator,
        alertSeverity: val.alertSeverity,
        isActive: val.isActive,
      };
      this.store.dispatch(SettingsActions.updateAlertThreshold({ id, request }));
    } else {
      const request: CreateAlertThresholdRequest = {
        module: val.module,
        metricName: val.metricName,
        thresholdValue: val.thresholdValue,
        operator: val.operator,
        alertSeverity: val.alertSeverity,
        isActive: val.isActive,
      };
      this.store.dispatch(SettingsActions.createAlertThreshold({ request }));
    }

    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset({ thresholdValue: 0, operator: 'GreaterThan', alertSeverity: 'Warning', isActive: true });
  }

  onEditRow(row: AlertThresholdDto): void {
    this.editingId.set(row.id);
    this.form.patchValue({
      module: row.module,
      metricName: row.metricName,
      thresholdValue: row.thresholdValue,
      operator: row.operator,
      alertSeverity: row.alertSeverity,
      isActive: row.isActive,
    });
    this.showForm.set(true);
  }

  onDelete(row: AlertThresholdDto): void {
    this.store.dispatch(SettingsActions.deleteAlertThreshold({ id: row.id }));
  }
}
