import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ParticipantService } from '../services/participant.service';
import { GraduationBenchmarkService } from '../services/graduation-benchmark.service';
import { GraduationTrackingService } from '../services/graduation-tracking.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { ParticipantsActions } from './participants.actions';

@Injectable()
export class ParticipantsEffects {
  private readonly actions$ = inject(Actions);
  private readonly participantService = inject(ParticipantService);
  private readonly graduationBenchmarkService = inject(GraduationBenchmarkService);
  private readonly graduationTrackingService = inject(GraduationTrackingService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Participants
  loadParticipants$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.loadParticipants),
    switchMap(({ projectId, status, search, page, pageSize }) =>
      this.participantService.listParticipants({ projectId, status, search, page, pageSize }).pipe(
        map((response) => ParticipantsActions.loadParticipantsSuccess({ participants: response.items, totalCount: response.totalCount })),
        catchError((error) => of(ParticipantsActions.loadParticipantsFailure({ error: error?.error?.detail ?? 'Failed to load participants' })))
      )
    )
  ));

  loadParticipant$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.loadParticipant),
    switchMap(({ id }) =>
      this.participantService.getParticipant(id).pipe(
        map((participant) => ParticipantsActions.loadParticipantSuccess({ participant })),
        catchError((error) => of(ParticipantsActions.loadParticipantFailure({ error: error?.error?.detail ?? 'Failed to load participant' })))
      )
    )
  ));

  registerParticipant$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.registerParticipant),
    exhaustMap(({ request }) =>
      this.participantService.registerParticipant(request).pipe(
        map((response) => ParticipantsActions.registerParticipantSuccess({ id: response.id })),
        catchError((error) => of(ParticipantsActions.registerParticipantFailure({ error: error?.error?.detail ?? 'Failed to register participant' })))
      )
    )
  ));

  registerParticipantSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.registerParticipantSuccess),
    tap(() => {
      this.notification.success('Participant registered successfully');
      this.router.navigate(['/participants']);
    })
  ), { dispatch: false });

  updateParticipant$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.updateParticipant),
    exhaustMap(({ id, request }) =>
      this.participantService.updateParticipant(id, request).pipe(
        tap(() => this.notification.success('Participant updated successfully')),
        switchMap(() => [
          ParticipantsActions.updateParticipantSuccess(),
          ParticipantsActions.loadParticipant({ id })
        ]),
        catchError((error) => of(ParticipantsActions.updateParticipantFailure({ error: error?.error?.detail ?? 'Failed to update participant' })))
      )
    )
  ));

  // Graduation — Benchmarks
  loadBenchmarks$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.loadBenchmarks),
    switchMap(({ projectId, activeOnly }) =>
      this.graduationBenchmarkService.listBenchmarks(projectId, activeOnly).pipe(
        map((benchmarks) => ParticipantsActions.loadBenchmarksSuccess({ benchmarks })),
        catchError((error) => of(ParticipantsActions.loadBenchmarksFailure({ error: error?.error?.detail ?? 'Failed to load benchmarks' })))
      )
    )
  ));

  // Graduation — Pipeline
  loadPipeline$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.loadPipeline),
    switchMap(({ projectId }) =>
      this.graduationTrackingService.getPipeline(projectId).pipe(
        map((pipeline) => ParticipantsActions.loadPipelineSuccess({ pipeline })),
        catchError((error) => of(ParticipantsActions.loadPipelineFailure({ error: error?.error?.detail ?? 'Failed to load graduation pipeline' })))
      )
    )
  ));

  // Graduation — Decisions
  loadDecisions$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.loadDecisions),
    switchMap(({ projectId, participantId }) =>
      this.graduationTrackingService.listDecisions(projectId, participantId).pipe(
        map((decisions) => ParticipantsActions.loadDecisionsSuccess({ decisions })),
        catchError((error) => of(ParticipantsActions.loadDecisionsFailure({ error: error?.error?.detail ?? 'Failed to load graduation decisions' })))
      )
    )
  ));

  approveDecision$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.approveDecision),
    exhaustMap(({ id }) =>
      this.graduationTrackingService.approveDecision(id).pipe(
        tap(() => this.notification.success('Decision approved successfully')),
        switchMap(() => [
          ParticipantsActions.approveDecisionSuccess(),
          ParticipantsActions.loadDecisions({})
        ]),
        catchError((error) => of(ParticipantsActions.approveDecisionFailure({ error: error?.error?.detail ?? 'Failed to approve decision' })))
      )
    )
  ));

  rejectDecision$ = createEffect(() => this.actions$.pipe(
    ofType(ParticipantsActions.rejectDecision),
    exhaustMap(({ id, request }) =>
      this.graduationTrackingService.rejectDecision(id, request).pipe(
        tap(() => this.notification.success('Decision rejected successfully')),
        switchMap(() => [
          ParticipantsActions.rejectDecisionSuccess(),
          ParticipantsActions.loadDecisions({})
        ]),
        catchError((error) => of(ParticipantsActions.rejectDecisionFailure({ error: error?.error?.detail ?? 'Failed to reject decision' })))
      )
    )
  ));
}
