import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FeedbackState, FEEDBACK_FEATURE_KEY } from './feedback.reducer';

export const selectFeedbackState = createFeatureSelector<FeedbackState>(FEEDBACK_FEATURE_KEY);

export const selectFeedbackItems = createSelector(selectFeedbackState, (state) => state.feedbackItems);
export const selectFeedbackTotalCount = createSelector(selectFeedbackState, (state) => state.feedbackTotalCount);
export const selectSelectedItem = createSelector(selectFeedbackState, (state) => state.selectedItem);
export const selectCategories = createSelector(selectFeedbackState, (state) => state.categories);
export const selectDashboard = createSelector(selectFeedbackState, (state) => state.dashboard);
export const selectFeedbackLoading = createSelector(selectFeedbackState, (state) => state.loading);
export const selectFeedbackError = createSelector(selectFeedbackState, (state) => state.error);
