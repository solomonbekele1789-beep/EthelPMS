import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { reportsReducer, REPORTS_FEATURE_KEY } from './store/reports.reducer';
import { ReportsEffects } from './store/reports.effects';

export const reportRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(REPORTS_FEATURE_KEY, reportsReducer),
      provideEffects([ReportsEffects]),
    ],
    children: [
      {
        path: '',
        redirectTo: 'templates',
        pathMatch: 'full',
      },
      {
        path: 'templates',
        loadComponent: () => import('./pages/template-list/template-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'reports.templates.read' },
      },
      {
        path: 'templates/create',
        loadComponent: () => import('./pages/template-create/template-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'reports.templates.create' },
      },
      {
        path: 'templates/:id',
        loadComponent: () => import('./pages/template-detail/template-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'reports.templates.read' },
      },
      {
        path: 'schedules',
        loadComponent: () => import('./pages/schedule-list/schedule-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'reports.schedules.read' },
      },
      {
        path: 'generated',
        loadComponent: () => import('./pages/generated-list/generated-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'reports.generated.read' },
      },
    ],
  },
];
