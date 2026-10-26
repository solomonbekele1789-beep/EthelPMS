import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TaskBoardService } from '../services/task-board.service';
import { TaskService } from '../services/task.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { TasksActions } from './tasks.actions';

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly taskBoardService = inject(TaskBoardService);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Task Boards

  loadBoard$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.loadBoard),
    switchMap(({ id }) =>
      this.taskBoardService.getBoard(id).pipe(
        map((board) => TasksActions.loadBoardSuccess({ board })),
        catchError((error) => of(TasksActions.loadBoardFailure({ error: error?.error?.detail ?? 'Failed to load board' })))
      )
    )
  ));

  createBoard$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.createBoard),
    exhaustMap(({ request }) =>
      this.taskBoardService.createBoard(request).pipe(
        map((response) => TasksActions.createBoardSuccess({ id: response.id })),
        catchError((error) => of(TasksActions.createBoardFailure({ error: error?.error?.detail ?? 'Failed to create board' })))
      )
    )
  ));

  createBoardSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.createBoardSuccess),
    tap(() => {
      this.notification.success('Board created successfully');
      this.router.navigate(['/tasks']);
    })
  ), { dispatch: false });

  // Task Items

  loadTasks$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.loadTasks),
    switchMap(({ boardId, listId, projectId, status, assignedToUserId, search, page, pageSize }) =>
      this.taskService.listTasks({ boardId, listId, projectId, status, assignedToUserId, search, page, pageSize }).pipe(
        map((response) => TasksActions.loadTasksSuccess({ tasks: response.items, totalCount: response.totalCount })),
        catchError((error) => of(TasksActions.loadTasksFailure({ error: error?.error?.detail ?? 'Failed to load tasks' })))
      )
    )
  ));

  loadTask$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.loadTask),
    switchMap(({ id }) =>
      this.taskService.getTask(id).pipe(
        map((task) => TasksActions.loadTaskSuccess({ task })),
        catchError((error) => of(TasksActions.loadTaskFailure({ error: error?.error?.detail ?? 'Failed to load task' })))
      )
    )
  ));

  createTask$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.createTask),
    exhaustMap(({ request }) =>
      this.taskService.createTask(request).pipe(
        map((response) => TasksActions.createTaskSuccess({ id: response.id })),
        catchError((error) => of(TasksActions.createTaskFailure({ error: error?.error?.detail ?? 'Failed to create task' })))
      )
    )
  ));

  createTaskSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.createTaskSuccess),
    tap(() => {
      this.notification.success('Task created successfully');
      this.router.navigate(['/tasks']);
    })
  ), { dispatch: false });

  // Comments

  loadComments$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.loadComments),
    switchMap(({ taskId }) =>
      this.taskService.listComments(taskId).pipe(
        map((comments) => TasksActions.loadCommentsSuccess({ comments })),
        catchError((error) => of(TasksActions.loadCommentsFailure({ error: error?.error?.detail ?? 'Failed to load comments' })))
      )
    )
  ));
}
