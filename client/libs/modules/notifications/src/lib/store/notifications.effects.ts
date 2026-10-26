import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { NotificationsActions } from './notifications.actions';

@Injectable()
export class NotificationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly notificationService = inject(NotificationService);
  private readonly notificationTemplateService = inject(NotificationTemplateService);
  private readonly notificationPreferenceService = inject(NotificationPreferenceService);

  loadNotifications$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.loadNotifications),
    switchMap(({ page, pageSize, status, eventType }) =>
      this.notificationService.listNotifications({ page, pageSize, status, eventType }).pipe(
        map((response) => NotificationsActions.loadNotificationsSuccess({ notifications: response.items, totalCount: response.totalCount })),
        catchError((error) => of(NotificationsActions.loadNotificationsFailure({ error: error?.error?.detail ?? 'Failed to load notifications' })))
      )
    )
  ));

  loadUnreadCount$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.loadUnreadCount),
    switchMap(() =>
      this.notificationService.getUnreadCount().pipe(
        map((response) => NotificationsActions.loadUnreadCountSuccess({ count: response.count })),
        catchError((error) => of(NotificationsActions.loadUnreadCountFailure({ error: error?.error?.detail ?? 'Failed to load unread count' })))
      )
    )
  ));

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.loadTemplates),
    switchMap(({ page, pageSize, isActive }) =>
      this.notificationTemplateService.listTemplates({ page, pageSize, isActive }).pipe(
        map((response) => NotificationsActions.loadTemplatesSuccess({ templates: response.items, totalCount: response.totalCount })),
        catchError((error) => of(NotificationsActions.loadTemplatesFailure({ error: error?.error?.detail ?? 'Failed to load templates' })))
      )
    )
  ));

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.createTemplate),
    exhaustMap(({ request }) =>
      this.notificationTemplateService.createTemplate(request).pipe(
        map((response) => NotificationsActions.createTemplateSuccess({ id: response.id })),
        catchError((error) => of(NotificationsActions.createTemplateFailure({ error: error?.error?.detail ?? 'Failed to create template' })))
      )
    )
  ));

  loadPreferences$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.loadPreferences),
    switchMap(({ userId }) =>
      this.notificationPreferenceService.getPreferences(userId).pipe(
        map((preferences) => NotificationsActions.loadPreferencesSuccess({ preferences })),
        catchError((error) => of(NotificationsActions.loadPreferencesFailure({ error: error?.error?.detail ?? 'Failed to load preferences' })))
      )
    )
  ));
}
