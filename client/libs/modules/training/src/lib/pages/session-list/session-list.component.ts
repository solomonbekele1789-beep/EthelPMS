import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { TrainingActions } from '../../store/training.actions';
import { selectSessions, selectSessionsTotalCount, selectTrainingLoading } from '../../store/training.selectors';
import { TrainingStatus } from '../../models/training-session.model';

@Component({
  selector: 'ethel-session-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'training.sessions.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'training.sessions.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'training.sessions.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'training.fields.programId' | translate }}</mat-label>
          <input matInput [value]="programIdFilter()" (keyup.enter)="onProgramIdSearch($event)" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'training.fields.fromDate' | translate }}</mat-label>
          <input matInput [matDatepicker]="fromPicker" [value]="fromDate()" (dateChange)="onFromDateChange($event)" />
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'training.fields.toDate' | translate }}</mat-label>
          <input matInput [matDatepicker]="toPicker" [value]="toDate()" (dateChange)="onToDateChange($event)" />
          <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>
      </div>

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
              (click)="onStatusFilter(status)">
              <app-status-badge [status]="status" [label]="status"></app-status-badge>
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="sessions()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No training sessions found"
        emptyMessage="Get started by creating your first training session."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #scheduledDateTpl let-row>
      {{ row.scheduledDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #endDateTpl let-row>
      {{ row.endDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #createdAtTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .filter-field { width: 220px; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class SessionListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly sessions = this.store.selectSignal(selectSessions);
  readonly totalCount = this.store.selectSignal(selectSessionsTotalCount);
  readonly loading = this.store.selectSignal(selectTrainingLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly programIdFilter = signal('');
  readonly statusFilter = signal<TrainingStatus | undefined>(undefined);
  readonly fromDate = signal<string | null>(null);
  readonly toDate = signal<string | null>(null);

  readonly statuses: TrainingStatus[] = ['Draft', 'Scheduled', 'InProgress', 'Completed', 'Cancelled'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly scheduledDateTpl = viewChild<TemplateRef<unknown>>('scheduledDateTpl');
  readonly endDateTpl = viewChild<TemplateRef<unknown>>('endDateTpl');
  readonly createdAtTpl = viewChild<TemplateRef<unknown>>('createdAtTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'venue', label: 'Venue' },
    { key: 'scheduledDate', label: 'Scheduled Date', sortable: true, template: this.scheduledDateTpl() },
    { key: 'endDate', label: 'End Date', template: this.endDateTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'maxParticipants', label: 'Max Participants' },
    { key: 'createdAt', label: 'Created', template: this.createdAtTpl() },
  ]);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.store.dispatch(
      TrainingActions.loadSessions({
        page: this.page(),
        pageSize: this.pageSize(),
        programId: this.programIdFilter() || undefined,
        status: this.statusFilter(),
        fromDate: this.fromDate() || undefined,
        toDate: this.toDate() || undefined,
      })
    );
  }

  onProgramIdSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.programIdFilter.set(value);
    this.page.set(1);
    this.loadSessions();
  }

  onStatusFilter(status: TrainingStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadSessions();
  }

  onFromDateChange(event: any): void {
    const date = event.value;
    this.fromDate.set(date ? new Date(date).toISOString().split('T')[0] : null);
    this.page.set(1);
    this.loadSessions();
  }

  onToDateChange(event: any): void {
    const date = event.value;
    this.toDate.set(date ? new Date(date).toISOString().split('T')[0] : null);
    this.page.set(1);
    this.loadSessions();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadSessions();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/training/sessions', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/training/sessions/create']);
  }
}
