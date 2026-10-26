import { Routes } from '@angular/router';
import { authGuard } from '@ethelpms/shared/core';

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
    canActivate: [authGuard],
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
        path: 'packages',
        loadComponent: () => import('./pages/package-list/package-list.component'),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
