import { createReducer, on } from '@ngrx/store';
import { PlanEntryDto, PlanEntryListItemDto, PlanHierarchyDto } from '../models/plan.model';
import { PlanningConfigurationDto } from '../models/planning-config.model';
import { PlanActions } from './plan.actions';

export const PLANNING_FEATURE_KEY = 'planning';

export interface PlanningState {
  plans: PlanEntryListItemDto[];
  totalCount: number;
  selectedPlan: PlanEntryDto | null;
  hierarchy: PlanHierarchyDto[];
  config: PlanningConfigurationDto | null;
  loading: boolean;
  error: string | null;
}

export const initialPlanningState: PlanningState = {
  plans: [],
  totalCount: 0,
  selectedPlan: null,
  hierarchy: [],
  config: null,
  loading: false,
  error: null,
};

export const planningReducer = createReducer(
  initialPlanningState,

  on(PlanActions.loadPlans, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PlanActions.loadPlansSuccess, (state, { plans, totalCount }) => ({
    ...state,
    plans,
    totalCount,
    loading: false,
  })),
  on(PlanActions.loadPlansFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.loadPlan, (state) => ({
    ...state,
    loading: true,
    selectedPlan: null,
  })),
  on(PlanActions.loadPlanSuccess, (state, { plan }) => ({
    ...state,
    selectedPlan: plan,
    loading: false,
  })),
  on(PlanActions.loadPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.loadHierarchy, (state) => ({
    ...state,
    loading: true,
    hierarchy: [],
  })),
  on(PlanActions.loadHierarchySuccess, (state, { hierarchy }) => ({
    ...state,
    hierarchy,
    loading: false,
  })),
  on(PlanActions.loadHierarchyFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.createPlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(PlanActions.createPlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PlanActions.createPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.updatePlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(PlanActions.updatePlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PlanActions.updatePlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.submitPlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(PlanActions.submitPlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PlanActions.submitPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.approvePlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(PlanActions.approvePlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PlanActions.approvePlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.rejectPlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(PlanActions.rejectPlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(PlanActions.rejectPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(PlanActions.loadConfig, (state) => ({
    ...state,
    loading: true,
  })),
  on(PlanActions.loadConfigSuccess, (state, { config }) => ({
    ...state,
    config,
    loading: false,
  })),
  on(PlanActions.loadConfigFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
