import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const SKIP_AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password', '/auth/setup-password'];

function generateCorrelationId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  const headers: Record<string, string> = {
    'X-Correlation-ID': generateCorrelationId(),
    'X-Client-Type': 'web',
  };

  if (SKIP_AUTH_URLS.some((url) => req.url.includes(url))) {
    return next(req.clone({ withCredentials: true, setHeaders: headers }));
  }

  const token = authService.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: headers,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
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

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        const newToken = response.accessToken ?? 'cookie-refreshed';
        refreshTokenSubject.next(newToken);
        return next(
          response.accessToken
            ? req.clone({
                withCredentials: true,
                setHeaders: { Authorization: `Bearer ${response.accessToken}` },
              })
            : req.clone({ withCredentials: true })
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
        token && token !== 'cookie-refreshed'
          ? req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${token}` },
            })
          : req.clone({ withCredentials: true })
      )
    )
  );
}
