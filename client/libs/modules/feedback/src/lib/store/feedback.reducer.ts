import { createFeature, createReducer, on } from '@ngrx/store';
import { FeedbackItemDto } from '../models/feedback.model';
import { FeedbackCategoryDto } from '../models/feedback-category.model';
import { FeedbackDashboardDto } from '../models/feedback-dashboard.model';
import { FeedbackActions } from './feedback.actions';

export const FEEDBACK_FEATURE_KEY = 'feedback';

export interface FeedbackState {
  feedbackItems: FeedbackItemDto[];
  feedbackTotalCount: number;
  selectedItem: FeedbackItemDto | null;
  categories: FeedbackCategoryDto[];
  dashboard: FeedbackDashboardDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  feedbackItems: [],
  feedbackTotalCount: 0,
  selectedItem: null,
  categories: [],
  dashboard: null,
  loading: false,
  error: null,
};

export const feedbackFeature = createFeature({
  name: FEEDBACK_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    // --- Feedback list ---
    on(FeedbackActions.loadFeedback, (state) => ({ ...state, loading: true, error: null })),
    on(FeedbackActions.loadFeedbackSuccess, (state, { items, totalCount }) => ({
      ...state, feedbackItems: items, feedbackTotalCount: totalCount, loading: false,
    })),
    on(FeedbackActions.loadFeedbackFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Single feedback item ---
    on(FeedbackActions.loadFeedbackItem, (state) => ({ ...state, loading: true, error: null })),
    on(FeedbackActions.loadFeedbackItemSuccess, (state, { item }) => ({
      ...state, selectedItem: item, loading: false,
    })),
    on(FeedbackActions.loadFeedbackItemFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Submit feedback ---
    on(FeedbackActions.submitFeedback, (state) => ({ ...state, loading: true, error: null })),
    on(FeedbackActions.submitFeedbackSuccess, (state) => ({ ...state, loading: false })),
    on(FeedbackActions.submitFeedbackFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Categories ---
    on(FeedbackActions.loadCategories, (state) => ({ ...state, loading: true, error: null })),
    on(FeedbackActions.loadCategoriesSuccess, (state, { categories }) => ({
      ...state, categories, loading: false,
    })),
    on(FeedbackActions.loadCategoriesFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Dashboard ---
    on(FeedbackActions.loadDashboard, (state) => ({ ...state, loading: true, error: null })),
    on(FeedbackActions.loadDashboardSuccess, (state, { dashboard }) => ({
      ...state, dashboard, loading: false,
    })),
    on(FeedbackActions.loadDashboardFailure, (state, { error }) => ({ ...state, error, loading: false })),
  ),
});

export const feedbackReducer = feedbackFeature.reducer;
