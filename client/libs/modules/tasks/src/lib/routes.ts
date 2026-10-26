import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { TASKS_FEATURE_KEY, tasksReducer } from './store/tasks.reducer';
import { TasksEffects } from './store/tasks.effects';

export const taskRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(TASKS_FEATURE_KEY, tasksReducer),
      provideEffects([TasksEffects])
    ],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () => import('./pages/task-list/task-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'tasks.tasks.read' }
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/task-create/task-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'tasks.tasks.create' }
      },
      {
        path: 'boards/create',
        loadComponent: () => import('./pages/board-create/board-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'tasks.boards.create' }
      },
      {
        path: 'boards/:id',
        loadComponent: () => import('./pages/board-detail/board-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'tasks.boards.read' }
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/task-detail/task-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'tasks.tasks.read' }
      }
    ]
  }
];
