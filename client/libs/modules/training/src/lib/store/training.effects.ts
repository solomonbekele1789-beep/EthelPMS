import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TrainingProgramService } from '../services/training-program.service';
import { TrainingSessionService } from '../services/training-session.service';
import { TrainerService } from '../services/trainer.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { TrainingActions } from './training.actions';

@Injectable()
export class TrainingEffects {
  private readonly actions$ = inject(Actions);
  private readonly trainingProgramService = inject(TrainingProgramService);
  private readonly trainingSessionService = inject(TrainingSessionService);
  private readonly trainerService = inject(TrainerService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Training Programs

  loadPrograms$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.loadPrograms),
    switchMap(({ projectId, category, page, pageSize }) =>
      this.trainingProgramService.listPrograms({ projectId, category, page, pageSize }).pipe(
        map((response) => TrainingActions.loadProgramsSuccess({ programs: response.items, totalCount: response.totalCount })),
        catchError((error) => of(TrainingActions.loadProgramsFailure({ error: error?.error?.detail ?? 'Failed to load programs' })))
      )
    )
  ));

  createProgram$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.createProgram),
    exhaustMap(({ request }) =>
      this.trainingProgramService.createProgram(request).pipe(
        map((response) => TrainingActions.createProgramSuccess({ id: response.id })),
        catchError((error) => of(TrainingActions.createProgramFailure({ error: error?.error?.detail ?? 'Failed to create program' })))
      )
    )
  ));

  createProgramSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.createProgramSuccess),
    tap(() => {
      this.notification.success('Program created successfully');
      this.router.navigate(['/training']);
    })
  ), { dispatch: false });

  // Training Sessions

  loadSessions$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.loadSessions),
    switchMap(({ programId, status, fromDate, toDate, page, pageSize }) =>
      this.trainingSessionService.listSessions({ programId, status, fromDate, toDate, page, pageSize }).pipe(
        map((response) => TrainingActions.loadSessionsSuccess({ sessions: response.items, totalCount: response.totalCount })),
        catchError((error) => of(TrainingActions.loadSessionsFailure({ error: error?.error?.detail ?? 'Failed to load sessions' })))
      )
    )
  ));

  loadSession$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.loadSession),
    switchMap(({ id }) =>
      this.trainingSessionService.getSession(id).pipe(
        map((session) => TrainingActions.loadSessionSuccess({ session })),
        catchError((error) => of(TrainingActions.loadSessionFailure({ error: error?.error?.detail ?? 'Failed to load session' })))
      )
    )
  ));

  createSession$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.createSession),
    exhaustMap(({ request }) =>
      this.trainingSessionService.createSession(request).pipe(
        map((response) => TrainingActions.createSessionSuccess({ id: response.id })),
        catchError((error) => of(TrainingActions.createSessionFailure({ error: error?.error?.detail ?? 'Failed to create session' })))
      )
    )
  ));

  createSessionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.createSessionSuccess),
    tap(() => {
      this.notification.success('Session created successfully');
      this.router.navigate(['/training/sessions']);
    })
  ), { dispatch: false });

  // Trainers

  loadTrainers$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.loadTrainers),
    switchMap(({ page, pageSize }) =>
      this.trainerService.listTrainers({ page, pageSize }).pipe(
        map((response) => TrainingActions.loadTrainersSuccess({ trainers: response.items, totalCount: response.totalCount })),
        catchError((error) => of(TrainingActions.loadTrainersFailure({ error: error?.error?.detail ?? 'Failed to load trainers' })))
      )
    )
  ));

  createTrainer$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.createTrainer),
    exhaustMap(({ request }) =>
      this.trainerService.createTrainer(request).pipe(
        map((response) => TrainingActions.createTrainerSuccess({ id: response.id })),
        catchError((error) => of(TrainingActions.createTrainerFailure({ error: error?.error?.detail ?? 'Failed to create trainer' })))
      )
    )
  ));

  createTrainerSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TrainingActions.createTrainerSuccess),
    tap(() => {
      this.notification.success('Trainer created successfully');
      this.router.navigate(['/training/trainers']);
    })
  ), { dispatch: false });
}
