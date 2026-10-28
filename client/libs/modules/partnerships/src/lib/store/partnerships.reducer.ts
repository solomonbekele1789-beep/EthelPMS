import { createReducer, on } from '@ngrx/store';
import { SubGranteeDto, SubGranteeListDto } from '../models/sub-grantee.model';
import { DisbursementDto } from '../models/disbursement.model';
import { PartnerReportDto, PartnerReportListDto } from '../models/partner-report.model';
import { PartnerComplianceDto } from '../models/compliance.model';
import { PartnershipDashboardDto } from '../models/partnership-dashboard.model';
import { PartnershipsActions } from './partnerships.actions';

export const PARTNERSHIPS_FEATURE_KEY = 'partnerships';

export interface PartnershipsState {
  subGrantees: SubGranteeListDto[];
  selectedSubGrantee: SubGranteeDto | null;
  disbursements: DisbursementDto[];
  reports: PartnerReportListDto[];
  selectedReport: PartnerReportDto | null;
  complianceChecks: PartnerComplianceDto[];
  dashboard: PartnershipDashboardDto | null;
  loading: boolean;
  error: string | null;
}

export const initialPartnershipsState: PartnershipsState = {
  subGrantees: [],
  selectedSubGrantee: null,
  disbursements: [],
  reports: [],
  selectedReport: null,
  complianceChecks: [],
  dashboard: null,
  loading: false,
  error: null,
};

export const partnershipsReducer = createReducer(
  initialPartnershipsState,

  // Sub-Grantees
  on(PartnershipsActions.loadSubGrantees, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PartnershipsActions.loadSubGranteesSuccess, (state, { subGrantees }) => ({
    ...state,
    subGrantees,
    loading: false,
  })),
  on(PartnershipsActions.loadSubGranteesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PartnershipsActions.loadSubGrantee, (state) => ({
    ...state,
    loading: true,
    selectedSubGrantee: null,
  })),
  on(PartnershipsActions.loadSubGranteeSuccess, (state, { subGrantee }) => ({
    ...state,
    selectedSubGrantee: subGrantee,
    loading: false,
  })),
  on(PartnershipsActions.loadSubGranteeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PartnershipsActions.registerSubGrantee, (state) => ({
    ...state,
    loading: true,
  })),
  on(PartnershipsActions.registerSubGranteeSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PartnershipsActions.registerSubGranteeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Disbursements
  on(PartnershipsActions.loadDisbursements, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PartnershipsActions.loadDisbursementsSuccess, (state, { disbursements }) => ({
    ...state,
    disbursements,
    loading: false,
  })),
  on(PartnershipsActions.loadDisbursementsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PartnershipsActions.createDisbursement, (state) => ({
    ...state,
    loading: true,
  })),
  on(PartnershipsActions.createDisbursementSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PartnershipsActions.createDisbursementFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Reports
  on(PartnershipsActions.loadReports, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PartnershipsActions.loadReportsSuccess, (state, { reports }) => ({
    ...state,
    reports,
    loading: false,
  })),
  on(PartnershipsActions.loadReportsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PartnershipsActions.loadReport, (state) => ({
    ...state,
    loading: true,
    selectedReport: null,
  })),
  on(PartnershipsActions.loadReportSuccess, (state, { report }) => ({
    ...state,
    selectedReport: report,
    loading: false,
  })),
  on(PartnershipsActions.loadReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PartnershipsActions.createReport, (state) => ({
    ...state,
    loading: true,
  })),
  on(PartnershipsActions.createReportSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PartnershipsActions.createReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Compliance
  on(PartnershipsActions.loadComplianceChecks, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PartnershipsActions.loadComplianceChecksSuccess, (state, { complianceChecks }) => ({
    ...state,
    complianceChecks,
    loading: false,
  })),
  on(PartnershipsActions.loadComplianceChecksFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PartnershipsActions.createComplianceCheck, (state) => ({
    ...state,
    loading: true,
  })),
  on(PartnershipsActions.createComplianceCheckSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PartnershipsActions.createComplianceCheckFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Dashboard
  on(PartnershipsActions.loadDashboard, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PartnershipsActions.loadDashboardSuccess, (state, { dashboard }) => ({
    ...state,
    dashboard,
    loading: false,
  })),
  on(PartnershipsActions.loadDashboardFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
