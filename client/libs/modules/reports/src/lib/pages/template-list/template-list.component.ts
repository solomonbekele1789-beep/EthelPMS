import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
import { selectTemplates, selectReportsLoading } from '../../store/reports.selectors';

@Component({
  selector: 'ethel-template-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
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
    <app-page-header [title]="'reports.templates.list.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'reports.templates.create'" (click)="onCreateTemplate()">
        <mat-icon>add</mat-icon>
        {{ 'reports.templates.list.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!moduleFilter()"
            (click)="onModuleFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (mod of modules; track mod) {
            <mat-chip
              [highlighted]="moduleFilter() === mod"
              (click)="onModuleFilter(mod)">
              {{ mod }}
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="filteredTemplates()"
        [loading]="loading()"
        [totalCount]="filteredTemplates().length"
        [page]="1"
        [pageSize]="50"
        emptyTitle="No report templates found"
        emptyMessage="Get started by creating your first report template."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #formatTpl let-row>
      <mat-chip-set>
        <mat-chip [class]="'format-chip format-' + row.reportFormat.toLowerCase()">
          {{ row.reportFormat }}
        </mat-chip>
      </mat-chip-set>
    </ng-template>

    <ng-template #systemTpl let-row>
      @if (row.isSystemTemplate) {
        <mat-icon matTooltip="System Template" class="system-badge">verified</mat-icon>
      }
    </ng-template>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.isActive ? 'Active' : 'Inactive'" [label]="row.isActive ? 'Active' : 'Inactive'"></app-status-badge>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .system-badge { color: var(--mat-primary); font-size: 20px; }
    .format-chip { font-size: 12px; }
    .format-pdf { --mdc-chip-elevated-container-color: #fee2e2; }
    .format-excel { --mdc-chip-elevated-container-color: #dcfce7; }
    .format-word { --mdc-chip-elevated-container-color: #dbeafe; }
    .format-csv { --mdc-chip-elevated-container-color: #fef3c7; }
  `,
})
export default class TemplateListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly templates = this.store.selectSignal(selectTemplates);
  readonly loading = this.store.selectSignal(selectReportsLoading);

  readonly moduleFilter = signal<string | undefined>(undefined);
  readonly modules = ['Projects', 'Planning', 'Reporting', 'MEAL', 'Procurement', 'FundAccounting', 'Assets'];

  readonly formatTpl = viewChild<TemplateRef<unknown>>('formatTpl');
  readonly systemTpl = viewChild<TemplateRef<unknown>>('systemTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly filteredTemplates = computed(() => {
    const mod = this.moduleFilter();
    const all = this.templates();
    return mod ? all.filter((t) => t.module === mod) : all;
  });

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'reportFormat', label: 'Format', template: this.formatTpl() },
    { key: 'isSystemTemplate', label: 'System', template: this.systemTpl() },
    { key: 'isActive', label: 'Status', template: this.statusTpl() },
    { key: 'createdAt', label: 'Created', sortable: true, template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.store.dispatch(ReportsActions.loadTemplates({ module: this.moduleFilter() }));
  }

  onModuleFilter(mod: string | undefined): void {
    this.moduleFilter.set(mod);
    this.loadTemplates();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/reports/templates', row.id]);
  }

  onCreateTemplate(): void {
    this.router.navigate(['/reports/templates/create']);
  }
}
