import { createReducer, on } from '@ngrx/store';
import { ReportTemplateDto } from '../models/report-template.model';
import { ReportScheduleDto } from '../models/report-schedule.model';
import { GeneratedReportDto } from '../models/generated-report.model';
import { ReportsActions } from './reports.actions';

export const REPORTS_FEATURE_KEY = 'reports';

export interface ReportsState {
  templates: ReportTemplateDto[];
  selectedTemplate: ReportTemplateDto | null;
  schedules: ReportScheduleDto[];
  generatedReports: GeneratedReportDto[];
  selectedReport: GeneratedReportDto | null;
  loading: boolean;
  error: string | null;
}

export const initialReportsState: ReportsState = {
  templates: [],
  selectedTemplate: null,
  schedules: [],
  generatedReports: [],
  selectedReport: null,
  loading: false,
  error: null,
};

export const reportsReducer = createReducer(
  initialReportsState,

  // Templates
  on(ReportsActions.loadTemplates, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportsActions.loadTemplatesSuccess, (state, { templates }) => ({
    ...state,
    templates,
    loading: false,
  })),
  on(ReportsActions.loadTemplatesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.loadTemplate, (state) => ({
    ...state,
    loading: true,
    selectedTemplate: null,
  })),
  on(ReportsActions.loadTemplateSuccess, (state, { template }) => ({
    ...state,
    selectedTemplate: template,
    loading: false,
  })),
  on(ReportsActions.loadTemplateFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.createTemplate, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.createTemplateSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportsActions.createTemplateFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.updateTemplate, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.updateTemplateSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportsActions.updateTemplateFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.deleteTemplate, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.deleteTemplateSuccess, (state, { id }) => ({
    ...state,
    templates: state.templates.filter((t) => t.id !== id),
    loading: false,
    error: null,
  })),
  on(ReportsActions.deleteTemplateFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Schedules
  on(ReportsActions.loadSchedules, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportsActions.loadSchedulesSuccess, (state, { schedules }) => ({
    ...state,
    schedules,
    loading: false,
  })),
  on(ReportsActions.loadSchedulesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.createSchedule, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.createScheduleSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportsActions.createScheduleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.updateSchedule, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.updateScheduleSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportsActions.updateScheduleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.deleteSchedule, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.deleteScheduleSuccess, (state, { id }) => ({
    ...state,
    schedules: state.schedules.filter((s) => s.id !== id),
    loading: false,
    error: null,
  })),
  on(ReportsActions.deleteScheduleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Generated Reports
  on(ReportsActions.loadGeneratedReports, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportsActions.loadGeneratedReportsSuccess, (state, { reports }) => ({
    ...state,
    generatedReports: reports,
    loading: false,
  })),
  on(ReportsActions.loadGeneratedReportsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.loadGeneratedReport, (state) => ({
    ...state,
    loading: true,
    selectedReport: null,
  })),
  on(ReportsActions.loadGeneratedReportSuccess, (state, { report }) => ({
    ...state,
    selectedReport: report,
    loading: false,
  })),
  on(ReportsActions.loadGeneratedReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.generateReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.generateReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportsActions.generateReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ReportsActions.shareReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(ReportsActions.shareReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ReportsActions.shareReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
