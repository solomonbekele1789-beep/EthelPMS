import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ImportTemplateDto, CreateImportTemplateRequest, UpdateImportTemplateRequest } from '../models/import-template.model';
import { ImportJobDto, ImportJobListDto, StartImportRequest } from '../models/import-job.model';
import { ExportJobDto, StartExportRequest } from '../models/export-job.model';
import { DataSyncConfigDto, CreateDataSyncRequest, UpdateDataSyncRequest } from '../models/data-sync.model';

export const ImportExportActions = createActionGroup({
  source: 'ImportExport',
  events: {
    // --- Import Templates ---
    'Load Templates': props<{ module?: string }>(),
    'Load Templates Success': props<{ templates: ImportTemplateDto[] }>(),
    'Load Templates Failure': props<{ error: string }>(),
    'Load Template': props<{ id: string }>(),
    'Load Template Success': props<{ template: ImportTemplateDto }>(),
    'Load Template Failure': props<{ error: string }>(),
    'Create Template': props<{ request: CreateImportTemplateRequest }>(),
    'Create Template Success': props<{ id: string }>(),
    'Create Template Failure': props<{ error: string }>(),
    'Update Template': props<{ id: string; request: UpdateImportTemplateRequest }>(),
    'Update Template Success': emptyProps(),
    'Update Template Failure': props<{ error: string }>(),
    'Delete Template': props<{ id: string }>(),
    'Delete Template Success': props<{ id: string }>(),
    'Delete Template Failure': props<{ error: string }>(),

    // --- Import Jobs ---
    'Load Import Jobs': props<{ module?: string; status?: string }>(),
    'Load Import Jobs Success': props<{ jobs: ImportJobListDto[] }>(),
    'Load Import Jobs Failure': props<{ error: string }>(),
    'Load Import Job': props<{ id: string }>(),
    'Load Import Job Success': props<{ job: ImportJobDto }>(),
    'Load Import Job Failure': props<{ error: string }>(),
    'Start Import': props<{ request: StartImportRequest }>(),
    'Start Import Success': props<{ id: string }>(),
    'Start Import Failure': props<{ error: string }>(),
    'Cancel Import': props<{ id: string }>(),
    'Cancel Import Success': props<{ id: string }>(),
    'Cancel Import Failure': props<{ error: string }>(),

    // --- Export Jobs ---
    'Load Export Jobs': props<{ module?: string }>(),
    'Load Export Jobs Success': props<{ jobs: ExportJobDto[] }>(),
    'Load Export Jobs Failure': props<{ error: string }>(),
    'Start Export': props<{ request: StartExportRequest }>(),
    'Start Export Success': props<{ id: string }>(),
    'Start Export Failure': props<{ error: string }>(),

    // --- Data Sync ---
    'Load Sync Configs': emptyProps(),
    'Load Sync Configs Success': props<{ configs: DataSyncConfigDto[] }>(),
    'Load Sync Configs Failure': props<{ error: string }>(),
    'Create Sync Config': props<{ request: CreateDataSyncRequest }>(),
    'Create Sync Config Success': props<{ id: string }>(),
    'Create Sync Config Failure': props<{ error: string }>(),
    'Update Sync Config': props<{ id: string; request: UpdateDataSyncRequest }>(),
    'Update Sync Config Success': emptyProps(),
    'Update Sync Config Failure': props<{ error: string }>(),
    'Delete Sync Config': props<{ id: string }>(),
    'Delete Sync Config Success': props<{ id: string }>(),
    'Delete Sync Config Failure': props<{ error: string }>(),
    'Trigger Sync': props<{ id: string }>(),
    'Trigger Sync Success': props<{ id: string }>(),
    'Trigger Sync Failure': props<{ error: string }>(),
  },
});
