import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DonorsState, DONORS_FEATURE_KEY } from './donors.reducer';

export const selectDonorsState = createFeatureSelector<DonorsState>(DONORS_FEATURE_KEY);

export const selectDonors = createSelector(selectDonorsState, (state) => state.donors);
export const selectDonorsTotalCount = createSelector(selectDonorsState, (state) => state.donorsTotalCount);
export const selectSelectedDonor = createSelector(selectDonorsState, (state) => state.selectedDonor);
export const selectGrants = createSelector(selectDonorsState, (state) => state.grants);
export const selectGrantsTotalCount = createSelector(selectDonorsState, (state) => state.grantsTotalCount);
export const selectSelectedGrant = createSelector(selectDonorsState, (state) => state.selectedGrant);
export const selectComplianceDashboard = createSelector(selectDonorsState, (state) => state.complianceDashboard);
export const selectDonorsLoading = createSelector(selectDonorsState, (state) => state.loading);
export const selectDonorsError = createSelector(selectDonorsState, (state) => state.error);
