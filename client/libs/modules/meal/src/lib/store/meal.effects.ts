import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MealPlanService } from '../services/meal-plan.service';
import { EvaluationService } from '../services/evaluation.service';
import { GesiService } from '../services/gesi.service';
import { LessonService } from '../services/lesson.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { MealActions } from './meal.actions';

@Injectable()
export class MealEffects {
  private readonly actions$ = inject(Actions);
  private readonly mealPlanService = inject(MealPlanService);
  private readonly evaluationService = inject(EvaluationService);
  private readonly gesiService = inject(GesiService);
  private readonly lessonService = inject(LessonService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // MEAL Plans
  loadPlans$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.loadPlans),
    switchMap(({ page, pageSize, projectId }) =>
      this.mealPlanService.listPlans({ projectId, page, pageSize }).pipe(
        map((response) => MealActions.loadPlansSuccess({ plans: response.items, totalCount: response.totalCount })),
        catchError((error) => of(MealActions.loadPlansFailure({ error: error?.error?.detail ?? 'Failed to load MEAL plans' })))
      )
    )
  ));

  loadPlan$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.loadPlan),
    switchMap(({ id }) =>
      this.mealPlanService.getPlan(id).pipe(
        map((plan) => MealActions.loadPlanSuccess({ plan })),
        catchError((error) => of(MealActions.loadPlanFailure({ error: error?.error?.detail ?? 'Failed to load MEAL plan' })))
      )
    )
  ));

  createPlan$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.createPlan),
    exhaustMap(({ request }) =>
      this.mealPlanService.createPlan(request).pipe(
        map((response) => MealActions.createPlanSuccess({ id: response.id })),
        catchError((error) => of(MealActions.createPlanFailure({ error: error?.error?.detail ?? 'Failed to create MEAL plan' })))
      )
    )
  ));

  createPlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.createPlanSuccess),
    tap(() => {
      this.notification.success('MEAL plan created successfully');
      this.router.navigate(['/meal']);
    })
  ), { dispatch: false });

  updatePlan$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.updatePlan),
    exhaustMap(({ id, request }) =>
      this.mealPlanService.updatePlan(id, request).pipe(
        map(() => MealActions.updatePlanSuccess()),
        catchError((error) => of(MealActions.updatePlanFailure({ error: error?.error?.detail ?? 'Failed to update MEAL plan' })))
      )
    )
  ));

  updatePlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.updatePlanSuccess),
    tap(() => this.notification.success('MEAL plan updated successfully'))
  ), { dispatch: false });

  submitPlan$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.submitPlan),
    exhaustMap(({ id }) =>
      this.mealPlanService.submitPlan(id).pipe(
        map(() => MealActions.submitPlanSuccess({ id })),
        catchError((error) => of(MealActions.submitPlanFailure({ error: error?.error?.detail ?? 'Failed to submit MEAL plan' })))
      )
    )
  ));

  submitPlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.submitPlanSuccess),
    tap(() => this.notification.success('MEAL plan submitted successfully')),
    map(({ id }) => MealActions.loadPlan({ id }))
  ));

  approvePlan$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.approvePlan),
    exhaustMap(({ id }) =>
      this.mealPlanService.approvePlan(id).pipe(
        map(() => MealActions.approvePlanSuccess({ id })),
        catchError((error) => of(MealActions.approvePlanFailure({ error: error?.error?.detail ?? 'Failed to approve MEAL plan' })))
      )
    )
  ));

  approvePlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.approvePlanSuccess),
    tap(() => this.notification.success('MEAL plan approved successfully')),
    map(({ id }) => MealActions.loadPlan({ id }))
  ));

  rejectPlan$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.rejectPlan),
    exhaustMap(({ id, request }) =>
      this.mealPlanService.rejectPlan(id, request).pipe(
        map(() => MealActions.rejectPlanSuccess({ id })),
        catchError((error) => of(MealActions.rejectPlanFailure({ error: error?.error?.detail ?? 'Failed to reject MEAL plan' })))
      )
    )
  ));

  rejectPlanSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.rejectPlanSuccess),
    tap(() => this.notification.success('MEAL plan rejected')),
    map(({ id }) => MealActions.loadPlan({ id }))
  ));

  // Evaluations
  loadEvaluations$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.loadEvaluations),
    switchMap(({ projectId, status }) =>
      this.evaluationService.listEvaluations(projectId, status).pipe(
        map((evaluations) => MealActions.loadEvaluationsSuccess({ evaluations })),
        catchError((error) => of(MealActions.loadEvaluationsFailure({ error: error?.error?.detail ?? 'Failed to load evaluations' })))
      )
    )
  ));

  loadEvaluation$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.loadEvaluation),
    switchMap(({ id }) =>
      this.evaluationService.getEvaluation(id).pipe(
        map((evaluation) => MealActions.loadEvaluationSuccess({ evaluation })),
        catchError((error) => of(MealActions.loadEvaluationFailure({ error: error?.error?.detail ?? 'Failed to load evaluation' })))
      )
    )
  ));

  createEvaluation$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.createEvaluation),
    exhaustMap(({ request }) =>
      this.evaluationService.createEvaluation(request).pipe(
        map((response) => MealActions.createEvaluationSuccess({ id: response.id })),
        catchError((error) => of(MealActions.createEvaluationFailure({ error: error?.error?.detail ?? 'Failed to create evaluation' })))
      )
    )
  ));

  createEvaluationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.createEvaluationSuccess),
    tap(() => {
      this.notification.success('Evaluation created successfully');
      this.router.navigate(['/meal/evaluations']);
    })
  ), { dispatch: false });

  // GESI
  loadGesiAssessments$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.loadGesiAssessments),
    switchMap(({ projectId }) =>
      this.gesiService.listAssessments(projectId).pipe(
        map((assessments) => MealActions.loadGesiAssessmentsSuccess({ assessments })),
        catchError((error) => of(MealActions.loadGesiAssessmentsFailure({ error: error?.error?.detail ?? 'Failed to load GESI assessments' })))
      )
    )
  ));

  // Lessons
  loadLessons$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.loadLessons),
    switchMap(({ projectId, category }) =>
      this.lessonService.listLessons(projectId, category).pipe(
        map((lessons) => MealActions.loadLessonsSuccess({ lessons })),
        catchError((error) => of(MealActions.loadLessonsFailure({ error: error?.error?.detail ?? 'Failed to load lessons' })))
      )
    )
  ));

  createLesson$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.createLesson),
    exhaustMap(({ request }) =>
      this.lessonService.createLesson(request).pipe(
        map((response) => MealActions.createLessonSuccess({ id: response.id })),
        catchError((error) => of(MealActions.createLessonFailure({ error: error?.error?.detail ?? 'Failed to create lesson' })))
      )
    )
  ));

  createLessonSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(MealActions.createLessonSuccess),
    tap(() => this.notification.success('Lesson recorded successfully'))
  ), { dispatch: false });
}
