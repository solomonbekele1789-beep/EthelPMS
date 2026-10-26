import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FeedbackService } from '../services/feedback.service';
import { FeedbackCategoryService } from '../services/feedback-category.service';
import { FeedbackActions } from './feedback.actions';

@Injectable()
export class FeedbackEffects {
  private readonly actions$ = inject(Actions);
  private readonly feedbackService = inject(FeedbackService);
  private readonly feedbackCategoryService = inject(FeedbackCategoryService);

  loadFeedback$ = createEffect(() => this.actions$.pipe(
    ofType(FeedbackActions.loadFeedback),
    switchMap(({ page, pageSize, status, type, feedbackCategoryId, projectId, isConfidential }) =>
      this.feedbackService.listFeedback({ page, pageSize, status, type, feedbackCategoryId, projectId, isConfidential }).pipe(
        map((response) => FeedbackActions.loadFeedbackSuccess({ items: response.items, totalCount: response.totalCount })),
        catchError((error) => of(FeedbackActions.loadFeedbackFailure({ error: error?.error?.detail ?? 'Failed to load feedback' })))
      )
    )
  ));

  loadFeedbackItem$ = createEffect(() => this.actions$.pipe(
    ofType(FeedbackActions.loadFeedbackItem),
    switchMap(({ id }) =>
      this.feedbackService.getFeedback(id).pipe(
        map((item) => FeedbackActions.loadFeedbackItemSuccess({ item })),
        catchError((error) => of(FeedbackActions.loadFeedbackItemFailure({ error: error?.error?.detail ?? 'Failed to load feedback item' })))
      )
    )
  ));

  submitFeedback$ = createEffect(() => this.actions$.pipe(
    ofType(FeedbackActions.submitFeedback),
    exhaustMap(({ request }) =>
      this.feedbackService.submitFeedback(request).pipe(
        map((response) => FeedbackActions.submitFeedbackSuccess({ id: response.id })),
        catchError((error) => of(FeedbackActions.submitFeedbackFailure({ error: error?.error?.detail ?? 'Failed to submit feedback' })))
      )
    )
  ));

  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(FeedbackActions.loadCategories),
    switchMap(() =>
      this.feedbackCategoryService.listCategories().pipe(
        map((categories) => FeedbackActions.loadCategoriesSuccess({ categories })),
        catchError((error) => of(FeedbackActions.loadCategoriesFailure({ error: error?.error?.detail ?? 'Failed to load categories' })))
      )
    )
  ));

  loadDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(FeedbackActions.loadDashboard),
    switchMap(() =>
      this.feedbackService.getDashboard().pipe(
        map((dashboard) => FeedbackActions.loadDashboardSuccess({ dashboard })),
        catchError((error) => of(FeedbackActions.loadDashboardFailure({ error: error?.error?.detail ?? 'Failed to load dashboard' })))
      )
    )
  ));
}
