import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { userReducer, USERS_FEATURE_KEY } from './store/user.reducer';
import { UserEffects } from './store/user.effects';
import { roleReducer, ROLES_FEATURE_KEY } from './store/role.reducer';
import { RoleEffects } from './store/role.effects';
import { officeReducer, OFFICES_FEATURE_KEY } from './store/office.reducer';
import { OfficeEffects } from './store/office.effects';

export const userRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(USERS_FEATURE_KEY, userReducer),
      provideEffects([UserEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/user-list/user-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/user-create/user-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.users.create' },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/user-detail/user-detail.component'),
      },
    ],
  },
];

export const roleRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(ROLES_FEATURE_KEY, roleReducer),
      provideEffects([RoleEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/role-list/role-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/role-detail/role-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.roles.create' },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/role-detail/role-detail.component'),
      },
    ],
  },
];

export const officeRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(OFFICES_FEATURE_KEY, officeReducer),
      provideEffects([OfficeEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/office-list/office-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/office-detail/office-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.offices.create' },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/office-detail/office-detail.component'),
      },
    ],
  },
];

export const locationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/location-list/location-list.component'),
  },
];
