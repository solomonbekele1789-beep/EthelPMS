import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { RiskActions } from '../../store/risk.actions';
import {
  selectRisks,
  selectRisksTotalCount,
  selectRiskLoading,
  selectCategories,
} from '../../store/risk.selectors';
import { RiskStatus } from '../../models/risk.model';

@Component({
  selector: 'ethel-risk-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'risk.risks.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'risk.risks.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'risk.risks.createButton' | translate }}
      </button>
      <button mat-stroked-button (click)="onMatrix()">
        <mat-icon>grid_on</mat-icon>
        {{ 'risk.matrix.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <!-- Filters Row -->
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'risk.fields.projectId' | translate }}</mat-label>
          <input matInput [value]="projectIdFilter()" (keyup.enter)="onProjectIdFilter($event)" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'risk.fields.riskCategoryId' | translate }}</mat-label>
          <mat-select [value]="categoryIdFilter()" (selectionChange)="onCategoryFilter($event.value)">
            <mat-option value="">{{ 'common.all' | translate }}</mat-option>
            @for (cat of categories(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Status Filter Chips -->
      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!statusFilter()"
            (click)="onStatusFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (status of statuses; track status) {
            <mat-chip
              [highlighted]="statusFilter() === status"
              [class]="'status-chip-' + status.toLowerCase()"
              (click)="onStatusFilter(status)">
              {{ status }}
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <!-- Data Table -->
      <app-data-table
        [columns]="columns()"
        [data]="risks()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No risks found"
        emptyMessage="Get started by identifying your first risk."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <mat-chip [class]="getStatusChipClass(row.status)">
        {{ row.status }}
      </mat-chip>
    </ng-template>

    <ng-template #scoreTpl let-row>
      <span class="risk-score" [class]="getScoreClass(row.riskScore)">
        {{ row.riskScore }}
      </span>
    </ng-template>

    <ng-template #dateTpl let-row>
      @if (row.identifiedDate) {
        {{ row.identifiedDate | date:'mediumDate' }}
      } @else {
        <span class="text-muted">--</span>
      }
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .filter-field { width: 200px; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .text-muted { color: var(--mat-sys-outline); }
    .risk-score {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-weight: 600;
      font-size: 14px;
      color: #fff;
    }
    .score-low { background-color: #4caf50; }
    .score-medium { background-color: #ff9800; }
    .score-high { background-color: #f44336; }
    .score-critical { background-color: #b71c1c; }
    .status-chip-identified { background-color: #e0e0e0 !important; }
    .status-chip-assessed { background-color: #bbdefb !important; color: #1565c0 !important; }
    .status-chip-mitigating { background-color: #fff9c4 !important; color: #f57f17 !important; }
    .status-chip-resolved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-chip-accepted { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .status-chip-closed { background-color: #e0e0e0 !important; color: #616161 !important; }
  `,
})
export default class RiskListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly risks = this.store.selectSignal(selectRisks);
  readonly totalCount = this.store.selectSignal(selectRisksTotalCount);
  readonly loading = this.store.selectSignal(selectRiskLoading);
  readonly categories = this.store.selectSignal(selectCategories);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly statusFilter = signal<RiskStatus | undefined>(undefined);
  readonly categoryIdFilter = signal('');
  readonly projectIdFilter = signal('');

  readonly statuses: RiskStatus[] = ['Identified', 'Assessed', 'Mitigating', 'Resolved', 'Accepted', 'Closed'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly scoreTpl = viewChild<TemplateRef<unknown>>('scoreTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'likelihood', label: 'Likelihood' },
    { key: 'impact', label: 'Impact' },
    { key: 'riskScore', label: 'Score', template: this.scoreTpl() },
    { key: 'owner', label: 'Owner' },
    { key: 'identifiedDate', label: 'Identified', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(RiskActions.loadCategories());
    this.loadRisks();
  }

  loadRisks(): void {
    this.store.dispatch(
      RiskActions.loadRisks({
        page: this.page(),
        pageSize: this.pageSize(),
        status: this.statusFilter() || undefined,
        categoryId: this.categoryIdFilter() || undefined,
        projectId: this.projectIdFilter() || undefined,
      })
    );
  }

  onStatusFilter(status: RiskStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadRisks();
  }

  onCategoryFilter(categoryId: string): void {
    this.categoryIdFilter.set(categoryId);
    this.page.set(1);
    this.loadRisks();
  }

  onProjectIdFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectIdFilter.set(value);
    this.page.set(1);
    this.loadRisks();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadRisks();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/risk', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/risk/create']);
  }

  onMatrix(): void {
    this.router.navigate(['/risk/matrix']);
  }

  getStatusChipClass(status: string): string {
    return 'status-chip-' + status.toLowerCase();
  }

  getScoreClass(score: number): string {
    if (score <= 4) return 'risk-score score-low';
    if (score <= 9) return 'risk-score score-medium';
    if (score <= 14) return 'risk-score score-high';
    return 'risk-score score-critical';
  }
}
