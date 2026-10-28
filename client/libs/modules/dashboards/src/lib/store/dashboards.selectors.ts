import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardsState, DASHBOARDS_FEATURE_KEY } from './dashboards.reducer';

export const selectDashboardsState = createFeatureSelector<DashboardsState>(DASHBOARDS_FEATURE_KEY);

export const selectDashboards = createSelector(selectDashboardsState, (state) => state.dashboards);

export const selectSelectedDashboard = createSelector(selectDashboardsState, (state) => state.selectedDashboard);

export const selectWidgets = createSelector(selectDashboardsState, (state) => state.widgets);

export const selectSavedFilters = createSelector(selectDashboardsState, (state) => state.savedFilters);

export const selectDashboardsLoading = createSelector(selectDashboardsState, (state) => state.loading);

export const selectDashboardsError = createSelector(selectDashboardsState, (state) => state.error);

export const selectDashboardCount = createSelector(selectDashboards, (dashboards) => dashboards.length);

export const selectWidgetCount = createSelector(selectWidgets, (widgets) => widgets.length);
