import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  EmptyStateComponent,
  LoadingSpinnerComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DashboardActions } from '../../store/dashboards.actions';
import { selectSavedFilters, selectDashboardsLoading } from '../../store/dashboards.selectors';
import { SavedFilterDto } from '../../models/saved-filter.model';

@Component({
  selector: 'ethel-filter-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'dashboards.filters.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'dashboards.filters.create'" (click)="onCreateFilter()">
        <mat-icon>add</mat-icon>
        {{ 'dashboards.filters.create' | translate }}
      </button>
      <button mat-stroked-button (click)="onBackToDashboards()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'dashboards.dashboards.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'dashboards.fields.module' | translate }}</mat-label>
          <mat-select [value]="moduleFilter()" (selectionChange)="onModuleFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (mod of modules; track mod) {
              <mat-option [value]="mod">{{ mod }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (filteredFilters().length === 0) {
        <app-empty-state
          icon="filter_list"
          title="No saved filters found"
          message="Create a new saved filter to get started.">
        </app-empty-state>
      } @else {
        <app-data-table
          [columns]="columns()"
          [data]="filteredFilters()"
          [loading]="loading()"
          [totalCount]="filteredFilters().length"
          [page]="1"
          [pageSize]="100"
          emptyTitle="No saved filters found"
          emptyMessage="No saved filters have been created yet.">
        </app-data-table>
      }
    </div>

    <ng-template #moduleTpl let-row>
      <mat-chip>{{ row.module }}</mat-chip>
    </ng-template>

    <ng-template #defaultTpl let-row>
      @if (row.isDefault) {
        <mat-chip class="default-chip">Default</mat-chip>
      }
    </ng-template>

    <ng-template #actionsTpl let-row>
      <button mat-icon-button color="warn" *appHasPermission="'dashboards.filters.delete'" (click)="onDeleteFilter(row); $event.stopPropagation()">
        <mat-icon>delete</mat-icon>
      </button>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 220px; }
    .default-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
  `,
})
export default class FilterListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly filters = this.store.selectSignal(selectSavedFilters);
  readonly loading = this.store.selectSignal(selectDashboardsLoading);

  readonly moduleFilter = signal('');

  readonly modules: string[] = [
    'Projects', 'Planning', 'Reporting', 'MEAL', 'Participants',
    'Procurement', 'FundAccounting', 'Assets', 'Training', 'Tasks',
    'Risk', 'Donors', 'Documents', 'Feedback', 'Dashboards',
  ];

  readonly moduleTpl = viewChild<TemplateRef<unknown>>('moduleTpl');
  readonly defaultTpl = viewChild<TemplateRef<unknown>>('defaultTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly filteredFilters = computed(() => {
    const mod = this.moduleFilter();
    if (!mod) return this.filters();
    return this.filters().filter((f) => f.module === mod);
  });

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'module', label: 'Module', template: this.moduleTpl() },
    { key: 'isDefault', label: 'Default', template: this.defaultTpl() },
    { key: 'actions', label: 'Actions', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadFilters({}));
  }

  onModuleFilter(value: string): void {
    this.moduleFilter.set(value);
    if (value) {
      this.store.dispatch(DashboardActions.loadFilters({ module: value }));
    } else {
      this.store.dispatch(DashboardActions.loadFilters({}));
    }
  }

  onDeleteFilter(filter: SavedFilterDto): void {
    this.store.dispatch(DashboardActions.deleteFilter({ id: filter.id }));
  }

  onCreateFilter(): void {
    this.router.navigate(['/dashboards/filters/create']);
  }

  onBackToDashboards(): void {
    this.router.navigate(['/dashboards']);
  }
}
