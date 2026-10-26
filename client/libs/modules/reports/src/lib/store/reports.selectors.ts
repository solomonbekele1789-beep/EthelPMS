import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReportsState, REPORTS_FEATURE_KEY } from './reports.reducer';

export const selectReportsState = createFeatureSelector<ReportsState>(REPORTS_FEATURE_KEY);

export const selectTemplates = createSelector(selectReportsState, (state) => state.templates);

export const selectSelectedTemplate = createSelector(selectReportsState, (state) => state.selectedTemplate);

export const selectSchedules = createSelector(selectReportsState, (state) => state.schedules);

export const selectGeneratedReports = createSelector(selectReportsState, (state) => state.generatedReports);

export const selectSelectedReport = createSelector(selectReportsState, (state) => state.selectedReport);

export const selectReportsLoading = createSelector(selectReportsState, (state) => state.loading);

export const selectReportsError = createSelector(selectReportsState, (state) => state.error);
