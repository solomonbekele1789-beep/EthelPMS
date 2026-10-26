import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { settingsReducer, SETTINGS_FEATURE_KEY } from './store/settings.reducer';
import { SettingsEffects } from './store/settings.effects';

export const settingsRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(SETTINGS_FEATURE_KEY, settingsReducer),
      provideEffects([SettingsEffects]),
    ],
    children: [
      {
        path: '',
        redirectTo: 'system',
        pathMatch: 'full',
      },
      {
        path: 'system',
        loadComponent: () => import('./pages/system-settings/system-settings.component'),
        canActivate: [permissionGuard],
        data: { permission: 'settings.system.manage' },
      },
      {
        path: 'org',
        loadComponent: () => import('./pages/org-settings/org-settings.component'),
        canActivate: [permissionGuard],
        data: { permission: 'settings.org.manage' },
      },
      {
        path: 'approvals',
        loadComponent: () => import('./pages/approval-configs/approval-configs.component'),
        canActivate: [permissionGuard],
        data: { permission: 'settings.approvals.read' },
      },
      {
        path: 'alerts',
        loadComponent: () => import('./pages/alert-thresholds/alert-thresholds.component'),
        canActivate: [permissionGuard],
        data: { permission: 'settings.alerts.read' },
      },
    ],
  },
];
