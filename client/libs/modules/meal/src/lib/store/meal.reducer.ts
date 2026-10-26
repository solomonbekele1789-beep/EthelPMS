import { createReducer, on } from '@ngrx/store';
import { MealPlanDto } from '../models/meal-plan.model';
import { EvaluationDto } from '../models/evaluation.model';
import { GesiAssessmentDto } from '../models/gesi.model';
import { LessonLearnedDto } from '../models/lesson.model';
import { MealActions } from './meal.actions';

export const MEAL_FEATURE_KEY = 'meal';

export interface MealState {
  plans: MealPlanDto[];
  totalCount: number;
  selectedPlan: MealPlanDto | null;
  evaluations: EvaluationDto[];
  selectedEvaluation: EvaluationDto | null;
  gesiAssessments: GesiAssessmentDto[];
  lessons: LessonLearnedDto[];
  loading: boolean;
  error: string | null;
}

export const initialMealState: MealState = {
  plans: [],
  totalCount: 0,
  selectedPlan: null,
  evaluations: [],
  selectedEvaluation: null,
  gesiAssessments: [],
  lessons: [],
  loading: false,
  error: null,
};

export const mealReducer = createReducer(
  initialMealState,

  // Load Plans
  on(MealActions.loadPlans, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(MealActions.loadPlansSuccess, (state, { plans, totalCount }) => ({
    ...state,
    plans,
    totalCount,
    loading: false,
  })),
  on(MealActions.loadPlansFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Plan
  on(MealActions.loadPlan, (state) => ({
    ...state,
    loading: true,
    selectedPlan: null,
  })),
  on(MealActions.loadPlanSuccess, (state, { plan }) => ({
    ...state,
    selectedPlan: plan,
    loading: false,
  })),
  on(MealActions.loadPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create Plan
  on(MealActions.createPlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.createPlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(MealActions.createPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Plan
  on(MealActions.updatePlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.updatePlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(MealActions.updatePlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Submit Plan
  on(MealActions.submitPlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.submitPlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(MealActions.submitPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Approve Plan
  on(MealActions.approvePlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.approvePlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(MealActions.approvePlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Reject Plan
  on(MealActions.rejectPlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.rejectPlanSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(MealActions.rejectPlanFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Evaluations
  on(MealActions.loadEvaluations, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.loadEvaluationsSuccess, (state, { evaluations }) => ({
    ...state,
    evaluations,
    loading: false,
  })),
  on(MealActions.loadEvaluationsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Evaluation
  on(MealActions.loadEvaluation, (state) => ({
    ...state,
    loading: true,
    selectedEvaluation: null,
  })),
  on(MealActions.loadEvaluationSuccess, (state, { evaluation }) => ({
    ...state,
    selectedEvaluation: evaluation,
    loading: false,
  })),
  on(MealActions.loadEvaluationFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create Evaluation
  on(MealActions.createEvaluation, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.createEvaluationSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(MealActions.createEvaluationFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // GESI
  on(MealActions.loadGesiAssessments, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.loadGesiAssessmentsSuccess, (state, { assessments }) => ({
    ...state,
    gesiAssessments: assessments,
    loading: false,
  })),
  on(MealActions.loadGesiAssessmentsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Lessons
  on(MealActions.loadLessons, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.loadLessonsSuccess, (state, { lessons }) => ({
    ...state,
    lessons,
    loading: false,
  })),
  on(MealActions.loadLessonsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(MealActions.createLesson, (state) => ({
    ...state,
    loading: true,
  })),
  on(MealActions.createLessonSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(MealActions.createLessonFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
