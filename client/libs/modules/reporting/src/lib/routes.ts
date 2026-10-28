import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { reportingReducer, REPORTING_FEATURE_KEY } from './store/report.reducer';
import { ReportEffects } from './store/report.effects';

export const reportingRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(REPORTING_FEATURE_KEY, reportingReducer),
      provideEffects([ReportEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/report-list/report-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/report-create/report-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'reporting.reports.create' },
      },
      {
        path: 'templates',
        loadComponent: () => import('./pages/report-template-list/report-template-list.component'),
      },
      {
        path: 'templates/:id',
        loadComponent: () => import('./pages/report-template-detail/report-template-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'reporting.reports.update' },
      },
      {
        path: 'financial-summary',
        loadComponent: () => import('./pages/financial-summary/financial-summary.component'),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/report-detail/report-detail.component'),
      },
    ],
  },
];
