import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { DONORS_FEATURE_KEY, donorsReducer } from './store/donors.reducer';
import { DonorsEffects } from './store/donors.effects';

export const donorRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(DONORS_FEATURE_KEY, donorsReducer),
      provideEffects([DonorsEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/donor-list/donor-list.component'),
        data: { permission: 'donors.donors.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/donor-create/donor-create.component'),
        data: { permission: 'donors.donors.create' },
        canActivate: [permissionGuard],
      },
      {
        path: 'grants',
        loadComponent: () => import('./pages/grant-list/grant-list.component'),
        data: { permission: 'donors.grants.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'grants/create',
        loadComponent: () => import('./pages/grant-create/grant-create.component'),
        data: { permission: 'donors.grants.create' },
        canActivate: [permissionGuard],
      },
      {
        path: 'grants/:id',
        loadComponent: () => import('./pages/grant-detail/grant-detail.component'),
        data: { permission: 'donors.grants.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'compliance',
        loadComponent: () => import('./pages/compliance-dashboard/compliance-dashboard.component'),
        data: { permission: 'donors.grants.read' },
        canActivate: [permissionGuard],
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/donor-detail/donor-detail.component'),
        data: { permission: 'donors.donors.read' },
        canActivate: [permissionGuard],
      },
    ],
  },
];
