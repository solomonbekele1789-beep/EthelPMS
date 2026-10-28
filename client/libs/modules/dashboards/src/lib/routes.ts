import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { dashboardsReducer, DASHBOARDS_FEATURE_KEY } from './store/dashboards.reducer';
import { DashboardEffects } from './store/dashboards.effects';

export const dashboardRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(DASHBOARDS_FEATURE_KEY, dashboardsReducer),
      provideEffects([DashboardEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard-list/dashboard-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'dashboards.configs.read' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/dashboard-create/dashboard-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'dashboards.configs.create' },
      },
      {
        path: 'filters',
        loadComponent: () => import('./pages/filter-list/filter-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'dashboards.filters.read' },
      },
      {
        path: 'filters/create',
        loadComponent: () => import('./pages/filter-create/filter-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'dashboards.filters.create' },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/dashboard-detail/dashboard-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'dashboards.configs.read' },
      },
    ],
  },
];
