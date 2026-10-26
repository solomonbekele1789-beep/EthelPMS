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
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FeedbackActions } from '../../store/feedback.actions';
import {
  selectFeedbackItems,
  selectFeedbackTotalCount,
  selectFeedbackLoading,
  selectCategories,
} from '../../store/feedback.selectors';
import { FeedbackStatus, FeedbackType, FeedbackPriority } from '../../models/feedback.model';
import { FeedbackCategoryDto } from '../../models/feedback-category.model';

@Component({
  selector: 'ethel-feedback-list',
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
    <app-page-header [title]="'feedback.feedback.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'feedback.items.read'" (click)="onSubmit()">
        <mat-icon>add</mat-icon>
        {{ 'feedback.feedback.submit' | translate }}
      </button>
      <button mat-stroked-button *appHasPermission="'feedback.dashboard.read'" (click)="onDashboard()">
        <mat-icon>dashboard</mat-icon>
        {{ 'feedback.dashboard.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'feedback.fields.status' | translate }}</mat-label>
          <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ s }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'feedback.fields.type' | translate }}</mat-label>
          <mat-select [value]="typeFilter()" (selectionChange)="onTypeFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (t of types; track t) {
              <mat-option [value]="t">{{ t }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'feedback.fields.category' | translate }}</mat-label>
          <mat-select [value]="categoryFilter()" (selectionChange)="onCategoryFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (cat of categories(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="items()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No feedback items found"
        emptyMessage="No feedback has been submitted yet."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #typeTpl let-row>
      <mat-chip>{{ row.type }}</mat-chip>
    </ng-template>

    <ng-template #statusTpl let-row>
      <mat-chip [class.status-new]="row.status === 'New'"
                [class.status-acknowledged]="row.status === 'Acknowledged'"
                [class.status-under-review]="row.status === 'UnderReview'"
                [class.status-escalated]="row.status === 'Escalated'"
                [class.status-resolved]="row.status === 'Resolved'"
                [class.status-closed]="row.status === 'Closed'">
        {{ row.status }}
      </mat-chip>
    </ng-template>

    <ng-template #priorityTpl let-row>
      <mat-chip [class.priority-low]="row.priority === 'Low'"
                [class.priority-normal]="row.priority === 'Normal'"
                [class.priority-high]="row.priority === 'High'"
                [class.priority-critical]="row.priority === 'Critical'">
        {{ row.priority }}
      </mat-chip>
    </ng-template>

    <ng-template #slaTpl let-row>
      <span [class.sla-on-track]="row.slaStatus === 'OnTrack'"
            [class.sla-breached]="row.slaStatus === 'Breached'">
        {{ row.slaStatus }}
      </span>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 180px; }
    .status-new { --mdc-chip-elevated-container-color: #bbdefb; }
    .status-acknowledged { --mdc-chip-elevated-container-color: #b2dfdb; }
    .status-under-review { --mdc-chip-elevated-container-color: #ffe0b2; }
    .status-escalated { --mdc-chip-elevated-container-color: #ffcdd2; }
    .status-resolved { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-closed { --mdc-chip-elevated-container-color: #e0e0e0; }
    .priority-low { --mdc-chip-elevated-container-color: #e0e0e0; }
    .priority-normal { --mdc-chip-elevated-container-color: #bbdefb; }
    .priority-high { --mdc-chip-elevated-container-color: #ffe0b2; }
    .priority-critical { --mdc-chip-elevated-container-color: #ffcdd2; }
    .sla-on-track { color: #388e3c; font-weight: 500; }
    .sla-breached { color: #d32f2f; font-weight: 500; }
  `,
})
export default class FeedbackListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly items = this.store.selectSignal(selectFeedbackItems);
  readonly totalCount = this.store.selectSignal(selectFeedbackTotalCount);
  readonly loading = this.store.selectSignal(selectFeedbackLoading);
  readonly categories = this.store.selectSignal(selectCategories);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly statusFilter = signal('');
  readonly typeFilter = signal('');
  readonly categoryFilter = signal('');

  readonly statuses: FeedbackStatus[] = ['New', 'Acknowledged', 'UnderReview', 'Escalated', 'Resolved', 'Closed'];
  readonly types: FeedbackType[] = ['Complaint', 'Suggestion', 'Positive', 'Safeguarding', 'Query'];

  readonly typeTpl = viewChild<TemplateRef<unknown>>('typeTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly priorityTpl = viewChild<TemplateRef<unknown>>('priorityTpl');
  readonly slaTpl = viewChild<TemplateRef<unknown>>('slaTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'referenceNumber', label: 'Reference', sortable: true },
    { key: 'type', label: 'Type', template: this.typeTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'priority', label: 'Priority', template: this.priorityTpl() },
    { key: 'channel', label: 'Channel' },
    { key: 'responseCount', label: 'Responses' },
    { key: 'slaStatus', label: 'SLA', template: this.slaTpl() },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(FeedbackActions.loadCategories());
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.store.dispatch(
      FeedbackActions.loadFeedback({
        page: this.page(),
        pageSize: this.pageSize(),
        status: this.statusFilter() || undefined,
        type: this.typeFilter() || undefined,
        feedbackCategoryId: this.categoryFilter() || undefined,
      })
    );
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.loadFeedback();
  }

  onTypeFilter(value: string): void {
    this.typeFilter.set(value);
    this.page.set(1);
    this.loadFeedback();
  }

  onCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
    this.page.set(1);
    this.loadFeedback();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadFeedback();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/feedback', row.id]);
  }

  onSubmit(): void {
    this.router.navigate(['/feedback/submit']);
  }

  onDashboard(): void {
    this.router.navigate(['/feedback/dashboard']);
  }
}
