import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { TRAINING_FEATURE_KEY, trainingReducer } from './store/training.reducer';
import { TrainingEffects } from './store/training.effects';

export const trainingRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(TRAINING_FEATURE_KEY, trainingReducer),
      provideEffects([TrainingEffects])
    ],
    children: [
      { path: '', redirectTo: 'programs', pathMatch: 'full' },
      {
        path: 'programs',
        loadComponent: () => import('./pages/program-list/program-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'training.programs.read' }
      },
      {
        path: 'programs/create',
        loadComponent: () => import('./pages/program-create/program-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'training.programs.create' }
      },
      {
        path: 'programs/:id',
        loadComponent: () => import('./pages/program-detail/program-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'training.programs.read' }
      },
      {
        path: 'sessions',
        loadComponent: () => import('./pages/session-list/session-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'training.sessions.read' }
      },
      {
        path: 'sessions/create',
        loadComponent: () => import('./pages/session-create/session-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'training.sessions.create' }
      },
      {
        path: 'sessions/:id',
        loadComponent: () => import('./pages/session-detail/session-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'training.sessions.read' }
      },
      {
        path: 'trainers',
        loadComponent: () => import('./pages/trainer-list/trainer-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'training.trainers.read' }
      }
    ]
  }
];
