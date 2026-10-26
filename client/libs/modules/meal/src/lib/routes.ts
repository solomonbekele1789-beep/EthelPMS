import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { mealReducer, MEAL_FEATURE_KEY } from './store/meal.reducer';
import { MealEffects } from './store/meal.effects';

export const mealRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(MEAL_FEATURE_KEY, mealReducer),
      provideEffects([MealEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/meal-plan-list/meal-plan-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/meal-plan-create/meal-plan-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'meal.plans.create' },
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./pages/evaluation-list/evaluation-list.component'),
      },
      {
        path: 'evaluations/create',
        loadComponent: () => import('./pages/evaluation-create/evaluation-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'meal.evaluations.create' },
      },
      {
        path: 'evaluations/:id',
        loadComponent: () => import('./pages/evaluation-detail/evaluation-detail.component'),
      },
      {
        path: 'gesi',
        loadComponent: () => import('./pages/gesi-list/gesi-list.component'),
      },
      {
        path: 'lessons',
        loadComponent: () => import('./pages/lesson-list/lesson-list.component'),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/meal-plan-detail/meal-plan-detail.component'),
      },
    ],
  },
];
