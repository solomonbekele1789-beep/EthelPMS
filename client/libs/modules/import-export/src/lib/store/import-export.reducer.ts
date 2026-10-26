import { createFeature, createReducer, on } from '@ngrx/store';
import { ImportTemplateDto } from '../models/import-template.model';
import { ImportJobDto, ImportJobListDto } from '../models/import-job.model';
import { ExportJobDto } from '../models/export-job.model';
import { DataSyncConfigDto } from '../models/data-sync.model';
import { ImportExportActions } from './import-export.actions';

export const IMPORT_EXPORT_FEATURE_KEY = 'importExport';

export interface ImportExportState {
  importTemplates: ImportTemplateDto[];
  selectedTemplate: ImportTemplateDto | null;
  importJobs: ImportJobListDto[];
  selectedJob: ImportJobDto | null;
  exportJobs: ExportJobDto[];
  dataSyncConfigs: DataSyncConfigDto[];
  loading: boolean;
  error: string | null;
}

const initialState: ImportExportState = {
  importTemplates: [],
  selectedTemplate: null,
  importJobs: [],
  selectedJob: null,
  exportJobs: [],
  dataSyncConfigs: [],
  loading: false,
  error: null,
};

export const importExportFeature = createFeature({
  name: IMPORT_EXPORT_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    // --- Import Templates ---
    on(ImportExportActions.loadTemplates, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.loadTemplatesSuccess, (state, { templates }) => ({
      ...state, importTemplates: templates, loading: false,
    })),
    on(ImportExportActions.loadTemplatesFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.loadTemplate, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.loadTemplateSuccess, (state, { template }) => ({
      ...state, selectedTemplate: template, loading: false,
    })),
    on(ImportExportActions.loadTemplateFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.createTemplate, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.createTemplateSuccess, (state) => ({ ...state, loading: false })),
    on(ImportExportActions.createTemplateFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.updateTemplate, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.updateTemplateSuccess, (state) => ({ ...state, loading: false })),
    on(ImportExportActions.updateTemplateFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.deleteTemplate, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.deleteTemplateSuccess, (state, { id }) => ({
      ...state, importTemplates: state.importTemplates.filter((t) => t.id !== id), loading: false,
    })),
    on(ImportExportActions.deleteTemplateFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Import Jobs ---
    on(ImportExportActions.loadImportJobs, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.loadImportJobsSuccess, (state, { jobs }) => ({
      ...state, importJobs: jobs, loading: false,
    })),
    on(ImportExportActions.loadImportJobsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.loadImportJob, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.loadImportJobSuccess, (state, { job }) => ({
      ...state, selectedJob: job, loading: false,
    })),
    on(ImportExportActions.loadImportJobFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.startImport, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.startImportSuccess, (state) => ({ ...state, loading: false })),
    on(ImportExportActions.startImportFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.cancelImport, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.cancelImportSuccess, (state, { id }) => ({
      ...state,
      importJobs: state.importJobs.map((j) =>
        j.id === id ? { ...j, status: 'Cancelled' as const } : j
      ),
      loading: false,
    })),
    on(ImportExportActions.cancelImportFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Export Jobs ---
    on(ImportExportActions.loadExportJobs, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.loadExportJobsSuccess, (state, { jobs }) => ({
      ...state, exportJobs: jobs, loading: false,
    })),
    on(ImportExportActions.loadExportJobsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.startExport, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.startExportSuccess, (state) => ({ ...state, loading: false })),
    on(ImportExportActions.startExportFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Data Sync ---
    on(ImportExportActions.loadSyncConfigs, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.loadSyncConfigsSuccess, (state, { configs }) => ({
      ...state, dataSyncConfigs: configs, loading: false,
    })),
    on(ImportExportActions.loadSyncConfigsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.createSyncConfig, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.createSyncConfigSuccess, (state) => ({ ...state, loading: false })),
    on(ImportExportActions.createSyncConfigFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.updateSyncConfig, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.updateSyncConfigSuccess, (state) => ({ ...state, loading: false })),
    on(ImportExportActions.updateSyncConfigFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.deleteSyncConfig, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.deleteSyncConfigSuccess, (state, { id }) => ({
      ...state, dataSyncConfigs: state.dataSyncConfigs.filter((c) => c.id !== id), loading: false,
    })),
    on(ImportExportActions.deleteSyncConfigFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ImportExportActions.triggerSync, (state) => ({ ...state, loading: true, error: null })),
    on(ImportExportActions.triggerSyncSuccess, (state) => ({ ...state, loading: false })),
    on(ImportExportActions.triggerSyncFailure, (state, { error }) => ({ ...state, error, loading: false })),
  ),
});

export const importExportReducer = importExportFeature.reducer;
