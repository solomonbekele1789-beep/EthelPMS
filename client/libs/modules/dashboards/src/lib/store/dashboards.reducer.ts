import { createReducer, on } from '@ngrx/store';
import { DashboardConfigDto, DashboardSummaryDto } from '../models/dashboard.model';
import { DashboardWidgetDto } from '../models/widget.model';
import { SavedFilterDto } from '../models/saved-filter.model';
import { DashboardActions } from './dashboards.actions';

export const DASHBOARDS_FEATURE_KEY = 'dashboards';

export interface DashboardsState {
  dashboards: DashboardSummaryDto[];
  selectedDashboard: DashboardConfigDto | null;
  widgets: DashboardWidgetDto[];
  savedFilters: SavedFilterDto[];
  loading: boolean;
  error: string | null;
}

export const initialDashboardsState: DashboardsState = {
  dashboards: [],
  selectedDashboard: null,
  widgets: [],
  savedFilters: [],
  loading: false,
  error: null,
};

export const dashboardsReducer = createReducer(
  initialDashboardsState,

  // Load Dashboards
  on(DashboardActions.loadDashboards, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DashboardActions.loadDashboardsSuccess, (state, { dashboards }) => ({
    ...state,
    dashboards,
    loading: false,
  })),
  on(DashboardActions.loadDashboardsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Dashboard
  on(DashboardActions.loadDashboard, (state) => ({
    ...state,
    loading: true,
    selectedDashboard: null,
  })),
  on(DashboardActions.loadDashboardSuccess, (state, { dashboard }) => ({
    ...state,
    selectedDashboard: dashboard,
    loading: false,
  })),
  on(DashboardActions.loadDashboardFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create Dashboard
  on(DashboardActions.createDashboard, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.createDashboardSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(DashboardActions.createDashboardFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Dashboard
  on(DashboardActions.updateDashboard, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.updateDashboardSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(DashboardActions.updateDashboardFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Delete Dashboard
  on(DashboardActions.deleteDashboard, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.deleteDashboardSuccess, (state, { id }) => ({
    ...state,
    dashboards: state.dashboards.filter((d) => d.id !== id),
    loading: false,
    error: null,
  })),
  on(DashboardActions.deleteDashboardFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Widgets
  on(DashboardActions.loadWidgets, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.loadWidgetsSuccess, (state, { widgets }) => ({
    ...state,
    widgets,
    loading: false,
  })),
  on(DashboardActions.loadWidgetsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Add Widget
  on(DashboardActions.addWidget, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.addWidgetSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(DashboardActions.addWidgetFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Widget
  on(DashboardActions.updateWidget, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.updateWidgetSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(DashboardActions.updateWidgetFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Remove Widget
  on(DashboardActions.removeWidget, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.removeWidgetSuccess, (state, { widgetId }) => ({
    ...state,
    widgets: state.widgets.filter((w) => w.id !== widgetId),
    loading: false,
    error: null,
  })),
  on(DashboardActions.removeWidgetFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Filters
  on(DashboardActions.loadFilters, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.loadFiltersSuccess, (state, { filters }) => ({
    ...state,
    savedFilters: filters,
    loading: false,
  })),
  on(DashboardActions.loadFiltersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create Filter
  on(DashboardActions.createFilter, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.createFilterSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(DashboardActions.createFilterFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Delete Filter
  on(DashboardActions.deleteFilter, (state) => ({
    ...state,
    loading: true,
  })),
  on(DashboardActions.deleteFilterSuccess, (state, { id }) => ({
    ...state,
    savedFilters: state.savedFilters.filter((f) => f.id !== id),
    loading: false,
    error: null,
  })),
  on(DashboardActions.deleteFilterFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
