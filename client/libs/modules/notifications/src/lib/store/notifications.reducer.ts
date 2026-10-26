import { createFeature, createReducer, on } from '@ngrx/store';
import { NotificationDto } from '../models/notification.model';
import { NotificationTemplateDto } from '../models/notification-template.model';
import { UserNotificationPreferenceDto } from '../models/notification-preference.model';
import { NotificationsActions } from './notifications.actions';

export const NOTIFICATIONS_FEATURE_KEY = 'notifications';

export interface NotificationsState {
  notifications: NotificationDto[];
  notificationsTotalCount: number;
  unreadCount: number;
  templates: NotificationTemplateDto[];
  templatesTotalCount: number;
  preferences: UserNotificationPreferenceDto[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  notificationsTotalCount: 0,
  unreadCount: 0,
  templates: [],
  templatesTotalCount: 0,
  preferences: [],
  loading: false,
  error: null,
};

export const notificationsFeature = createFeature({
  name: NOTIFICATIONS_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    // --- Notifications list ---
    on(NotificationsActions.loadNotifications, (state) => ({ ...state, loading: true, error: null })),
    on(NotificationsActions.loadNotificationsSuccess, (state, { notifications, totalCount }) => ({
      ...state, notifications, notificationsTotalCount: totalCount, loading: false,
    })),
    on(NotificationsActions.loadNotificationsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Unread count ---
    on(NotificationsActions.loadUnreadCount, (state) => ({ ...state, loading: true, error: null })),
    on(NotificationsActions.loadUnreadCountSuccess, (state, { count }) => ({
      ...state, unreadCount: count, loading: false,
    })),
    on(NotificationsActions.loadUnreadCountFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Templates list ---
    on(NotificationsActions.loadTemplates, (state) => ({ ...state, loading: true, error: null })),
    on(NotificationsActions.loadTemplatesSuccess, (state, { templates, totalCount }) => ({
      ...state, templates, templatesTotalCount: totalCount, loading: false,
    })),
    on(NotificationsActions.loadTemplatesFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Create template ---
    on(NotificationsActions.createTemplate, (state) => ({ ...state, loading: true, error: null })),
    on(NotificationsActions.createTemplateSuccess, (state) => ({ ...state, loading: false })),
    on(NotificationsActions.createTemplateFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Preferences ---
    on(NotificationsActions.loadPreferences, (state) => ({ ...state, loading: true, error: null })),
    on(NotificationsActions.loadPreferencesSuccess, (state, { preferences }) => ({
      ...state, preferences, loading: false,
    })),
    on(NotificationsActions.loadPreferencesFailure, (state, { error }) => ({ ...state, error, loading: false })),
  ),
});

export const notificationsReducer = notificationsFeature.reducer;
