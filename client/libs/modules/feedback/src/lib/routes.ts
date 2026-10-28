import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { FEEDBACK_FEATURE_KEY, feedbackReducer } from './store/feedback.reducer';
import { FeedbackEffects } from './store/feedback.effects';

export const feedbackRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(FEEDBACK_FEATURE_KEY, feedbackReducer),
      provideEffects([FeedbackEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/feedback-list/feedback-list.component'),
        data: { permission: 'feedback.items.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'submit',
        loadComponent: () => import('./pages/feedback-submit/feedback-submit.component'),
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/category-list/category-list.component'),
        data: { permission: 'feedback.categories.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/feedback-dashboard/feedback-dashboard.component'),
        data: { permission: 'feedback.dashboard.read' },
        canActivate: [permissionGuard],
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/feedback-detail/feedback-detail.component'),
        data: { permission: 'feedback.items.read' },
        canActivate: [permissionGuard],
      },
    ],
  },
];
