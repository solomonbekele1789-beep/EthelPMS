import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { RISK_FEATURE_KEY, riskReducer } from './store/risk.reducer';
import { RiskEffects } from './store/risk.effects';

export const riskRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(RISK_FEATURE_KEY, riskReducer),
      provideEffects([RiskEffects]),
    ],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/risk-list/risk-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'risk.risks.read' }
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/risk-create/risk-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'risk.risks.create' }
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/category-list/category-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'risk.categories.read' }
      },
      {
        path: 'matrix',
        loadComponent: () => import('./pages/risk-matrix/risk-matrix.component'),
        canActivate: [permissionGuard],
        data: { permission: 'risk.risks.read' }
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/risk-detail/risk-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'risk.risks.read' }
      },
    ]
  }
];
