import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProjectService } from '../services/project.service';
import { LogframeService } from '../services/logframe.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { ProjectActions } from './project.actions';

@Injectable()
export class ProjectEffects {
  private readonly actions$ = inject(Actions);
  private readonly projectService = inject(ProjectService);
  private readonly logframeService = inject(LogframeService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loadProjects$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.loadProjects),
    switchMap(({ page, pageSize, search, status }) =>
      this.projectService.listProjects(page, pageSize, search, status).pipe(
        map((response) => ProjectActions.loadProjectsSuccess({ projects: response.items, totalCount: response.totalCount })),
        catchError((error) => of(ProjectActions.loadProjectsFailure({ error: error?.error?.detail ?? 'Failed to load projects' })))
      )
    )
  ));

  loadProject$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.loadProject),
    switchMap(({ id }) =>
      this.projectService.getProject(id).pipe(
        map((project) => ProjectActions.loadProjectSuccess({ project })),
        catchError((error) => of(ProjectActions.loadProjectFailure({ error: error?.error?.detail ?? 'Failed to load project' })))
      )
    )
  ));

  createProject$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.createProject),
    exhaustMap(({ request }) =>
      this.projectService.createProject(request).pipe(
        map((response) => ProjectActions.createProjectSuccess({ id: response.id })),
        catchError((error) => of(ProjectActions.createProjectFailure({ error: error?.error?.detail ?? 'Failed to create project' })))
      )
    )
  ));

  createProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.createProjectSuccess),
    tap(() => {
      this.notification.success('Project created successfully');
      this.router.navigate(['/projects']);
    })
  ), { dispatch: false });

  updateProject$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.updateProject),
    exhaustMap(({ id, request }) =>
      this.projectService.updateProject(id, request).pipe(
        map(() => ProjectActions.updateProjectSuccess()),
        catchError((error) => of(ProjectActions.updateProjectFailure({ error: error?.error?.detail ?? 'Failed to update project' })))
      )
    )
  ));

  updateProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.updateProjectSuccess),
    tap(() => this.notification.success('Project updated successfully'))
  ), { dispatch: false });

  submitProject$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.submitProject),
    exhaustMap(({ id }) =>
      this.projectService.submitProject(id).pipe(
        map(() => ProjectActions.submitProjectSuccess({ id })),
        catchError((error) => of(ProjectActions.submitProjectFailure({ error: error?.error?.detail ?? 'Failed to submit project' })))
      )
    )
  ));

  submitProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.submitProjectSuccess),
    tap(({ id }) => {
      this.notification.success('Project submitted successfully');
    }),
    map(({ id }) => ProjectActions.loadProject({ id }))
  ));

  approveProject$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.approveProject),
    exhaustMap(({ id }) =>
      this.projectService.approveProject(id).pipe(
        map(() => ProjectActions.approveProjectSuccess({ id })),
        catchError((error) => of(ProjectActions.approveProjectFailure({ error: error?.error?.detail ?? 'Failed to approve project' })))
      )
    )
  ));

  approveProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.approveProjectSuccess),
    tap(({ id }) => {
      this.notification.success('Project approved successfully');
    }),
    map(({ id }) => ProjectActions.loadProject({ id }))
  ));

  rejectProject$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.rejectProject),
    exhaustMap(({ id, request }) =>
      this.projectService.rejectProject(id, request).pipe(
        map(() => ProjectActions.rejectProjectSuccess({ id })),
        catchError((error) => of(ProjectActions.rejectProjectFailure({ error: error?.error?.detail ?? 'Failed to reject project' })))
      )
    )
  ));

  rejectProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.rejectProjectSuccess),
    tap(({ id }) => {
      this.notification.success('Project rejected successfully');
    }),
    map(({ id }) => ProjectActions.loadProject({ id }))
  ));

  loadLogframe$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectActions.loadLogframe),
    switchMap(({ projectId }) =>
      this.logframeService.getLogframe(projectId).pipe(
        map((logframe) => ProjectActions.loadLogframeSuccess({ logframe })),
        catchError((error) => of(ProjectActions.loadLogframeFailure({ error: error?.error?.detail ?? 'Failed to load logframe' })))
      )
    )
  ));
}
