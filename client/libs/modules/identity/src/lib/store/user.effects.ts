import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../services/user.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { UserActions } from './user.actions';

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loadUsers$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.loadUsers),
    switchMap(({ page, pageSize, search, sortBy, sortDirection }) =>
      this.userService.listUsers(page, pageSize, search, sortBy, sortDirection).pipe(
        map((response) => UserActions.loadUsersSuccess({ users: response.items, totalCount: response.totalCount })),
        catchError((error) => of(UserActions.loadUsersFailure({ error: error?.error?.detail ?? 'Failed to load users' })))
      )
    )
  ));

  loadUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.loadUser),
    switchMap(({ id }) =>
      this.userService.getUser(id).pipe(
        map((user) => UserActions.loadUserSuccess({ user })),
        catchError((error) => of(UserActions.loadUserFailure({ error: error?.error?.detail ?? 'Failed to load user' })))
      )
    )
  ));

  createUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.createUser),
    exhaustMap(({ request }) =>
      this.userService.createUser(request).pipe(
        map((user) => UserActions.createUserSuccess({ user })),
        catchError((error) => of(UserActions.createUserFailure({ error: error?.error?.detail ?? 'Failed to create user' })))
      )
    )
  ));

  createUserSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.createUserSuccess),
    tap(() => {
      this.notification.success('User created successfully');
      this.router.navigate(['/users']);
    })
  ), { dispatch: false });

  updateUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.updateUser),
    exhaustMap(({ id, request }) =>
      this.userService.updateUser(id, request).pipe(
        map((user) => UserActions.updateUserSuccess({ user })),
        catchError((error) => of(UserActions.updateUserFailure({ error: error?.error?.detail ?? 'Failed to update user' })))
      )
    )
  ));

  updateUserSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.updateUserSuccess),
    tap(() => this.notification.success('User updated successfully'))
  ), { dispatch: false });

  deactivateUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.deactivateUser),
    exhaustMap(({ id }) =>
      this.userService.deactivateUser(id).pipe(
        map(() => UserActions.deactivateUserSuccess({ id })),
        catchError((error) => of(UserActions.loadUsersFailure({ error: error?.error?.detail ?? 'Failed to deactivate user' })))
      )
    )
  ));

  deactivateUserSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.deactivateUserSuccess),
    tap(() => this.notification.success('User deactivated successfully'))
  ), { dispatch: false });

  activateUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.activateUser),
    exhaustMap(({ id }) =>
      this.userService.activateUser(id).pipe(
        map(() => UserActions.activateUserSuccess({ id })),
        catchError((error) => of(UserActions.loadUsersFailure({ error: error?.error?.detail ?? 'Failed to activate user' })))
      )
    )
  ));

  activateUserSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.activateUserSuccess),
    tap(() => this.notification.success('User activated successfully'))
  ), { dispatch: false });
}
