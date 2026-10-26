import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  NotificationService as UiNotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { NotificationsActions } from '../../store/notifications.actions';
import {
  selectNotifications,
  selectNotificationsTotalCount,
  selectUnreadCount,
  selectNotificationsLoading,
} from '../../store/notifications.selectors';
import { NotificationService } from '../../services/notification.service';
import { NotificationDto, NotificationStatus } from '../../models/notification.model';

@Component({
  selector: 'ethel-notification-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'notifications.notifications.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'notifications.notifications.update'" (click)="onMarkAllRead()">
        <mat-icon>done_all</mat-icon>
        {{ 'notifications.notifications.markAllRead' | translate }}
      </button>
    </app-page-header>

    @if (unreadCount() > 0) {
      <div class="unread-banner">
        <mat-icon>notifications_active</mat-icon>
        <span>{{ unreadCount() }} {{ 'notifications.notifications.unread' | translate }}</span>
      </div>
    }

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'notifications.notifications.statusFilter' | translate }}</mat-label>
          <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilter($event.value)">
            <mat-option value="">{{ 'common.all' | translate }}</mat-option>
            @for (status of statuses; track status) {
              <mat-option [value]="status">{{ status }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'notifications.notifications.eventTypeFilter' | translate }}</mat-label>
          <input matInput [value]="eventTypeFilter()" (input)="onEventTypeInput($event)" />
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="notifications()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No notifications"
        emptyMessage="You have no notifications."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #priorityTpl let-row>
      <span class="chip" [class]="'chip-priority-' + row.priority.toLowerCase()">{{ row.priority }}</span>
    </ng-template>

    <ng-template #statusTpl let-row>
      <span class="chip" [class]="'chip-status-' + row.status.toLowerCase()">{{ row.status }}</span>
    </ng-template>

    <ng-template #channelTpl let-row>
      <span class="chip chip-channel">{{ row.channel }}</span>
    </ng-template>

    <ng-template #bodyTpl let-row>
      <span class="body-text">{{ row.body?.length > 80 ? row.body.substring(0, 80) + '...' : row.body }}</span>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'medium' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .filter-row mat-form-field { min-width: 180px; }
    .unread-banner {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem;
      background: var(--primary-50, #e3f2fd); border-radius: 8px; margin-bottom: 1rem;
      color: var(--primary-700, #1565c0); font-weight: 500;
    }
    .chip {
      display: inline-block; padding: 0.25rem 0.75rem; border-radius: 16px;
      font-size: 0.75rem; font-weight: 500; line-height: 1.2;
    }
    .chip-priority-low { background: #e0e0e0; color: #616161; }
    .chip-priority-normal { background: #bbdefb; color: #1565c0; }
    .chip-priority-high { background: #ffe0b2; color: #e65100; }
    .chip-priority-urgent { background: #ffcdd2; color: #c62828; }
    .chip-status-pending { background: #e0e0e0; color: #616161; }
    .chip-status-sent { background: #bbdefb; color: #1565c0; }
    .chip-status-read { background: #c8e6c9; color: #2e7d32; }
    .chip-status-failed { background: #ffcdd2; color: #c62828; }
    .chip-status-archived { background: #e0e0e0; color: #616161; }
    .chip-channel { background: #e1bee7; color: #6a1b9a; }
    .body-text { display: block; max-width: 250px; }
  `,
})
export default class NotificationListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly uiNotification = inject(UiNotificationService);

  readonly notifications = this.store.selectSignal(selectNotifications);
  readonly totalCount = this.store.selectSignal(selectNotificationsTotalCount);
  readonly unreadCount = this.store.selectSignal(selectUnreadCount);
  readonly loading = this.store.selectSignal(selectNotificationsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly statusFilter = signal<string>('');
  readonly eventTypeFilter = signal<string>('');

  readonly statuses: NotificationStatus[] = ['Pending', 'Sent', 'Read', 'Failed', 'Archived'];

  readonly priorityTpl = viewChild<TemplateRef<unknown>>('priorityTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly channelTpl = viewChild<TemplateRef<unknown>>('channelTpl');
  readonly bodyTpl = viewChild<TemplateRef<unknown>>('bodyTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'body', label: 'Body', template: this.bodyTpl() },
    { key: 'priority', label: 'Priority', template: this.priorityTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'channel', label: 'Channel', template: this.channelTpl() },
    { key: 'eventType', label: 'Event Type' },
    { key: 'createdAt', label: 'Created', sortable: true, template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadNotifications();
    this.store.dispatch(NotificationsActions.loadUnreadCount());
  }

  loadNotifications(): void {
    this.store.dispatch(
      NotificationsActions.loadNotifications({
        page: this.page(),
        pageSize: this.pageSize(),
        status: this.statusFilter() || undefined,
        eventType: this.eventTypeFilter() || undefined,
      })
    );
  }

  onStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadNotifications();
  }

  onEventTypeInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.eventTypeFilter.set(value);
    this.page.set(1);
    this.loadNotifications();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadNotifications();
  }

  onRowClick(row: NotificationDto): void {
    if (row.status !== 'Read') {
      this.notificationService.markRead(row.id).subscribe(() => {
        this.store.dispatch(NotificationsActions.loadUnreadCount());
        this.loadNotifications();
      });
    }
    if (row.actionUrl) {
      this.router.navigateByUrl(row.actionUrl);
    }
  }

  onMarkAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: (result) => {
        this.uiNotification.success(`Marked ${result.markedRead} notifications as read`);
        this.store.dispatch(NotificationsActions.loadUnreadCount());
        this.loadNotifications();
      },
      error: () => {
        this.uiNotification.error('Failed to mark notifications as read');
      },
    });
  }
}
