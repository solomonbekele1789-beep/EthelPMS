import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ImportExportActions } from '../../store/import-export.actions';
import {
  selectImportJobs,
  selectImportExportLoading,
} from '../../store/import-export.selectors';
import { ImportJobListDto, ImportJobStatus } from '../../models/import-job.model';

@Component({
  selector: 'ethel-import-job-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'importexport.imports.title' | translate">
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'importexport.fields.module' | translate }}</mat-label>
          <mat-select [value]="moduleFilter()" (selectionChange)="onModuleFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (m of modules; track m) {
              <mat-option [value]="m">{{ m }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'importexport.fields.status' | translate }}</mat-label>
          <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ s }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="jobs()"
        [loading]="loading()"
        emptyTitle="No import jobs found"
        emptyMessage="No data imports have been started yet."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <mat-chip [class.status-pending]="row.status === 'Pending'"
                [class.status-validating]="row.status === 'Validating' || row.status === 'Validated'"
                [class.status-processing]="row.status === 'Processing'"
                [class.status-completed]="row.status === 'Completed'"
                [class.status-errors]="row.status === 'CompletedWithErrors'"
                [class.status-failed]="row.status === 'Failed'"
                [class.status-cancelled]="row.status === 'Cancelled'">
        {{ row.status }}
      </mat-chip>
    </ng-template>

    <ng-template #progressTpl let-row>
      @if (row.totalRows != null) {
        <span>{{ row.successRows ?? 0 }} / {{ row.totalRows }}</span>
        @if (row.errorRows) {
          <span class="error-count">({{ row.errorRows }} errors)</span>
        }
      } @else {
        <span>-</span>
      }
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>

    <ng-template #actionsTpl let-row>
      @if (row.status === 'Pending' || row.status === 'Validating' || row.status === 'Processing') {
        <button mat-icon-button *appHasPermission="'importexport.import.update'" (click)="onCancel(row, $event)">
          <mat-icon>cancel</mat-icon>
        </button>
      }
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 200px; }
    .error-count { color: #d32f2f; font-size: 0.85em; margin-left: 4px; }
    .status-pending { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-validating { --mdc-chip-elevated-container-color: #bbdefb; }
    .status-processing { --mdc-chip-elevated-container-color: #ffe0b2; }
    .status-completed { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-errors { --mdc-chip-elevated-container-color: #fff9c4; }
    .status-failed { --mdc-chip-elevated-container-color: #ffcdd2; }
    .status-cancelled { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class ImportJobListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly jobs = this.store.selectSignal(selectImportJobs);
  readonly loading = this.store.selectSignal(selectImportExportLoading);

  readonly moduleFilter = signal('');
  readonly statusFilter = signal('');

  readonly modules = ['Projects', 'Participants', 'FundAccounting', 'Assets', 'Training', 'Procurement'];
  readonly statuses: ImportJobStatus[] = ['Pending', 'Validating', 'Validated', 'Processing', 'Completed', 'CompletedWithErrors', 'Failed', 'Cancelled'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly progressTpl = viewChild<TemplateRef<unknown>>('progressTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'fileName', label: 'File Name', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'entityType', label: 'Entity Type' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'progress', label: 'Progress', template: this.progressTpl() },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
    { key: 'actions', label: '', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.store.dispatch(
      ImportExportActions.loadImportJobs({
        module: this.moduleFilter() || undefined,
        status: this.statusFilter() || undefined,
      })
    );
  }

  onModuleFilter(value: string): void {
    this.moduleFilter.set(value);
    this.loadJobs();
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.loadJobs();
  }

  onRowClick(row: ImportJobListDto): void {
    this.router.navigate(['/import-export/imports', row.id]);
  }

  onCancel(row: ImportJobListDto, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(ImportExportActions.cancelImport({ id: row.id }));
    this.notification.success('Import job cancelled');
  }
}
