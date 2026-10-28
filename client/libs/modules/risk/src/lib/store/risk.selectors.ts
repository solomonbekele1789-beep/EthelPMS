import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RiskState, RISK_FEATURE_KEY } from './risk.reducer';

export const selectRiskState = createFeatureSelector<RiskState>(RISK_FEATURE_KEY);
export const selectCategories = createSelector(selectRiskState, (state) => state.categories);
export const selectRisks = createSelector(selectRiskState, (state) => state.risks);
export const selectRisksTotalCount = createSelector(selectRiskState, (state) => state.risksTotalCount);
export const selectSelectedRisk = createSelector(selectRiskState, (state) => state.selectedRisk);
export const selectMatrixItems = createSelector(selectRiskState, (state) => state.matrixItems);
export const selectRiskLoading = createSelector(selectRiskState, (state) => state.loading);
export const selectRiskError = createSelector(selectRiskState, (state) => state.error);
