import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PlanService } from '../services/plan.service';
import { PlanningConfigService } from '../services/planning-config.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { PlanActions } from './plan.actions';

@Injectable()
export class PlanEffects {
  private readonly actions$ = inject(Actions);
  private readonly planService = inject(PlanService);
  private readonly configService = inject(PlanningConfigService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loadPlans$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.loadPlans),
    switchMap(({ page, pageSize, projectId, level, parentId }) =>
      this.planService.listPlans({ projectId, page, pageSize, level: level as string | undefined, parentId }).pipe(
        map((response) => PlanActions.loadPlansSuccess({ plans: response.items, totalCount: response.totalCount })),
        catchError((error) => of(PlanActions.loadPlansFailure({ error: error?.error?.detail ?? 'Failed to load plans' })))
      )
    )
  ));

  loadPlan$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.loadPlan),
    switchMap(({ id }) =>
      this.planService.getPlan(id).pipe(
        map((plan) => PlanActions.loadPlanSuccess({ plan })),
        catchError((error) => of(PlanActions.loadPlanFailure({ error: error?.error?.detail ?? 'Failed to load plan' })))
      )
    )
  ));

  loadHierarchy$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.loadHierarchy),
    switchMap(({ projectId, fiscalYear }) =>
      this.planService.getHierarchy(projectId, fiscalYear).pipe(
        map((hierarchy) => PlanActions.loadHierarchySuccess({ hierarchy })),
        catchError((error) => of(PlanActions.loadHierarchyFailure({ error: error?.error?.detail ?? 'Failed to load hierarchy' })))
      )
    )
  ));

  createPlan$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.createPlan),
    exhaustMap(({ request }) =>
      this.planService.createPlan(request).pipe(
        map((response) => PlanActions.createPlanSuccess({ id: response.id })),
        catchError((error) => of(PlanActions.createPlanFailure({ error: error?.error?.detail ?? 'Failed to create plan' })))
      )
    )
  ));

  createPlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.createPlanSuccess),
    tap(() => {
      this.notification.success('Plan created successfully');
      this.router.navigate(['/planning']);
    })
  ), { dispatch: false });

  updatePlan$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.updatePlan),
    exhaustMap(({ id, request }) =>
      this.planService.updatePlan(id, request).pipe(
        map(() => PlanActions.updatePlanSuccess()),
        catchError((error) => of(PlanActions.updatePlanFailure({ error: error?.error?.detail ?? 'Failed to update plan' })))
      )
    )
  ));

  updatePlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.updatePlanSuccess),
    tap(() => this.notification.success('Plan updated successfully'))
  ), { dispatch: false });

  submitPlan$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.submitPlan),
    exhaustMap(({ id }) =>
      this.planService.submitPlan(id).pipe(
        map(() => PlanActions.submitPlanSuccess({ id })),
        catchError((error) => of(PlanActions.submitPlanFailure({ error: error?.error?.detail ?? 'Failed to submit plan' })))
      )
    )
  ));

  submitPlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.submitPlanSuccess),
    tap(({ id }) => {
      this.notification.success('Plan submitted successfully');
    }),
    map(({ id }) => PlanActions.loadPlan({ id }))
  ));

  approvePlan$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.approvePlan),
    exhaustMap(({ id }) =>
      this.planService.approvePlan(id).pipe(
        map(() => PlanActions.approvePlanSuccess({ id })),
        catchError((error) => of(PlanActions.approvePlanFailure({ error: error?.error?.detail ?? 'Failed to approve plan' })))
      )
    )
  ));

  approvePlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.approvePlanSuccess),
    tap(({ id }) => {
      this.notification.success('Plan approved successfully');
    }),
    map(({ id }) => PlanActions.loadPlan({ id }))
  ));

  rejectPlan$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.rejectPlan),
    exhaustMap(({ id, request }) =>
      this.planService.rejectPlan(id, request).pipe(
        map(() => PlanActions.rejectPlanSuccess({ id })),
        catchError((error) => of(PlanActions.rejectPlanFailure({ error: error?.error?.detail ?? 'Failed to reject plan' })))
      )
    )
  ));

  rejectPlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.rejectPlanSuccess),
    tap(({ id }) => {
      this.notification.success('Plan rejected successfully');
    }),
    map(({ id }) => PlanActions.loadPlan({ id }))
  ));

  loadConfig$ = createEffect(() => this.actions$.pipe(
    ofType(PlanActions.loadConfig),
    switchMap(() =>
      this.configService.getConfig().pipe(
        map((config) => PlanActions.loadConfigSuccess({ config })),
        catchError((error) => of(PlanActions.loadConfigFailure({ error: error?.error?.detail ?? 'Failed to load configuration' })))
      )
    )
  ));
}
