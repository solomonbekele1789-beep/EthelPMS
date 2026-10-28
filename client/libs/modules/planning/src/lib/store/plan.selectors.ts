import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlanningState, PLANNING_FEATURE_KEY } from './plan.reducer';

export const selectPlanningState = createFeatureSelector<PlanningState>(PLANNING_FEATURE_KEY);

export const selectPlans = createSelector(selectPlanningState, (state) => state.plans);

export const selectPlanTotalCount = createSelector(selectPlanningState, (state) => state.totalCount);

export const selectPlanningLoading = createSelector(selectPlanningState, (state) => state.loading);

export const selectPlanningError = createSelector(selectPlanningState, (state) => state.error);

export const selectSelectedPlan = createSelector(selectPlanningState, (state) => state.selectedPlan);

export const selectHierarchy = createSelector(selectPlanningState, (state) => state.hierarchy);

export const selectPlanningConfig = createSelector(selectPlanningState, (state) => state.config);
