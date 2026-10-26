import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
  selectDataSyncConfigs,
  selectImportExportLoading,
} from '../../store/import-export.selectors';
import { DataSyncConfigDto, DataSourceType, CreateDataSyncRequest, UpdateDataSyncRequest } from '../../models/data-sync.model';
import { DataSyncService } from '../../services/data-sync.service';

@Component({
  selector: 'ethel-data-sync-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'importexport.sync.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'importexport.sync.create'"
              (click)="onShowCreateForm()">
        <mat-icon>add</mat-icon>
        {{ 'importexport.sync.create' | translate }}
      </button>
    </app-page-header>

    <!-- Create / Edit Form -->
    @if (showForm()) {
      <div class="sync-form">
        <h4>{{ editing() ? ('importexport.sync.edit' | translate) : ('importexport.sync.create' | translate) }}</h4>
        <form [formGroup]="form" (ngSubmit)="onSubmitForm()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.name' | translate }}</mat-label>
              <input matInput formControlName="name" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.sourceType' | translate }}</mat-label>
              <mat-select formControlName="sourceType">
                @for (st of sourceTypes; track st) {
                  <mat-option [value]="st">{{ st }}</mat-option>
                }
              </mat-select>
              @if (form.controls.sourceType.hasError('required')) {
                <mat-error>Source type is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.sourceUrl' | translate }}</mat-label>
              <input matInput formControlName="sourceUrl" />
              @if (form.controls.sourceUrl.hasError('required')) {
                <mat-error>Source URL is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.apiKey' | translate }}</mat-label>
              <input matInput formControlName="apiKey" type="password" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.formId' | translate }}</mat-label>
              <input matInput formControlName="formId" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.targetModule' | translate }}</mat-label>
              <mat-select formControlName="targetModule">
                @for (m of modules; track m) {
                  <mat-option [value]="m">{{ m }}</mat-option>
                }
              </mat-select>
              @if (form.controls.targetModule.hasError('required')) {
                <mat-error>Target module is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.targetEntityType' | translate }}</mat-label>
              <input matInput formControlName="targetEntityType" />
              @if (form.controls.targetEntityType.hasError('required')) {
                <mat-error>Target entity type is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'importexport.fields.syncFrequency' | translate }}</mat-label>
              <input matInput formControlName="syncFrequency" placeholder="e.g. 0 */6 * * *" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'importexport.fields.mappingConfig' | translate }}</mat-label>
              <textarea matInput formControlName="mappingConfig" rows="4"
                        placeholder='JSON mapping configuration'></textarea>
              @if (form.controls.mappingConfig.hasError('required')) {
                <mat-error>Mapping config is required</mat-error>
              }
            </mat-form-field>

            @if (editing()) {
              <div class="toggle-row">
                <mat-slide-toggle formControlName="isActive">
                  {{ 'importexport.fields.isActive' | translate }}
                </mat-slide-toggle>
              </div>
            }
          </div>
          <div class="form-actions">
            <button mat-button type="button" (click)="onCancelForm()">{{ 'common.cancel' | translate }}</button>
            <button mat-flat-button color="primary" type="submit"
                    [disabled]="form.invalid || submitting()">
              @if (submitting()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'common.save' | translate }}
              }
            </button>
          </div>
        </form>
      </div>
    }

    <app-data-table
      [columns]="columns()"
      [data]="configs()"
      [loading]="loading()"
      emptyTitle="No data sync configurations"
      emptyMessage="Create a sync configuration to connect external data sources.">
    </app-data-table>

    <ng-template #sourceTypeTpl let-row>
      <mat-chip>{{ row.sourceType }}</mat-chip>
    </ng-template>

    <ng-template #activeTpl let-row>
      <mat-chip [class.active-chip]="row.isActive" [class.inactive-chip]="!row.isActive">
        {{ row.isActive ? 'Active' : 'Inactive' }}
      </mat-chip>
    </ng-template>

    <ng-template #lastSyncTpl let-row>
      @if (row.lastSyncAt) {
        {{ row.lastSyncAt | date:'medium' }}
      } @else {
        Never
      }
    </ng-template>

    <ng-template #actionsTpl let-row>
      <button mat-icon-button *appHasPermission="'importexport.sync.update'" (click)="onTriggerSync(row)">
        <mat-icon>sync</mat-icon>
      </button>
      <button mat-icon-button *appHasPermission="'importexport.sync.update'" (click)="onEdit(row)">
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button *appHasPermission="'importexport.sync.delete'" (click)="onDelete(row)">
        <mat-icon>delete</mat-icon>
      </button>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .sync-form {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .sync-form h4 { margin: 0 0 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .toggle-row { grid-column: 1 / -1; margin-bottom: 1rem; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .active-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
    .inactive-chip { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class DataSyncListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly dataSyncService = inject(DataSyncService);
  private readonly notification = inject(NotificationService);

  readonly configs = this.store.selectSignal(selectDataSyncConfigs);
  readonly loading = this.store.selectSignal(selectImportExportLoading);

  readonly showForm = signal(false);
  readonly editing = signal(false);
  readonly editingId = signal('');
  readonly submitting = signal(false);

  readonly modules = ['Projects', 'Participants', 'FundAccounting', 'Assets', 'Training', 'Procurement'];
  readonly sourceTypes: DataSourceType[] = ['KoboToolbox', 'ODK', 'CommCare', 'CustomApi'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    sourceType: ['' as string, [Validators.required]],
    sourceUrl: ['', [Validators.required]],
    apiKey: [''],
    formId: [''],
    targetModule: ['' as string, [Validators.required]],
    targetEntityType: ['', [Validators.required]],
    mappingConfig: ['', [Validators.required]],
    syncFrequency: [''],
    isActive: [true],
  });

  readonly sourceTypeTpl = viewChild<TemplateRef<unknown>>('sourceTypeTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');
  readonly lastSyncTpl = viewChild<TemplateRef<unknown>>('lastSyncTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'sourceType', label: 'Source', template: this.sourceTypeTpl() },
    { key: 'targetModule', label: 'Target Module' },
    { key: 'targetEntityType', label: 'Entity Type' },
    { key: 'syncFrequency', label: 'Frequency' },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
    { key: 'lastSyncAt', label: 'Last Sync', template: this.lastSyncTpl() },
    { key: 'actions', label: '', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(ImportExportActions.loadSyncConfigs());
  }

  onShowCreateForm(): void {
    this.editing.set(false);
    this.editingId.set('');
    this.form.reset();
    this.form.patchValue({ isActive: true });
    this.showForm.set(true);
  }

  onEdit(row: DataSyncConfigDto): void {
    this.editing.set(true);
    this.editingId.set(row.id);
    this.form.patchValue({
      name: row.name,
      sourceType: row.sourceType,
      sourceUrl: row.sourceUrl,
      formId: row.formId ?? '',
      targetModule: row.targetModule,
      targetEntityType: row.targetEntityType,
      syncFrequency: row.syncFrequency ?? '',
      isActive: row.isActive,
    });
    this.showForm.set(true);
  }

  onCancelForm(): void {
    this.showForm.set(false);
    this.form.reset();
  }

  onSubmitForm(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const value = this.form.getRawValue();

    if (this.editing()) {
      const request: UpdateDataSyncRequest = {
        id: this.editingId(),
        name: value.name,
        sourceUrl: value.sourceUrl,
        apiKey: value.apiKey || undefined,
        mappingConfig: value.mappingConfig,
        syncFrequency: value.syncFrequency || undefined,
        isActive: value.isActive,
      };
      this.dataSyncService.update(this.editingId(), request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.notification.success('Sync configuration updated');
          this.store.dispatch(ImportExportActions.loadSyncConfigs());
        },
        error: () => {
          this.submitting.set(false);
          this.notification.error('Failed to update sync configuration');
        },
      });
    } else {
      const request: CreateDataSyncRequest = {
        name: value.name,
        sourceType: value.sourceType as DataSourceType,
        sourceUrl: value.sourceUrl,
        apiKey: value.apiKey || undefined,
        formId: value.formId || undefined,
        targetModule: value.targetModule,
        targetEntityType: value.targetEntityType,
        mappingConfig: value.mappingConfig,
        syncFrequency: value.syncFrequency || undefined,
      };
      this.dataSyncService.create(request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.form.reset();
          this.notification.success('Sync configuration created');
          this.store.dispatch(ImportExportActions.loadSyncConfigs());
        },
        error: () => {
          this.submitting.set(false);
          this.notification.error('Failed to create sync configuration');
        },
      });
    }
  }

  onTriggerSync(row: DataSyncConfigDto): void {
    this.dataSyncService.trigger(row.id).subscribe({
      next: () => this.notification.success('Sync triggered for ' + row.name),
      error: () => this.notification.error('Failed to trigger sync'),
    });
  }

  onDelete(row: DataSyncConfigDto): void {
    this.store.dispatch(ImportExportActions.deleteSyncConfig({ id: row.id }));
    this.notification.success('Sync configuration deleted');
  }
}
