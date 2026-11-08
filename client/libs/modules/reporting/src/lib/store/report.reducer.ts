import { createReducer, on } from '@ngrx/store';
import { ReportDto, ReportListItemDto, ReportApprovalDto, FinancialSummaryDto } from '../models/report.model';
import { ReportTemplateDto } from '../models/report-template.model';
import { ReportActions } from './report.actions';

export const REPORTING_FEATURE_KEY = 'reporting';

export interface ReportingState {
  reports: ReportListItemDto[];
  totalCount: number;
  selectedReport: ReportDto | null;
  approvalHistory: ReportApprovalDto[];
  financialSummary: FinancialSummaryDto | null;
  templates: ReportTemplateDto[];
  loading: boolean;
  error: string | null;
}

export const initialReportingState: ReportingState = {
  reports: [],
  totalCount: 0,
  selectedReport: null,
  approvalHistory: [],
  financialSummary: null,
  templates: [],
  loading: false,
  error: null,
};

export const reportingReducer = createReducer(
  initialReportingState,

  // Load Reports
  on(ReportActions.loadReports, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportActions.loadReportsSuccess, (state, { reports, totalCount }) => ({
    ...state,
    reports,
    totalCount,
    loading: false,
  })),
  on(ReportActions.loadReportsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Report
  on(ReportActions.loadReport, (state) => ({
    ...state,
    loading: true,
    selectedReport: null,
  })),
  on(ReportActions.loadReportSuccess, (state, { report }) => ({
    ...state,
    selectedReport: report,
    loading: false,
  })),
  on(ReportActions.loadReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create Report
  on(ReportActions.createReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.createReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportActions.createReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Report
  on(ReportActions.updateReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.updateReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportActions.updateReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Submit Report
  on(ReportActions.submitReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.submitReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportActions.submitReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Approve Report
  on(ReportActions.approveReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.approveReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportActions.approveReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Reject Report
  on(ReportActions.rejectReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.rejectReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportActions.rejectReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Approval History
  on(ReportActions.loadApprovalHistory, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.loadApprovalHistorySuccess, (state, { approvals }) => ({
    ...state,
    approvalHistory: approvals,
    loading: false,
  })),
  on(ReportActions.loadApprovalHistoryFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Financial Summary
  on(ReportActions.loadFinancialSummary, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.loadFinancialSummarySuccess, (state, { summary }) => ({
    ...state,
    financialSummary: summary,
    loading: false,
  })),
  on(ReportActions.loadFinancialSummaryFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Templates
  on(ReportActions.loadTemplates, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.loadTemplatesSuccess, (state, { templates }) => ({
    ...state,
    templates,
    loading: false,
  })),
  on(ReportActions.loadTemplatesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportActions.loadTemplate, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.loadTemplateSuccess, (state, { template }) => {
    const existingIndex = state.templates.findIndex(t => t.id === template.id);
    const updated = existingIndex >= 0
      ? state.templates.map(t => t.id === template.id ? template : t)
      : [...state.templates, template];
    return {
      ...state,
      templates: updated,
      loading: false,
    };
  }),
  on(ReportActions.loadTemplateFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportActions.createTemplate, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.createTemplateSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportActions.createTemplateFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportActions.updateTemplate, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportActions.updateTemplateSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportActions.updateTemplateFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
