import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { participantsReducer, PARTICIPANTS_FEATURE_KEY } from './store/participants.reducer';
import { ParticipantsEffects } from './store/participants.effects';

export const participantRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(PARTICIPANTS_FEATURE_KEY, participantsReducer),
      provideEffects([ParticipantsEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/participant-list/participant-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/participant-create/participant-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'participants.profiles.create' },
      },
      {
        path: 'graduation/benchmarks',
        loadComponent: () => import('./pages/graduation-benchmarks/graduation-benchmarks.component'),
      },
      {
        path: 'graduation/pipeline',
        loadComponent: () => import('./pages/graduation-pipeline/graduation-pipeline.component'),
      },
      {
        path: 'graduation/decisions',
        loadComponent: () => import('./pages/graduation-decisions/graduation-decisions.component'),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/participant-detail/participant-detail.component'),
      },
    ],
  },
];
