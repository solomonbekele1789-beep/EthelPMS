import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { NOTIFICATIONS_FEATURE_KEY, notificationsReducer } from './store/notifications.reducer';
import { NotificationsEffects } from './store/notifications.effects';

export const notificationRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(NOTIFICATIONS_FEATURE_KEY, notificationsReducer),
      provideEffects([NotificationsEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/notification-list/notification-list.component'),
        data: { permission: 'notifications.notifications.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'templates',
        loadComponent: () => import('./pages/template-list/template-list.component'),
        data: { permission: 'notifications.templates.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'templates/create',
        loadComponent: () => import('./pages/template-create/template-create.component'),
        data: { permission: 'notifications.templates.create' },
        canActivate: [permissionGuard],
      },
      {
        path: 'preferences',
        loadComponent: () => import('./pages/preference-list/preference-list.component'),
        data: { permission: 'notifications.preferences.read' },
        canActivate: [permissionGuard],
      },
    ],
  },
];
