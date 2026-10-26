import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { ASSETS_FEATURE_KEY, assetsReducer } from './store/assets.reducer';
import { AssetsEffects } from './store/assets.effects';

export const assetRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(ASSETS_FEATURE_KEY, assetsReducer),
      provideEffects([AssetsEffects])
    ],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () => import('./pages/asset-list/asset-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.register.read' }
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/asset-register/asset-register.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.register.create' }
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/category-list/category-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.categories.read' }
      },
      {
        path: 'disposals',
        loadComponent: () => import('./pages/disposal-list/disposal-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.disposals.read' }
      },
      {
        path: 'maintenance',
        loadComponent: () => import('./pages/maintenance-list/maintenance-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.maintenance.read' }
      },
      {
        path: 'stock',
        loadComponent: () => import('./pages/stock-list/stock-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.stock.read' }
      },
      {
        path: 'stock/create',
        loadComponent: () => import('./pages/stock-create/stock-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.stock.create' }
      },
      {
        path: 'stock/:id',
        loadComponent: () => import('./pages/stock-detail/stock-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.stock.read' }
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/asset-detail/asset-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'assets.register.read' }
      }
    ]
  }
];
