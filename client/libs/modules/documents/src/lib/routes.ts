import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { DOCUMENTS_FEATURE_KEY, documentsReducer } from './store/documents.reducer';
import { DocumentsEffects } from './store/documents.effects';

export const documentRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(DOCUMENTS_FEATURE_KEY, documentsReducer),
      provideEffects([DocumentsEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/document-list/document-list.component'),
        data: { permission: 'documents.documents.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'upload',
        loadComponent: () => import('./pages/document-upload/document-upload.component'),
        data: { permission: 'documents.documents.create' },
        canActivate: [permissionGuard],
      },
      {
        path: 'folders',
        loadComponent: () => import('./pages/folder-tree/folder-tree.component'),
        data: { permission: 'documents.folders.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'folders/create',
        loadComponent: () => import('./pages/folder-create/folder-create.component'),
        data: { permission: 'documents.folders.create' },
        canActivate: [permissionGuard],
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/document-detail/document-detail.component'),
        data: { permission: 'documents.documents.read' },
        canActivate: [permissionGuard],
      },
    ],
  },
];
