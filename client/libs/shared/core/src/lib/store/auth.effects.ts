import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthActions } from './auth.actions';

export const login$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ credentials }) =>
        authService.login(credentials).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error?.error?.detail ?? 'Login failed. Please try again.' }))
          )
        )
      )
    ),
  { functional: true }
);

export const loginSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => router.navigate(['/']))
    ),
  { functional: true, dispatch: false }
);

export const logout$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    ),
  { functional: true }
);

export const logoutSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => router.navigate(['/auth/login']))
    ),
  { functional: true, dispatch: false }
);

export const restoreSession$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.restoreSession),
      exhaustMap(() => {
        const token = authService.getAccessToken();
        if (!token || authService.isTokenExpired(token)) {
          return of(AuthActions.restoreSessionFailure());
        }
        return authService.getProfile().pipe(
          map((user) => AuthActions.restoreSessionSuccess({ user })),
          catchError(() => of(AuthActions.restoreSessionFailure()))
        );
      })
    ),
  { functional: true }
);

export const refreshToken$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.refreshToken),
      exhaustMap(({ refreshToken }) =>
        authService.refreshToken(refreshToken).pipe(
          map((response) => AuthActions.refreshTokenSuccess({ response })),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    ),
  { functional: true }
);

/** Aggregated auth effects for provideEffects() */
export const authEffects = {
  login$,
  loginSuccess$,
  logout$,
  logoutSuccess$,
  restoreSession$,
  refreshToken$,
};
