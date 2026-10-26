import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PartnershipsState, PARTNERSHIPS_FEATURE_KEY } from './partnerships.reducer';

export const selectPartnershipsState = createFeatureSelector<PartnershipsState>(PARTNERSHIPS_FEATURE_KEY);
export const selectSubGrantees = createSelector(selectPartnershipsState, (state) => state.subGrantees);
export const selectSelectedSubGrantee = createSelector(selectPartnershipsState, (state) => state.selectedSubGrantee);
export const selectDisbursements = createSelector(selectPartnershipsState, (state) => state.disbursements);
export const selectReports = createSelector(selectPartnershipsState, (state) => state.reports);
export const selectSelectedReport = createSelector(selectPartnershipsState, (state) => state.selectedReport);
export const selectComplianceChecks = createSelector(selectPartnershipsState, (state) => state.complianceChecks);
export const selectDashboard = createSelector(selectPartnershipsState, (state) => state.dashboard);
export const selectPartnershipsLoading = createSelector(selectPartnershipsState, (state) => state.loading);
export const selectPartnershipsError = createSelector(selectPartnershipsState, (state) => state.error);
