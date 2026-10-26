import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { selectGeneratedReports, selectTemplates, selectReportsLoading } from '../../store/reports.selectors';
import { ShareReportRequest } from '../../models/generated-report.model';

@Component({
  selector: 'ethel-generated-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'reports.generated.list.title' | translate"></app-page-header>

    <div class="list-container">
      <div class="filters">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'reports.generated.filters.template' | translate }}</mat-label>
          <mat-select (selectionChange)="onTemplateFilter($event.value)">
            <mat-option value="">{{ 'common.all' | translate }}</mat-option>
            @for (tpl of templates(); track tpl.id) {
              <mat-option [value]="tpl.id">{{ tpl.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'reports.generated.filters.dateFrom' | translate }}</mat-label>
          <input matInput [matDatepicker]="fromPicker" (dateChange)="onDateFromChange($event.value)" />
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'reports.generated.filters.dateTo' | translate }}</mat-label>
          <input matInput [matDatepicker]="toPicker" (dateChange)="onDateToChange($event.value)" />
          <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="reports()"
        [loading]="loading()"
        [totalCount]="reports().length"
        [page]="1"
        [pageSize]="50"
        emptyTitle="No generated reports found"
        emptyMessage="Generate a report from a template to see results here.">
      </app-data-table>
    </div>

    <ng-template #formatTpl let-row>
      <mat-chip-set>
        <mat-chip [class]="'format-chip format-' + row.reportFormat.toLowerCase()">
          {{ row.reportFormat }}
        </mat-chip>
      </mat-chip-set>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.generatedAt | date:'medium' }}
    </ng-template>

    <ng-template #sizeTpl let-row>
      {{ formatFileSize(row.fileSize) }}
    </ng-template>

    <ng-template #expiresTpl let-row>
      @if (row.expiresAt) {
        {{ row.expiresAt | date:'mediumDate' }}
      } @else {
        <span class="text-muted">No expiry</span>
      }
    </ng-template>

    <ng-template #actionsTpl let-row>
      <button mat-icon-button *appHasPermission="'reports.generated.create'" (click)="onShare(row); $event.stopPropagation()" matTooltip="Share">
        <mat-icon>share</mat-icon>
      </button>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: flex-start;
    }
    .filter-field { min-width: 200px; }
    .text-muted { color: var(--mat-app-on-surface-variant); }
    .format-chip { font-size: 12px; }
    .format-pdf { --mdc-chip-elevated-container-color: #fee2e2; }
    .format-excel { --mdc-chip-elevated-container-color: #dcfce7; }
    .format-word { --mdc-chip-elevated-container-color: #dbeafe; }
    .format-csv { --mdc-chip-elevated-container-color: #fef3c7; }
  `,
})
export default class GeneratedListComponent implements OnInit {
  private readonly store = inject(Store);

  readonly reports = this.store.selectSignal(selectGeneratedReports);
  readonly templates = this.store.selectSignal(selectTemplates);
  readonly loading = this.store.selectSignal(selectReportsLoading);

  readonly templateFilter = signal<string | undefined>(undefined);
  readonly dateFrom = signal<string | undefined>(undefined);
  readonly dateTo = signal<string | undefined>(undefined);

  readonly formatTpl = viewChild<TemplateRef<unknown>>('formatTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly sizeTpl = viewChild<TemplateRef<unknown>>('sizeTpl');
  readonly expiresTpl = viewChild<TemplateRef<unknown>>('expiresTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'templateName', label: 'Template', sortable: true },
    { key: 'fileName', label: 'File Name' },
    { key: 'reportFormat', label: 'Format', template: this.formatTpl() },
    { key: 'generatedAt', label: 'Generated', sortable: true, template: this.dateTpl() },
    { key: 'fileSize', label: 'Size', template: this.sizeTpl() },
    { key: 'expiresAt', label: 'Expires', template: this.expiresTpl() },
    { key: 'actions', label: '', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.loadReports();
    this.store.dispatch(ReportsActions.loadTemplates({}));
  }

  loadReports(): void {
    this.store.dispatch(
      ReportsActions.loadGeneratedReports({
        templateId: this.templateFilter(),
        dateFrom: this.dateFrom(),
        dateTo: this.dateTo(),
      })
    );
  }

  onTemplateFilter(value: string): void {
    this.templateFilter.set(value || undefined);
    this.loadReports();
  }

  onDateFromChange(value: Date | null): void {
    this.dateFrom.set(value ? value.toISOString() : undefined);
    this.loadReports();
  }

  onDateToChange(value: Date | null): void {
    this.dateTo.set(value ? value.toISOString() : undefined);
    this.loadReports();
  }

  onShare(report: any): void {
    // In a full implementation, this would open a dialog to select recipients
    // For now, dispatch with empty recipients as placeholder
    const request: ShareReportRequest = {
      generatedReportId: report.id,
      recipientUserIds: [],
    };
    this.store.dispatch(ReportsActions.shareReport({ id: report.id, request }));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
