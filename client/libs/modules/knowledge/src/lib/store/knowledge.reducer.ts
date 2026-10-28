import { createFeature, createReducer, on } from '@ngrx/store';
import { KbCategoryDto } from '../models/category.model';
import { KbArticleDto, KbArticleListDto } from '../models/article.model';
import { KbArticleCommentDto } from '../models/comment.model';
import { KnowledgeActions } from './knowledge.actions';

export const KNOWLEDGE_FEATURE_KEY = 'knowledge';

export interface KnowledgeState {
  categories: KbCategoryDto[];
  articles: KbArticleListDto[];
  selectedArticle: KbArticleDto | null;
  comments: KbArticleCommentDto[];
  loading: boolean;
  error: string | null;
}

const initialState: KnowledgeState = {
  categories: [],
  articles: [],
  selectedArticle: null,
  comments: [],
  loading: false,
  error: null,
};

export const knowledgeFeature = createFeature({
  name: KNOWLEDGE_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    // --- Categories ---
    on(KnowledgeActions.loadCategories, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.loadCategoriesSuccess, (state, { categories }) => ({
      ...state, categories, loading: false,
    })),
    on(KnowledgeActions.loadCategoriesFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.createCategory, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.createCategorySuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.createCategoryFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.updateCategory, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.updateCategorySuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.updateCategoryFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.deleteCategory, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.deleteCategorySuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.deleteCategoryFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Articles ---
    on(KnowledgeActions.loadArticles, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.loadArticlesSuccess, (state, { articles }) => ({
      ...state, articles, loading: false,
    })),
    on(KnowledgeActions.loadArticlesFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.searchArticles, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.searchArticlesSuccess, (state, { articles }) => ({
      ...state, articles, loading: false,
    })),
    on(KnowledgeActions.searchArticlesFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.loadArticle, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.loadArticleSuccess, (state, { article }) => ({
      ...state, selectedArticle: article, loading: false,
    })),
    on(KnowledgeActions.loadArticleFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.createArticle, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.createArticleSuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.createArticleFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.updateArticle, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.updateArticleSuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.updateArticleFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.publishArticle, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.publishArticleSuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.publishArticleFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.archiveArticle, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.archiveArticleSuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.archiveArticleFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.deleteArticle, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.deleteArticleSuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.deleteArticleFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Comments ---
    on(KnowledgeActions.loadComments, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.loadCommentsSuccess, (state, { comments }) => ({
      ...state, comments, loading: false,
    })),
    on(KnowledgeActions.loadCommentsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(KnowledgeActions.addComment, (state) => ({ ...state, loading: true, error: null })),
    on(KnowledgeActions.addCommentSuccess, (state) => ({ ...state, loading: false })),
    on(KnowledgeActions.addCommentFailure, (state, { error }) => ({ ...state, error, loading: false })),
  ),
});

export const knowledgeReducer = knowledgeFeature.reducer;
