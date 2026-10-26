import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { IMPORT_EXPORT_FEATURE_KEY, importExportReducer } from './store/import-export.reducer';
import { ImportExportEffects } from './store/import-export.effects';

export const importExportRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(IMPORT_EXPORT_FEATURE_KEY, importExportReducer),
      provideEffects([ImportExportEffects]),
    ],
    children: [
      {
        path: '',
        redirectTo: 'templates',
        pathMatch: 'full',
      },
      {
        path: 'templates',
        loadComponent: () => import('./pages/import-template-list/import-template-list.component'),
        data: { permission: 'importexport.templates.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'templates/create',
        loadComponent: () => import('./pages/import-template-create/import-template-create.component'),
        data: { permission: 'importexport.templates.create' },
        canActivate: [permissionGuard],
      },
      {
        path: 'imports',
        loadComponent: () => import('./pages/import-job-list/import-job-list.component'),
        data: { permission: 'importexport.import.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'imports/:id',
        loadComponent: () => import('./pages/import-job-detail/import-job-detail.component'),
        data: { permission: 'importexport.import.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'exports',
        loadComponent: () => import('./pages/export-job-list/export-job-list.component'),
        data: { permission: 'importexport.export.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'data-sync',
        loadComponent: () => import('./pages/data-sync-list/data-sync-list.component'),
        data: { permission: 'importexport.sync.read' },
        canActivate: [permissionGuard],
      },
    ],
  },
];
