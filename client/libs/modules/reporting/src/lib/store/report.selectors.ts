import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReportingState, REPORTING_FEATURE_KEY } from './report.reducer';

export const selectReportingState = createFeatureSelector<ReportingState>(REPORTING_FEATURE_KEY);

export const selectReports = createSelector(selectReportingState, (state) => state.reports);

export const selectReportTotalCount = createSelector(selectReportingState, (state) => state.totalCount);

export const selectReportingLoading = createSelector(selectReportingState, (state) => state.loading);

export const selectReportingError = createSelector(selectReportingState, (state) => state.error);

export const selectSelectedReport = createSelector(selectReportingState, (state) => state.selectedReport);

export const selectApprovalHistory = createSelector(selectReportingState, (state) => state.approvalHistory);

export const selectFinancialSummary = createSelector(selectReportingState, (state) => state.financialSummary);

export const selectReportTemplates = createSelector(selectReportingState, (state) => state.templates);
