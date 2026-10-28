import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import {
  selectMaintenance,
  selectAssetsLoading,
} from '../../store/assets.selectors';
import { MaintenanceService } from '../../services/maintenance.service';
import {
  AssetMaintenanceDto,
  ScheduleMaintenanceRequest,
  CompleteMaintenanceRequest,
} from '../../models/maintenance.model';

@Component({
  selector: 'ethel-maintenance-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatChipsModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'assets.maintenance.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'assets.maintenance.create'" (click)="showScheduleForm.set(!showScheduleForm())">
        <mat-icon>add</mat-icon>
        {{ 'assets.maintenance.schedule' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <div class="status-chips">
          @for (filter of completionFilters; track filter.label) {
            <mat-chip-option
              [selected]="completionFilter() === filter.value"
              (selectionChange)="onCompletionFilter(filter.value)">
              {{ filter.label }}
            </mat-chip-option>
          }
        </div>

        <mat-form-field appearance="outline" class="asset-filter">
          <mat-label>Asset ID Filter</mat-label>
          <input matInput [value]="assetIdFilter()" (input)="onAssetIdFilter($any($event.target).value)" />
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="maintenance()"
        [loading]="loading()"
        emptyTitle="No maintenance records found"
        emptyMessage="No maintenance has been scheduled yet."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #scheduledDateTpl let-row>
      {{ row.scheduledDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #completedDateTpl let-row>
      {{ row.completedDate ? (row.completedDate | date:'mediumDate') : '-' }}
    </ng-template>

    <ng-template #costTpl let-row>
      {{ row.cost != null ? (row.cost | number:'1.2-2') : '-' }}
    </ng-template>

    <ng-template #completedTpl let-row>
      <mat-chip [highlighted]="row.isCompleted" [class.completed-chip]="row.isCompleted" [class.pending-chip]="!row.isCompleted">
        {{ row.isCompleted ? 'Completed' : 'Scheduled' }}
      </mat-chip>
    </ng-template>

    <ng-template #actionsTpl let-row>
      @if (!row.isCompleted) {
        <button mat-stroked-button color="primary" (click)="onCompleteClick(row); $event.stopPropagation()">
          {{ 'assets.actions.complete' | translate }}
        </button>
      }
    </ng-template>

    <!-- Schedule Maintenance Form -->
    @if (showScheduleForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'assets.maintenance.schedule' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="scheduleForm" (ngSubmit)="onScheduleSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Asset ID</mat-label>
                <input matInput formControlName="assetId" />
                @if (scheduleForm.controls.assetId.hasError('required')) {
                  <mat-error>Asset ID is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
                @if (scheduleForm.controls.description.hasError('required')) {
                  <mat-error>Description is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.scheduledDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="scheduleDatePicker" formControlName="scheduledDate" />
                <mat-datepicker-toggle matIconSuffix [for]="scheduleDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #scheduleDatePicker></mat-datepicker>
                @if (scheduleForm.controls.scheduledDate.hasError('required')) {
                  <mat-error>Scheduled date is required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showScheduleForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="scheduleForm.invalid">
                {{ 'assets.actions.schedule' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <!-- Complete Maintenance Form -->
    @if (showCompleteForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'assets.maintenance.complete' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="completeForm" (ngSubmit)="onCompleteSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.completedDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="completedDatePicker" formControlName="completedDate" />
                <mat-datepicker-toggle matIconSuffix [for]="completedDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #completedDatePicker></mat-datepicker>
                @if (completeForm.controls.completedDate.hasError('required')) {
                  <mat-error>Completed date is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.cost' | translate }}</mat-label>
                <input matInput type="number" formControlName="cost" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.performedBy' | translate }}</mat-label>
                <input matInput formControlName="performedBy" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.nextScheduledDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="nextDatePicker" formControlName="nextScheduledDate" />
                <mat-datepicker-toggle matIconSuffix [for]="nextDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #nextDatePicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'assets.fields.notes' | translate }}</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showCompleteForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="completeForm.invalid">
                {{ 'assets.actions.complete' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .status-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .asset-filter { width: 200px; }
    .inline-form-card { margin-top: 1.5rem; }
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
      margin-top: 1rem;
    }
    .completed-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
    .pending-chip { --mdc-chip-elevated-container-color: #fff9c4; }
  `,
})
export default class MaintenanceListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly notification = inject(NotificationService);

  readonly maintenance = this.store.selectSignal(selectMaintenance);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly completionFilter = signal<boolean | undefined>(undefined);
  readonly assetIdFilter = signal('');
  readonly showScheduleForm = signal(false);
  readonly showCompleteForm = signal(false);
  readonly completingMaintenanceId = signal<string | null>(null);

  readonly completionFilters: { value: boolean | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: false, label: 'Scheduled' },
    { value: true, label: 'Completed' },
  ];

  readonly scheduledDateTpl = viewChild<TemplateRef<unknown>>('scheduledDateTpl');
  readonly completedDateTpl = viewChild<TemplateRef<unknown>>('completedDateTpl');
  readonly costTpl = viewChild<TemplateRef<unknown>>('costTpl');
  readonly completedTpl = viewChild<TemplateRef<unknown>>('completedTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'assetName', label: 'Asset', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'scheduledDate', label: 'Scheduled Date', template: this.scheduledDateTpl() },
    { key: 'completedDate', label: 'Completed Date', template: this.completedDateTpl() },
    { key: 'cost', label: 'Cost', template: this.costTpl() },
    { key: 'isCompleted', label: 'Status', template: this.completedTpl() },
    { key: 'actions', label: '', template: this.actionsTpl() },
  ]);

  readonly scheduleForm = this.fb.nonNullable.group({
    assetId: ['', [Validators.required]],
    description: ['', [Validators.required]],
    scheduledDate: ['', [Validators.required]],
  });

  readonly completeForm = this.fb.nonNullable.group({
    completedDate: ['', [Validators.required]],
    cost: [null as number | null],
    performedBy: [''],
    notes: [''],
    nextScheduledDate: [''],
  });

  ngOnInit(): void {
    this.loadMaintenance();
  }

  loadMaintenance(): void {
    this.store.dispatch(
      AssetsActions.loadMaintenance({
        assetId: this.assetIdFilter() || undefined,
        isCompleted: this.completionFilter(),
      })
    );
  }

  onCompletionFilter(value: boolean | undefined): void {
    this.completionFilter.set(value);
    this.loadMaintenance();
  }

  onAssetIdFilter(value: string): void {
    this.assetIdFilter.set(value);
    this.loadMaintenance();
  }

  onRowClick(row: AssetMaintenanceDto): void {
    if (!row.isCompleted) {
      this.onCompleteClick(row);
    }
  }

  onCompleteClick(row: AssetMaintenanceDto): void {
    this.completingMaintenanceId.set(row.id);
    this.showCompleteForm.set(true);
    this.showScheduleForm.set(false);
  }

  onScheduleSubmit(): void {
    if (this.scheduleForm.invalid) return;
    const value = this.scheduleForm.getRawValue();
    const request: ScheduleMaintenanceRequest = {
      assetId: value.assetId,
      description: value.description,
      scheduledDate: typeof value.scheduledDate === 'string' ? value.scheduledDate : new Date(value.scheduledDate).toISOString(),
    };
    this.maintenanceService.scheduleMaintenance(request).subscribe({
      next: () => {
        this.notification.success('assets.messages.maintenanceScheduled');
        this.showScheduleForm.set(false);
        this.scheduleForm.reset();
        this.loadMaintenance();
      },
      error: () => this.notification.error('Failed to schedule maintenance'),
    });
  }

  onCompleteSubmit(): void {
    if (this.completeForm.invalid || !this.completingMaintenanceId()) return;
    const value = this.completeForm.getRawValue();
    const request: CompleteMaintenanceRequest = {
      maintenanceId: this.completingMaintenanceId()!,
      completedDate: typeof value.completedDate === 'string' ? value.completedDate : new Date(value.completedDate).toISOString(),
      cost: value.cost ?? undefined,
      performedBy: value.performedBy || undefined,
      notes: value.notes || undefined,
      nextScheduledDate: value.nextScheduledDate
        ? (typeof value.nextScheduledDate === 'string' ? value.nextScheduledDate : new Date(value.nextScheduledDate).toISOString())
        : undefined,
    };
    this.maintenanceService.completeMaintenance(this.completingMaintenanceId()!, request).subscribe({
      next: () => {
        this.notification.success('assets.messages.maintenanceCompleted');
        this.showCompleteForm.set(false);
        this.completingMaintenanceId.set(null);
        this.completeForm.reset();
        this.loadMaintenance();
      },
      error: () => this.notification.error('Failed to complete maintenance'),
    });
  }
}
