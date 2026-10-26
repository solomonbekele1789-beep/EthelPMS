import { createFeatureSelector, createSelector } from '@ngrx/store';
import { KnowledgeState, KNOWLEDGE_FEATURE_KEY } from './knowledge.reducer';

export const selectKnowledgeState = createFeatureSelector<KnowledgeState>(KNOWLEDGE_FEATURE_KEY);

export const selectCategories = createSelector(selectKnowledgeState, (state) => state.categories);
export const selectArticles = createSelector(selectKnowledgeState, (state) => state.articles);
export const selectSelectedArticle = createSelector(selectKnowledgeState, (state) => state.selectedArticle);
export const selectComments = createSelector(selectKnowledgeState, (state) => state.comments);
export const selectKnowledgeLoading = createSelector(selectKnowledgeState, (state) => state.loading);
export const selectKnowledgeError = createSelector(selectKnowledgeState, (state) => state.error);
export const selectFeaturedArticles = createSelector(selectArticles, (articles) => articles.filter((a) => a.isFeatured));
export const selectActiveCategories = createSelector(selectCategories, (categories) => categories.filter((c) => c.isActive));
