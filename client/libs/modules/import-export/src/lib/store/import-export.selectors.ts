import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ImportExportState, IMPORT_EXPORT_FEATURE_KEY } from './import-export.reducer';

export const selectImportExportState = createFeatureSelector<ImportExportState>(IMPORT_EXPORT_FEATURE_KEY);

export const selectImportTemplates = createSelector(selectImportExportState, (state) => state.importTemplates);
export const selectSelectedTemplate = createSelector(selectImportExportState, (state) => state.selectedTemplate);
export const selectImportJobs = createSelector(selectImportExportState, (state) => state.importJobs);
export const selectSelectedJob = createSelector(selectImportExportState, (state) => state.selectedJob);
export const selectExportJobs = createSelector(selectImportExportState, (state) => state.exportJobs);
export const selectDataSyncConfigs = createSelector(selectImportExportState, (state) => state.dataSyncConfigs);
export const selectImportExportLoading = createSelector(selectImportExportState, (state) => state.loading);
export const selectImportExportError = createSelector(selectImportExportState, (state) => state.error);

export const selectActiveImportJobs = createSelector(selectImportJobs, (jobs) =>
  jobs.filter((j) => j.status === 'Pending' || j.status === 'Validating' || j.status === 'Processing')
);

export const selectActiveSyncConfigs = createSelector(selectDataSyncConfigs, (configs) =>
  configs.filter((c) => c.isActive)
);
