import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/pagination.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error as Record<string, unknown> | null;
      let detail =
        (body?.['detail'] as string) ??
        (body?.['message'] as string) ??
        (body?.['Message'] as string);

      if (body?.['errors'] && typeof body['errors'] === 'object') {
        const errorsObj = body['errors'] as Record<string, unknown>;
        const errorList: string[] = [];
        for (const [key, val] of Object.entries(errorsObj)) {
          if (Array.isArray(val)) {
            errorList.push(...val.map((v) => String(v)));
          } else if (typeof val === 'string') {
            errorList.push(val);
          }
        }
        if (errorList.length > 0) {
          detail = errorList.join(' | ');
        }
      }

      if (!detail && body?.['title'] && typeof body['title'] === 'string') {
        detail = body['title'];
      }

      switch (error.status) {
        case 0:
          snackBar.open('Unable to connect to server. Please check your connection.', 'Dismiss', {
            duration: 5000,
            panelClass: 'snackbar-error',
          });
          break;

        case 400:
          snackBar.open(detail ?? 'Validation failed. Please check your input.', 'Dismiss', {
            duration: 4000,
            panelClass: 'snackbar-warning',
          });
          break;

        case 401:
          router.navigate(['/auth/login']);
          break;

        case 403:
          snackBar.open('You do not have permission to perform this action.', 'Dismiss', {
            duration: 4000,
            panelClass: 'snackbar-warning',
          });
          router.navigate(['/unauthorized']);
          break;

        case 404:
          snackBar.open(detail ?? 'The requested resource was not found.', 'Dismiss', {
            duration: 4000,
            panelClass: 'snackbar-warning',
          });
          break;

        case 409:
          snackBar.open(detail ?? 'A conflict occurred. Please try again.', 'Dismiss', {
            duration: 4000,
            panelClass: 'snackbar-warning',
          });
          break;

        case 422:
          snackBar.open(detail ?? 'Validation failed. Please check your input.', 'Dismiss', {
            duration: 4000,
            panelClass: 'snackbar-warning',
          });
          break;

        default:
          snackBar.open('An unexpected server error occurred. Please try again later.', 'Dismiss', {
            duration: 5000,
            panelClass: 'snackbar-error',
          });
          break;
      }

      return throwError(() => error);
    })
  );
};
