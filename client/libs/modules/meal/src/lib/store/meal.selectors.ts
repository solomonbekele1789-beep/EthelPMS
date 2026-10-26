import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MealState, MEAL_FEATURE_KEY } from './meal.reducer';

export const selectMealState = createFeatureSelector<MealState>(MEAL_FEATURE_KEY);

export const selectMealPlans = createSelector(selectMealState, (state) => state.plans);

export const selectMealPlanTotalCount = createSelector(selectMealState, (state) => state.totalCount);

export const selectMealLoading = createSelector(selectMealState, (state) => state.loading);

export const selectMealError = createSelector(selectMealState, (state) => state.error);

export const selectSelectedMealPlan = createSelector(selectMealState, (state) => state.selectedPlan);

export const selectEvaluations = createSelector(selectMealState, (state) => state.evaluations);

export const selectSelectedEvaluation = createSelector(selectMealState, (state) => state.selectedEvaluation);

export const selectGesiAssessments = createSelector(selectMealState, (state) => state.gesiAssessments);

export const selectLessons = createSelector(selectMealState, (state) => state.lessons);
