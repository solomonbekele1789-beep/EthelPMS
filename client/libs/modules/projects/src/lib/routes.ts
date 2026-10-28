import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { projectReducer, PROJECTS_FEATURE_KEY } from './store/project.reducer';
import { ProjectEffects } from './store/project.effects';

export const projectRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(PROJECTS_FEATURE_KEY, projectReducer),
      provideEffects([ProjectEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/project-list/project-list.component'),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/project-create/project-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'projects.projects.create' },
      },
      {
        path: 'intervention-areas',
        loadComponent: () => import('./pages/intervention-area-list/intervention-area-list.component'),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/project-detail/project-detail.component'),
      },
    ],
  },
];
