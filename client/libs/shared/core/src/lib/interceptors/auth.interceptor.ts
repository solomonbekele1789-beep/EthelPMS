import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const SKIP_AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/forgot-password'];

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  if (SKIP_AUTH_URLS.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getAccessToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        return handleTokenRefresh(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    }

    return authService.refreshToken(refreshToken).pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` },
          })
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        return throwError(() => err);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) =>
      next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      )
    )
  );
}
