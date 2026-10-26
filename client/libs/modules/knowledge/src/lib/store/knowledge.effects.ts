import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CategoryService } from '../services/category.service';
import { ArticleService } from '../services/article.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { KnowledgeActions } from './knowledge.actions';

@Injectable()
export class KnowledgeEffects {
  private readonly actions$ = inject(Actions);
  private readonly categoryService = inject(CategoryService);
  private readonly articleService = inject(ArticleService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // ── Categories ─────────────────────────────────────────────

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.loadCategories),
      switchMap(() =>
        this.categoryService.listCategories().pipe(
          map((categories) => KnowledgeActions.loadCategoriesSuccess({ categories })),
          catchError((error) =>
            of(KnowledgeActions.loadCategoriesFailure({ error: error?.error?.detail ?? 'Failed to load categories' }))
          )
        )
      )
    )
  );

  createCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.createCategory),
      exhaustMap(({ request }) =>
        this.categoryService.createCategory(request).pipe(
          map((response) => KnowledgeActions.createCategorySuccess({ id: response.id })),
          catchError((error) =>
            of(KnowledgeActions.createCategoryFailure({ error: error?.error?.detail ?? 'Failed to create category' }))
          )
        )
      )
    )
  );

  createCategorySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.createCategorySuccess),
      tap(() => this.notification.success('Category created successfully')),
      map(() => KnowledgeActions.loadCategories())
    )
  );

  updateCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.updateCategory),
      exhaustMap(({ id, request }) =>
        this.categoryService.updateCategory(id, request).pipe(
          map(() => KnowledgeActions.updateCategorySuccess()),
          catchError((error) =>
            of(KnowledgeActions.updateCategoryFailure({ error: error?.error?.detail ?? 'Failed to update category' }))
          )
        )
      )
    )
  );

  updateCategorySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.updateCategorySuccess),
      tap(() => this.notification.success('Category updated successfully')),
      map(() => KnowledgeActions.loadCategories())
    )
  );

  deleteCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.deleteCategory),
      exhaustMap(({ id }) =>
        this.categoryService.deleteCategory(id).pipe(
          map(() => KnowledgeActions.deleteCategorySuccess()),
          catchError((error) =>
            of(KnowledgeActions.deleteCategoryFailure({ error: error?.error?.detail ?? 'Failed to delete category' }))
          )
        )
      )
    )
  );

  deleteCategorySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.deleteCategorySuccess),
      tap(() => this.notification.success('Category deleted successfully')),
      map(() => KnowledgeActions.loadCategories())
    )
  );

  // ── Articles ───────────────────────────────────────────────

  loadArticles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.loadArticles),
      switchMap(({ categoryId, articleType, status, searchTerm, tags }) =>
        this.articleService.listArticles({ categoryId, articleType, status, searchTerm, tags }).pipe(
          map((articles) => KnowledgeActions.loadArticlesSuccess({ articles })),
          catchError((error) =>
            of(KnowledgeActions.loadArticlesFailure({ error: error?.error?.detail ?? 'Failed to load articles' }))
          )
        )
      )
    )
  );

  searchArticles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.searchArticles),
      switchMap(({ term }) =>
        this.articleService.searchArticles(term).pipe(
          map((articles) => KnowledgeActions.searchArticlesSuccess({ articles })),
          catchError((error) =>
            of(KnowledgeActions.searchArticlesFailure({ error: error?.error?.detail ?? 'Failed to search articles' }))
          )
        )
      )
    )
  );

  loadArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.loadArticle),
      switchMap(({ id }) =>
        this.articleService.getArticle(id).pipe(
          map((article) => KnowledgeActions.loadArticleSuccess({ article })),
          catchError((error) =>
            of(KnowledgeActions.loadArticleFailure({ error: error?.error?.detail ?? 'Failed to load article' }))
          )
        )
      )
    )
  );

  createArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.createArticle),
      exhaustMap(({ request }) =>
        this.articleService.createArticle(request).pipe(
          map((response) => KnowledgeActions.createArticleSuccess({ id: response.id })),
          catchError((error) =>
            of(KnowledgeActions.createArticleFailure({ error: error?.error?.detail ?? 'Failed to create article' }))
          )
        )
      )
    )
  );

  createArticleSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(KnowledgeActions.createArticleSuccess),
        tap(({ id }) => {
          this.notification.success('Article created successfully');
          this.router.navigate(['/knowledge', id]);
        })
      ),
    { dispatch: false }
  );

  updateArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.updateArticle),
      exhaustMap(({ id, request }) =>
        this.articleService.updateArticle(id, request).pipe(
          map(() => KnowledgeActions.updateArticleSuccess()),
          catchError((error) =>
            of(KnowledgeActions.updateArticleFailure({ error: error?.error?.detail ?? 'Failed to update article' }))
          )
        )
      )
    )
  );

  updateArticleSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(KnowledgeActions.updateArticleSuccess),
        tap(() => this.notification.success('Article updated successfully'))
      ),
    { dispatch: false }
  );

  publishArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.publishArticle),
      exhaustMap(({ id }) =>
        this.articleService.publishArticle(id).pipe(
          map(() => KnowledgeActions.publishArticleSuccess()),
          catchError((error) =>
            of(KnowledgeActions.publishArticleFailure({ error: error?.error?.detail ?? 'Failed to publish article' }))
          )
        )
      )
    )
  );

  publishArticleSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(KnowledgeActions.publishArticleSuccess),
        tap(() => this.notification.success('Article published successfully'))
      ),
    { dispatch: false }
  );

  archiveArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.archiveArticle),
      exhaustMap(({ id }) =>
        this.articleService.archiveArticle(id).pipe(
          map(() => KnowledgeActions.archiveArticleSuccess()),
          catchError((error) =>
            of(KnowledgeActions.archiveArticleFailure({ error: error?.error?.detail ?? 'Failed to archive article' }))
          )
        )
      )
    )
  );

  archiveArticleSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(KnowledgeActions.archiveArticleSuccess),
        tap(() => this.notification.success('Article archived successfully'))
      ),
    { dispatch: false }
  );

  deleteArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.deleteArticle),
      exhaustMap(({ id }) =>
        this.articleService.deleteArticle(id).pipe(
          map(() => KnowledgeActions.deleteArticleSuccess()),
          catchError((error) =>
            of(KnowledgeActions.deleteArticleFailure({ error: error?.error?.detail ?? 'Failed to delete article' }))
          )
        )
      )
    )
  );

  deleteArticleSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(KnowledgeActions.deleteArticleSuccess),
        tap(() => {
          this.notification.success('Article deleted successfully');
          this.router.navigate(['/knowledge']);
        })
      ),
    { dispatch: false }
  );

  // ── Comments ───────────────────────────────────────────────

  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.loadComments),
      switchMap(({ articleId }) =>
        this.articleService.listComments(articleId).pipe(
          map((comments) => KnowledgeActions.loadCommentsSuccess({ comments })),
          catchError((error) =>
            of(KnowledgeActions.loadCommentsFailure({ error: error?.error?.detail ?? 'Failed to load comments' }))
          )
        )
      )
    )
  );

  addComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KnowledgeActions.addComment),
      exhaustMap(({ articleId, request }) =>
        this.articleService.addComment(articleId, request).pipe(
          map((response) => KnowledgeActions.addCommentSuccess({ id: response.id })),
          catchError((error) =>
            of(KnowledgeActions.addCommentFailure({ error: error?.error?.detail ?? 'Failed to add comment' }))
          )
        )
      )
    )
  );

  addCommentSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(KnowledgeActions.addCommentSuccess),
        tap(() => this.notification.success('Comment added successfully'))
      ),
    { dispatch: false }
  );
}
