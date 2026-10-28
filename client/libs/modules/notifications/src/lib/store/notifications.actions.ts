import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { NotificationDto } from '../models/notification.model';
import { NotificationTemplateDto, CreateNotificationTemplateRequest } from '../models/notification-template.model';
import { UserNotificationPreferenceDto } from '../models/notification-preference.model';

export const NotificationsActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Load Notifications': props<{ page?: number; pageSize?: number; status?: string; eventType?: string }>(),
    'Load Notifications Success': props<{ notifications: NotificationDto[]; totalCount: number }>(),
    'Load Notifications Failure': props<{ error: string }>(),
    'Load Unread Count': emptyProps(),
    'Load Unread Count Success': props<{ count: number }>(),
    'Load Unread Count Failure': props<{ error: string }>(),
    'Load Templates': props<{ page?: number; pageSize?: number; isActive?: boolean }>(),
    'Load Templates Success': props<{ templates: NotificationTemplateDto[]; totalCount: number }>(),
    'Load Templates Failure': props<{ error: string }>(),
    'Create Template': props<{ request: CreateNotificationTemplateRequest }>(),
    'Create Template Success': props<{ id: string }>(),
    'Create Template Failure': props<{ error: string }>(),
    'Load Preferences': props<{ userId?: string }>(),
    'Load Preferences Success': props<{ preferences: UserNotificationPreferenceDto[] }>(),
    'Load Preferences Failure': props<{ error: string }>(),
  },
});
