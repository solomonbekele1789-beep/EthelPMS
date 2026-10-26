import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  selectExportJobs,
  selectImportExportLoading,
} from '../../store/import-export.selectors';
import { ExportJobDto, ExportFormat, ExportJobStatus, StartExportRequest } from '../../models/export-job.model';
import { ExportJobService } from '../../services/export-job.service';

@Component({
  selector: 'ethel-export-job-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'importexport.exports.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'importexport.export.create'"
              (click)="showExportForm.set(!showExportForm())">
        <mat-icon>file_download</mat-icon>
        {{ 'importexport.exports.start' | translate }}
      </button>
    </app-page-header>

    <!-- Start Export Form -->
    @if (showExportForm()) {
      <div class="export-form">
        <h4>{{ 'importexport.exports.new' | translate }}</h4>
        <form [formGroup]="exportForm" (ngSubmit)="onStartExport()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.module' | translate }}</mat-label>
              <mat-select formControlName="module">
                @for (m of modules; track m) {
                  <mat-option [value]="m">{{ m }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.entityType' | translate }}</mat-label>
              <input matInput formControlName="entityType" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.exportFormat' | translate }}</mat-label>
              <mat-select formControlName="exportFormat">
                @for (f of exportFormats; track f) {
                  <mat-option [value]="f">{{ f }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.filterCriteria' | translate }}</mat-label>
              <input matInput formControlName="filterCriteria" placeholder="Optional JSON filter" />
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button type="button" (click)="showExportForm.set(false)">{{ 'common.cancel' | translate }}</button>
            <button mat-flat-button color="primary" type="submit"
                    [disabled]="exportForm.invalid || exporting()">
              @if (exporting()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'importexport.exports.start' | translate }}
              }
            </button>
          </div>
        </form>
      </div>
    }

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
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="jobs()"
        [loading]="loading()"
        emptyTitle="No export jobs found"
        emptyMessage="Start an export to download data from the system.">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <mat-chip [class.status-pending]="row.status === 'Pending'"
                [class.status-processing]="row.status === 'Processing'"
                [class.status-completed]="row.status === 'Completed'"
                [class.status-failed]="row.status === 'Failed'">
        {{ row.status }}
      </mat-chip>
    </ng-template>

    <ng-template #formatTpl let-row>
      <mat-chip>{{ row.exportFormat }}</mat-chip>
    </ng-template>

    <ng-template #fileTpl let-row>
      @if (row.fileName && row.status === 'Completed') {
        <span class="download-link">{{ row.fileName }}</span>
      } @else {
        <span>-</span>
      }
    </ng-template>

    <ng-template #dateTpl let-row>
      @if (row.completedAt) {
        {{ row.completedAt | date:'mediumDate' }}
      } @else {
        -
      }
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 200px; }
    .export-form {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .export-form h4 { margin: 0 0 1rem; }
    .form-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 180px; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .download-link { color: #1565c0; cursor: pointer; text-decoration: underline; }
    .status-pending { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-processing { --mdc-chip-elevated-container-color: #ffe0b2; }
    .status-completed { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-failed { --mdc-chip-elevated-container-color: #ffcdd2; }
  `,
})
export default class ExportJobListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly exportJobService = inject(ExportJobService);
  private readonly notification = inject(NotificationService);

  readonly jobs = this.store.selectSignal(selectExportJobs);
  readonly loading = this.store.selectSignal(selectImportExportLoading);

  readonly moduleFilter = signal('');
  readonly showExportForm = signal(false);
  readonly exporting = signal(false);

  readonly modules = ['Projects', 'Participants', 'FundAccounting', 'Assets', 'Training', 'Procurement'];
  readonly exportFormats: ExportFormat[] = ['CSV', 'Excel', 'JSON', 'PDF'];

  readonly exportForm = this.fb.nonNullable.group({
    module: ['' as string, [Validators.required]],
    entityType: ['', [Validators.required]],
    exportFormat: ['' as string, [Validators.required]],
    filterCriteria: [''],
  });

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly formatTpl = viewChild<TemplateRef<unknown>>('formatTpl');
  readonly fileTpl = viewChild<TemplateRef<unknown>>('fileTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'module', label: 'Module', sortable: true },
    { key: 'entityType', label: 'Entity Type' },
    { key: 'exportFormat', label: 'Format', template: this.formatTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'totalRecords', label: 'Records' },
    { key: 'fileName', label: 'File', template: this.fileTpl() },
    { key: 'completedAt', label: 'Completed', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.store.dispatch(
      ImportExportActions.loadExportJobs({ module: this.moduleFilter() || undefined })
    );
  }

  onModuleFilter(value: string): void {
    this.moduleFilter.set(value);
    this.loadJobs();
  }

  onStartExport(): void {
    if (this.exportForm.invalid) return;
    this.exporting.set(true);
    const value = this.exportForm.getRawValue();
    const request: StartExportRequest = {
      module: value.module,
      entityType: value.entityType,
      exportFormat: value.exportFormat as ExportFormat,
      filterCriteria: value.filterCriteria || undefined,
    };
    this.exportJobService.start(request).subscribe({
      next: () => {
        this.exporting.set(false);
        this.showExportForm.set(false);
        this.exportForm.reset();
        this.notification.success('Export started successfully');
        this.loadJobs();
      },
      error: () => {
        this.exporting.set(false);
        this.notification.error('Failed to start export');
      },
    });
  }
}
