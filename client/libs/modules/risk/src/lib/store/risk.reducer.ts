import { createFeature, createReducer, on } from '@ngrx/store';
import { RiskCategoryDto } from '../models/risk-category.model';
import { RiskDto, RiskMatrixItemDto } from '../models/risk.model';
import { RiskActions } from './risk.actions';

export const RISK_FEATURE_KEY = 'risk';

export interface RiskState {
  categories: RiskCategoryDto[];
  risks: RiskDto[];
  risksTotalCount: number;
  selectedRisk: RiskDto | null;
  matrixItems: RiskMatrixItemDto[];
  loading: boolean;
  error: string | null;
}

export const initialRiskState: RiskState = {
  categories: [],
  risks: [],
  risksTotalCount: 0,
  selectedRisk: null,
  matrixItems: [],
  loading: false,
  error: null,
};

export const riskFeature = createFeature({
  name: RISK_FEATURE_KEY,
  reducer: createReducer(
    initialRiskState,

    // Categories
    on(RiskActions.loadCategories, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(RiskActions.loadCategoriesSuccess, (state, { categories }) => ({
      ...state,
      categories,
      loading: false,
    })),
    on(RiskActions.loadCategoriesFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Risks
    on(RiskActions.loadRisks, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(RiskActions.loadRisksSuccess, (state, { risks, totalCount }) => ({
      ...state,
      risks,
      risksTotalCount: totalCount,
      loading: false,
    })),
    on(RiskActions.loadRisksFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(RiskActions.loadRisk, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(RiskActions.loadRiskSuccess, (state, { risk }) => ({
      ...state,
      selectedRisk: risk,
      loading: false,
    })),
    on(RiskActions.loadRiskFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(RiskActions.createRisk, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(RiskActions.createRiskSuccess, (state) => ({
      ...state,
      loading: false,
    })),
    on(RiskActions.createRiskFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Matrix
    on(RiskActions.loadMatrix, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(RiskActions.loadMatrixSuccess, (state, { items }) => ({
      ...state,
      matrixItems: items,
      loading: false,
    })),
    on(RiskActions.loadMatrixFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
  ),
});

export const riskReducer = riskFeature.reducer;
