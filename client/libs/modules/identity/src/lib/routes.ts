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
        canActivate: [permissionGuard],
        data: { permission: 'identity.users.read', breadcrumb: 'Users' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/user-create/user-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.users.create', breadcrumb: 'Create User' },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/user-detail/user-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.users.read', breadcrumb: 'User Details' },
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
        canActivate: [permissionGuard],
        data: { permission: 'identity.roles.read', breadcrumb: 'Roles' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/role-detail/role-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.roles.create', breadcrumb: 'Create Role' },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/role-detail/role-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.roles.read', breadcrumb: 'Role Details' },
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
        canActivate: [permissionGuard],
        data: { permission: 'identity.offices.read', breadcrumb: 'Offices' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/office-detail/office-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.offices.create', breadcrumb: 'Create Office' },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/office-detail/office-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'identity.offices.read', breadcrumb: 'Office Details' },
      },
    ],
  },
];

export const locationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/location-list/location-list.component'),
    canActivate: [permissionGuard],
    data: { permission: 'identity.locations.read', breadcrumb: 'Locations' },
  },
];
