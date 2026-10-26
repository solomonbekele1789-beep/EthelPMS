import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ReportsActions } from '../../store/reports.actions';
import { selectSchedules, selectTemplates, selectReportsLoading } from '../../store/reports.selectors';
import { CreateReportScheduleRequest, UpdateReportScheduleRequest } from '../../models/report-schedule.model';

@Component({
  selector: 'ethel-schedule-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'reports.schedules.list.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'reports.schedules.create'" (click)="toggleCreateForm()">
        <mat-icon>add</mat-icon>
        {{ 'reports.schedules.list.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      @if (showCreateForm()) {
        <div class="create-form-card">
          <h3>{{ 'reports.schedules.create.title' | translate }}</h3>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.schedules.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (createForm.controls.name.hasError('required')) {
                  <mat-error>Schedule name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.schedules.fields.template' | translate }}</mat-label>
                <mat-select formControlName="reportTemplateId">
                  @for (tpl of templates(); track tpl.id) {
                    <mat-option [value]="tpl.id">{{ tpl.name }}</mat-option>
                  }
                </mat-select>
                @if (createForm.controls.reportTemplateId.hasError('required')) {
                  <mat-error>Template is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.schedules.fields.cronExpression' | translate }}</mat-label>
                <input matInput formControlName="cronExpression" placeholder="0 0 * * *" />
                @if (createForm.controls.cronExpression.hasError('required')) {
                  <mat-error>Cron expression is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.schedules.fields.recipients' | translate }}</mat-label>
                <input matInput formControlName="recipientsInput" placeholder="Comma-separated emails" />
                @if (createForm.controls.recipientsInput.hasError('required')) {
                  <mat-error>At least one recipient is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="toggleCreateForm()">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.create' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      }

      <app-data-table
        [columns]="columns()"
        [data]="schedules()"
        [loading]="loading()"
        [totalCount]="schedules().length"
        [page]="1"
        [pageSize]="50"
        emptyTitle="No report schedules found"
        emptyMessage="Create a schedule to automate report generation.">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #lastRunTpl let-row>
      @if (row.lastRunAt) {
        {{ row.lastRunAt | date:'medium' }}
      } @else {
        <span class="text-muted">Never</span>
      }
    </ng-template>

    <ng-template #nextRunTpl let-row>
      @if (row.nextRunAt) {
        {{ row.nextRunAt | date:'medium' }}
      } @else {
        <span class="text-muted">--</span>
      }
    </ng-template>

    <ng-template #activeTpl let-row>
      <mat-slide-toggle
        [checked]="row.isActive"
        *appHasPermission="'reports.schedules.update'"
        (change)="onToggleActive(row)">
      </mat-slide-toggle>
    </ng-template>

    <ng-template #actionsTpl let-row>
      <button mat-icon-button color="warn" *appHasPermission="'reports.schedules.delete'" (click)="onDelete(row.id); $event.stopPropagation()">
        <mat-icon>delete</mat-icon>
      </button>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .create-form-card {
      background: var(--mat-app-surface);
      border: 1px solid var(--mat-app-outline-variant);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .create-form-card h3 { margin: 0 0 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .text-muted { color: var(--mat-app-on-surface-variant); }
  `,
})
export default class ScheduleListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly schedules = this.store.selectSignal(selectSchedules);
  readonly templates = this.store.selectSignal(selectTemplates);
  readonly loading = this.store.selectSignal(selectReportsLoading);

  readonly showCreateForm = signal(false);

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly lastRunTpl = viewChild<TemplateRef<unknown>>('lastRunTpl');
  readonly nextRunTpl = viewChild<TemplateRef<unknown>>('nextRunTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'templateName', label: 'Template' },
    { key: 'cronExpression', label: 'Schedule' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'lastRunAt', label: 'Last Run', template: this.lastRunTpl() },
    { key: 'nextRunAt', label: 'Next Run', template: this.nextRunTpl() },
    { key: 'isActive', label: 'Active', template: this.activeTpl() },
    { key: 'actions', label: '', template: this.actionsTpl() },
  ]);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    reportTemplateId: ['', [Validators.required]],
    cronExpression: ['', [Validators.required]],
    recipientsInput: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.loadSchedules());
    this.store.dispatch(ReportsActions.loadTemplates({}));
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
    if (this.showCreateForm()) {
      this.createForm.reset();
    }
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateReportScheduleRequest = {
      reportTemplateId: value.reportTemplateId,
      name: value.name,
      cronExpression: value.cronExpression,
      recipients: value.recipientsInput.split(',').map((r) => r.trim()).filter(Boolean),
    };
    this.store.dispatch(ReportsActions.createSchedule({ request }));
    this.showCreateForm.set(false);
  }

  onToggleActive(schedule: any): void {
    const request: UpdateReportScheduleRequest = {
      id: schedule.id,
      name: schedule.name,
      cronExpression: schedule.cronExpression,
      recipients: schedule.recipients,
      parameters: schedule.parameters,
      isActive: !schedule.isActive,
    };
    this.store.dispatch(ReportsActions.updateSchedule({ id: schedule.id, request }));
  }

  onDelete(id: string): void {
    this.store.dispatch(ReportsActions.deleteSchedule({ id }));
  }
}
