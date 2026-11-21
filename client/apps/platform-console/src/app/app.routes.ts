import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authGuard } from '@ethelpms/shared/core';
import { superAdminGuard } from './guards/super-admin.guard';
import { TENANTS_FEATURE_KEY, tenantReducer } from './store/tenant.reducer';
import { TenantEffects } from './store/tenant.effects';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
  },
  {
    path: 'auth/login',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component'),
    canActivate: [authGuard, superAdminGuard],
    providers: [
      provideState(TENANTS_FEATURE_KEY, tenantReducer),
      provideEffects([TenantEffects]),
    ],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component'),
      },
      {
        path: 'tenants',
        loadComponent: () => import('./pages/tenant-list/tenant-list.component'),
      },
      {
        path: 'tenants/create',
        loadComponent: () => import('./pages/tenant-create/tenant-create.component'),
      },
      {
        path: 'tenants/:id',
        loadComponent: () => import('./pages/tenant-detail/tenant-detail.component'),
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./pages/package-list/package-list.component'),
      },
      {
        path: 'packages',
        redirectTo: 'subscriptions',
        pathMatch: 'full',
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
