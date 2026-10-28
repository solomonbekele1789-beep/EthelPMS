import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RiskService } from '../services/risk.service';
import { RiskCategoryService } from '../services/risk-category.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { RiskActions } from './risk.actions';

@Injectable()
export class RiskEffects {
  private readonly actions$ = inject(Actions);
  private readonly riskService = inject(RiskService);
  private readonly riskCategoryService = inject(RiskCategoryService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Categories

  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(RiskActions.loadCategories),
    switchMap(() =>
      this.riskCategoryService.listCategories().pipe(
        map((categories) => RiskActions.loadCategoriesSuccess({ categories })),
        catchError((error) => of(RiskActions.loadCategoriesFailure({ error: error?.error?.detail ?? 'Failed to load risk categories' })))
      )
    )
  ));

  // Risks

  loadRisks$ = createEffect(() => this.actions$.pipe(
    ofType(RiskActions.loadRisks),
    switchMap(({ projectId, status, categoryId, page, pageSize }) =>
      this.riskService.listRisks({ projectId, status, categoryId, page, pageSize }).pipe(
        map((response) => RiskActions.loadRisksSuccess({ risks: response.items, totalCount: response.totalCount })),
        catchError((error) => of(RiskActions.loadRisksFailure({ error: error?.error?.detail ?? 'Failed to load risks' })))
      )
    )
  ));

  loadRisk$ = createEffect(() => this.actions$.pipe(
    ofType(RiskActions.loadRisk),
    switchMap(({ id }) =>
      this.riskService.getRisk(id).pipe(
        map((risk) => RiskActions.loadRiskSuccess({ risk })),
        catchError((error) => of(RiskActions.loadRiskFailure({ error: error?.error?.detail ?? 'Failed to load risk' })))
      )
    )
  ));

  createRisk$ = createEffect(() => this.actions$.pipe(
    ofType(RiskActions.createRisk),
    exhaustMap(({ request }) =>
      this.riskService.createRisk(request).pipe(
        map((response) => RiskActions.createRiskSuccess({ id: response.id })),
        catchError((error) => of(RiskActions.createRiskFailure({ error: error?.error?.detail ?? 'Failed to create risk' })))
      )
    )
  ));

  createRiskSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(RiskActions.createRiskSuccess),
    tap(() => {
      this.notification.success('risk.messages.riskCreated');
      this.router.navigate(['/risk']);
    })
  ), { dispatch: false });

  // Matrix

  loadMatrix$ = createEffect(() => this.actions$.pipe(
    ofType(RiskActions.loadMatrix),
    switchMap(({ projectId }) =>
      this.riskService.getMatrix(projectId).pipe(
        map((items) => RiskActions.loadMatrixSuccess({ items })),
        catchError((error) => of(RiskActions.loadMatrixFailure({ error: error?.error?.detail ?? 'Failed to load risk matrix' })))
      )
    )
  ));
}
