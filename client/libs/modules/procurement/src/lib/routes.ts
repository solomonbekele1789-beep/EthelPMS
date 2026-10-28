import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { procurementReducer, PROCUREMENT_FEATURE_KEY } from './store/procurement.reducer';
import { ProcurementEffects } from './store/procurement.effects';

export const procurementRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(PROCUREMENT_FEATURE_KEY, procurementReducer),
      provideEffects([ProcurementEffects]),
    ],
    children: [
      {
        path: '',
        redirectTo: 'suppliers',
        pathMatch: 'full',
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./pages/supplier-list/supplier-list.component'),
      },
      {
        path: 'suppliers/create',
        loadComponent: () => import('./pages/supplier-create/supplier-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'procurement.suppliers.create' },
      },
      {
        path: 'suppliers/:id',
        loadComponent: () => import('./pages/supplier-detail/supplier-detail.component'),
      },
      {
        path: 'plans/:id',
        loadComponent: () => import('./pages/plan-detail/plan-detail.component'),
      },
      {
        path: 'requests',
        loadComponent: () => import('./pages/request-list/request-list.component'),
      },
      {
        path: 'requests/create',
        loadComponent: () => import('./pages/request-create/request-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'procurement.requests.create' },
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./pages/request-detail/request-detail.component'),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/order-list/order-list.component'),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./pages/order-detail/order-detail.component'),
      },
    ],
  },
];
