import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService as UiNotificationService,
} from '@ethelpms/shared/ui';
import { NotificationsActions } from '../../store/notifications.actions';
import { selectPreferences, selectNotificationsLoading } from '../../store/notifications.selectors';
import { NotificationPreferenceService } from '../../services/notification-preference.service';
import { UserNotificationPreferenceDto } from '../../models/notification-preference.model';

@Component({
  selector: 'ethel-preference-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlideToggleModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-page-header [title]="'notifications.preferences.title' | translate"></app-page-header>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (preferences().length === 0) {
      <app-empty-state
        title="No preferences"
        message="No notification preferences configured.">
      </app-empty-state>
    } @else {
      <div class="preferences-table">
        <div class="table-header">
          <span class="col-event">{{ 'notifications.preferences.eventType' | translate }}</span>
          <span class="col-toggle">{{ 'notifications.preferences.inApp' | translate }}</span>
          <span class="col-toggle">{{ 'notifications.preferences.email' | translate }}</span>
          <span class="col-toggle">{{ 'notifications.preferences.push' | translate }}</span>
          <span class="col-toggle">{{ 'notifications.preferences.sms' | translate }}</span>
        </div>
        @for (pref of preferences(); track pref.id) {
          <div class="table-row">
            <span class="col-event">{{ pref.eventType }}</span>
            <span class="col-toggle">
              <mat-slide-toggle
                [checked]="pref.inAppEnabled"
                (change)="onToggle(pref, 'inAppEnabled', $event.checked)">
              </mat-slide-toggle>
            </span>
            <span class="col-toggle">
              <mat-slide-toggle
                [checked]="pref.emailEnabled"
                (change)="onToggle(pref, 'emailEnabled', $event.checked)">
              </mat-slide-toggle>
            </span>
            <span class="col-toggle">
              <mat-slide-toggle
                [checked]="pref.pushEnabled"
                (change)="onToggle(pref, 'pushEnabled', $event.checked)">
              </mat-slide-toggle>
            </span>
            <span class="col-toggle">
              <mat-slide-toggle
                [checked]="pref.smsEnabled"
                (change)="onToggle(pref, 'smsEnabled', $event.checked)">
              </mat-slide-toggle>
            </span>
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .preferences-table { max-width: 800px; }
    .table-header, .table-row {
      display: grid;
      grid-template-columns: 1fr 100px 100px 100px 100px;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
    }
    .table-header {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      border-bottom: 2px solid var(--border-color, #e0e0e0);
    }
    .table-row {
      border-bottom: 1px solid var(--border-color, #f0f0f0);
    }
    .table-row:hover {
      background: var(--surface-hover, #f5f5f5);
    }
    .col-event { font-weight: 500; }
    .col-toggle { display: flex; justify-content: center; }
  `,
})
export default class PreferenceListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly prefService = inject(NotificationPreferenceService);
  private readonly uiNotification = inject(UiNotificationService);

  readonly preferences = this.store.selectSignal(selectPreferences);
  readonly loading = this.store.selectSignal(selectNotificationsLoading);

  ngOnInit(): void {
    this.store.dispatch(NotificationsActions.loadPreferences({}));
  }

  onToggle(pref: UserNotificationPreferenceDto, field: string, checked: boolean): void {
    const request = {
      eventType: pref.eventType,
      inAppEnabled: pref.inAppEnabled,
      emailEnabled: pref.emailEnabled,
      pushEnabled: pref.pushEnabled,
      smsEnabled: pref.smsEnabled,
      [field]: checked,
    };
    this.prefService.updatePreference(request).subscribe({
      next: () => {
        this.uiNotification.success('Preference updated');
        this.store.dispatch(NotificationsActions.loadPreferences({}));
      },
      error: () => {
        this.uiNotification.error('Failed to update preference');
      },
    });
  }
}
