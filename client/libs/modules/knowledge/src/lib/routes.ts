import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { KNOWLEDGE_FEATURE_KEY, knowledgeReducer } from './store/knowledge.reducer';
import { KnowledgeEffects } from './store/knowledge.effects';

export const knowledgeRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(KNOWLEDGE_FEATURE_KEY, knowledgeReducer),
      provideEffects([KnowledgeEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/article-list/article-list.component'),
        data: { permission: 'knowledge.articles.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/category-list/category-list.component'),
        data: { permission: 'knowledge.categories.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/article-search/article-search.component'),
        data: { permission: 'knowledge.articles.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/article-create/article-create.component'),
        data: { permission: 'knowledge.articles.create' },
        canActivate: [permissionGuard],
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/article-detail/article-detail.component'),
        data: { permission: 'knowledge.articles.read' },
        canActivate: [permissionGuard],
      },
    ],
  },
];
