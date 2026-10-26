import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ImportTemplateService } from '../services/import-template.service';
import { ImportJobService } from '../services/import-job.service';
import { ExportJobService } from '../services/export-job.service';
import { DataSyncService } from '../services/data-sync.service';
import { ImportExportActions } from './import-export.actions';

@Injectable()
export class ImportExportEffects {
  private readonly actions$ = inject(Actions);
  private readonly templateService = inject(ImportTemplateService);
  private readonly importJobService = inject(ImportJobService);
  private readonly exportJobService = inject(ExportJobService);
  private readonly dataSyncService = inject(DataSyncService);

  // --- Import Templates ---

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.loadTemplates),
    switchMap(({ module }) =>
      this.templateService.list(module).pipe(
        map((templates) => ImportExportActions.loadTemplatesSuccess({ templates })),
        catchError((error) => of(ImportExportActions.loadTemplatesFailure({ error: error?.error?.detail ?? 'Failed to load templates' })))
      )
    )
  ));

  loadTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.loadTemplate),
    switchMap(({ id }) =>
      this.templateService.getById(id).pipe(
        map((template) => ImportExportActions.loadTemplateSuccess({ template })),
        catchError((error) => of(ImportExportActions.loadTemplateFailure({ error: error?.error?.detail ?? 'Failed to load template' })))
      )
    )
  ));

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.createTemplate),
    exhaustMap(({ request }) =>
      this.templateService.create(request).pipe(
        map((response) => ImportExportActions.createTemplateSuccess({ id: response.id })),
        catchError((error) => of(ImportExportActions.createTemplateFailure({ error: error?.error?.detail ?? 'Failed to create template' })))
      )
    )
  ));

  updateTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.updateTemplate),
    exhaustMap(({ id, request }) =>
      this.templateService.update(id, request).pipe(
        map(() => ImportExportActions.updateTemplateSuccess()),
        catchError((error) => of(ImportExportActions.updateTemplateFailure({ error: error?.error?.detail ?? 'Failed to update template' })))
      )
    )
  ));

  deleteTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.deleteTemplate),
    exhaustMap(({ id }) =>
      this.templateService.delete(id).pipe(
        map(() => ImportExportActions.deleteTemplateSuccess({ id })),
        catchError((error) => of(ImportExportActions.deleteTemplateFailure({ error: error?.error?.detail ?? 'Failed to delete template' })))
      )
    )
  ));

  // --- Import Jobs ---

  loadImportJobs$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.loadImportJobs),
    switchMap(({ module, status }) =>
      this.importJobService.list(module, status as any).pipe(
        map((jobs) => ImportExportActions.loadImportJobsSuccess({ jobs })),
        catchError((error) => of(ImportExportActions.loadImportJobsFailure({ error: error?.error?.detail ?? 'Failed to load import jobs' })))
      )
    )
  ));

  loadImportJob$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.loadImportJob),
    switchMap(({ id }) =>
      this.importJobService.getById(id).pipe(
        map((job) => ImportExportActions.loadImportJobSuccess({ job })),
        catchError((error) => of(ImportExportActions.loadImportJobFailure({ error: error?.error?.detail ?? 'Failed to load import job' })))
      )
    )
  ));

  startImport$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.startImport),
    exhaustMap(({ request }) =>
      this.importJobService.start(request).pipe(
        map((response) => ImportExportActions.startImportSuccess({ id: response.id })),
        catchError((error) => of(ImportExportActions.startImportFailure({ error: error?.error?.detail ?? 'Failed to start import' })))
      )
    )
  ));

  cancelImport$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.cancelImport),
    exhaustMap(({ id }) =>
      this.importJobService.cancel(id).pipe(
        map(() => ImportExportActions.cancelImportSuccess({ id })),
        catchError((error) => of(ImportExportActions.cancelImportFailure({ error: error?.error?.detail ?? 'Failed to cancel import' })))
      )
    )
  ));

  // --- Export Jobs ---

  loadExportJobs$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.loadExportJobs),
    switchMap(({ module }) =>
      this.exportJobService.list(module).pipe(
        map((jobs) => ImportExportActions.loadExportJobsSuccess({ jobs })),
        catchError((error) => of(ImportExportActions.loadExportJobsFailure({ error: error?.error?.detail ?? 'Failed to load export jobs' })))
      )
    )
  ));

  startExport$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.startExport),
    exhaustMap(({ request }) =>
      this.exportJobService.start(request).pipe(
        map((response) => ImportExportActions.startExportSuccess({ id: response.id })),
        catchError((error) => of(ImportExportActions.startExportFailure({ error: error?.error?.detail ?? 'Failed to start export' })))
      )
    )
  ));

  // --- Data Sync ---

  loadSyncConfigs$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.loadSyncConfigs),
    switchMap(() =>
      this.dataSyncService.list().pipe(
        map((configs) => ImportExportActions.loadSyncConfigsSuccess({ configs })),
        catchError((error) => of(ImportExportActions.loadSyncConfigsFailure({ error: error?.error?.detail ?? 'Failed to load sync configs' })))
      )
    )
  ));

  createSyncConfig$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.createSyncConfig),
    exhaustMap(({ request }) =>
      this.dataSyncService.create(request).pipe(
        map((response) => ImportExportActions.createSyncConfigSuccess({ id: response.id })),
        catchError((error) => of(ImportExportActions.createSyncConfigFailure({ error: error?.error?.detail ?? 'Failed to create sync config' })))
      )
    )
  ));

  updateSyncConfig$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.updateSyncConfig),
    exhaustMap(({ id, request }) =>
      this.dataSyncService.update(id, request).pipe(
        map(() => ImportExportActions.updateSyncConfigSuccess()),
        catchError((error) => of(ImportExportActions.updateSyncConfigFailure({ error: error?.error?.detail ?? 'Failed to update sync config' })))
      )
    )
  ));

  deleteSyncConfig$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.deleteSyncConfig),
    exhaustMap(({ id }) =>
      this.dataSyncService.delete(id).pipe(
        map(() => ImportExportActions.deleteSyncConfigSuccess({ id })),
        catchError((error) => of(ImportExportActions.deleteSyncConfigFailure({ error: error?.error?.detail ?? 'Failed to delete sync config' })))
      )
    )
  ));

  triggerSync$ = createEffect(() => this.actions$.pipe(
    ofType(ImportExportActions.triggerSync),
    exhaustMap(({ id }) =>
      this.dataSyncService.trigger(id).pipe(
        map(() => ImportExportActions.triggerSyncSuccess({ id })),
        catchError((error) => of(ImportExportActions.triggerSyncFailure({ error: error?.error?.detail ?? 'Failed to trigger sync' })))
      )
    )
  ));
}
