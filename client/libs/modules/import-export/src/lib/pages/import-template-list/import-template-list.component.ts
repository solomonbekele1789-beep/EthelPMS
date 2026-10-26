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
  selectImportTemplates,
  selectImportExportLoading,
} from '../../store/import-export.selectors';
import { ImportTemplateDto, ImportFileFormat } from '../../models/import-template.model';

@Component({
  selector: 'ethel-import-template-list',
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
    <app-page-header [title]="'importexport.templates.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'importexport.templates.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'importexport.templates.create' | translate }}
      </button>
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
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="templates()"
        [loading]="loading()"
        emptyTitle="No import templates found"
        emptyMessage="Create a template to get started with data imports."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #formatTpl let-row>
      <mat-chip>{{ row.fileFormat }}</mat-chip>
    </ng-template>

    <ng-template #systemTpl let-row>
      @if (row.isSystemTemplate) {
        <mat-chip class="system-chip">System</mat-chip>
      }
    </ng-template>

    <ng-template #activeTpl let-row>
      <mat-chip [class.active-chip]="row.isActive" [class.inactive-chip]="!row.isActive">
        {{ row.isActive ? 'Active' : 'Inactive' }}
      </mat-chip>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>

    <ng-template #actionsTpl let-row>
      <button mat-icon-button *appHasPermission="'importexport.templates.delete'" (click)="onDelete(row, $event)">
        <mat-icon>delete</mat-icon>
      </button>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 200px; }
    .system-chip { --mdc-chip-elevated-container-color: #e8eaf6; }
    .active-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
    .inactive-chip { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class ImportTemplateListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly templates = this.store.selectSignal(selectImportTemplates);
  readonly loading = this.store.selectSignal(selectImportExportLoading);

  readonly moduleFilter = signal('');

  readonly modules = ['Projects', 'Participants', 'FundAccounting', 'Assets', 'Training', 'Procurement'];

  readonly formatTpl = viewChild<TemplateRef<unknown>>('formatTpl');
  readonly systemTpl = viewChild<TemplateRef<unknown>>('systemTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'entityType', label: 'Entity Type' },
    { key: 'fileFormat', label: 'Format', template: this.formatTpl() },
    { key: 'isSystemTemplate', label: 'Type', template: this.systemTpl() },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
    { key: 'actions', label: '', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.store.dispatch(
      ImportExportActions.loadTemplates({ module: this.moduleFilter() || undefined })
    );
  }

  onModuleFilter(value: string): void {
    this.moduleFilter.set(value);
    this.loadTemplates();
  }

  onRowClick(row: ImportTemplateDto): void {
    this.router.navigate(['/import-export/templates', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/import-export/templates/create']);
  }

  onDelete(row: ImportTemplateDto, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(ImportExportActions.deleteTemplate({ id: row.id }));
    this.notification.success('Template deleted');
  }
}
