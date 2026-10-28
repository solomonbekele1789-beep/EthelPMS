import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { planningReducer, PLANNING_FEATURE_KEY } from './store/plan.reducer';
import { PlanEffects } from './store/plan.effects';

export const planningRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(PLANNING_FEATURE_KEY, planningReducer),
      provideEffects([PlanEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/plan-list/plan-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/plan-create/plan-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'planning.annual.create' },
      },
      {
        path: 'hierarchy',
        loadComponent: () => import('./pages/plan-hierarchy/plan-hierarchy.component'),
      },
      {
        path: 'config',
        loadComponent: () => import('./pages/planning-config/planning-config.component'),
        canActivate: [permissionGuard],
        data: { permission: 'planning.annual.update' },
      },
      {
        path: 'dip/:activityId',
        loadComponent: () => import('./pages/dip-list/dip-list.component'),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/plan-detail/plan-detail.component'),
      },
    ],
  },
];
