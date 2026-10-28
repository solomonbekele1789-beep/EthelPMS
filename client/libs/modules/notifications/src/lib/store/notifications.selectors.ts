import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState, NOTIFICATIONS_FEATURE_KEY } from './notifications.reducer';

export const selectNotificationsState = createFeatureSelector<NotificationsState>(NOTIFICATIONS_FEATURE_KEY);

export const selectNotifications = createSelector(selectNotificationsState, (state) => state.notifications);
export const selectNotificationsTotalCount = createSelector(selectNotificationsState, (state) => state.notificationsTotalCount);
export const selectUnreadCount = createSelector(selectNotificationsState, (state) => state.unreadCount);
export const selectTemplates = createSelector(selectNotificationsState, (state) => state.templates);
export const selectTemplatesTotalCount = createSelector(selectNotificationsState, (state) => state.templatesTotalCount);
export const selectPreferences = createSelector(selectNotificationsState, (state) => state.preferences);
export const selectNotificationsLoading = createSelector(selectNotificationsState, (state) => state.loading);
export const selectNotificationsError = createSelector(selectNotificationsState, (state) => state.error);
