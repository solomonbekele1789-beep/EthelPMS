import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { partnershipsReducer, PARTNERSHIPS_FEATURE_KEY } from './store/partnerships.reducer';
import { PartnershipsEffects } from './store/partnerships.effects';

export const partnershipRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(PARTNERSHIPS_FEATURE_KEY, partnershipsReducer),
      provideEffects([PartnershipsEffects]),
    ],
    children: [
      {
        path: '',
        redirectTo: 'partners',
        pathMatch: 'full',
      },
      {
        path: 'partners',
        loadComponent: () => import('./pages/partner-list/partner-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.subgrantees.read' },
      },
      {
        path: 'partners/register',
        loadComponent: () => import('./pages/partner-register/partner-register.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.subgrantees.create' },
      },
      {
        path: 'partners/:id',
        loadComponent: () => import('./pages/partner-detail/partner-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.subgrantees.read' },
      },
      {
        path: 'disbursements',
        loadComponent: () => import('./pages/disbursement-list/disbursement-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.disbursements.read' },
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/report-list/report-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.reports.read' },
      },
      {
        path: 'reports/:id',
        loadComponent: () => import('./pages/report-detail/report-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.reports.read' },
      },
      {
        path: 'compliance',
        loadComponent: () => import('./pages/compliance-list/compliance-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.compliance.read' },
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/partnership-dashboard/partnership-dashboard.component'),
        canActivate: [permissionGuard],
        data: { permission: 'partnerships.dashboard.read' },
      },
    ],
  },
];
