import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { OfficeService } from '../services/office.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { OfficeActions } from './office.actions';

@Injectable()
export class OfficeEffects {
  private readonly actions$ = inject(Actions);
  private readonly officeService = inject(OfficeService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loadOffices$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.loadOffices),
    switchMap(({ page, pageSize, search }) =>
      this.officeService.listOffices(page, pageSize, search).pipe(
        map((response) => OfficeActions.loadOfficesSuccess({ offices: response.items, totalCount: response.totalCount })),
        catchError((error) => of(OfficeActions.loadOfficesFailure({ error: error?.error?.detail ?? 'Failed to load offices' })))
      )
    )
  ));

  loadOffice$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.loadOffice),
    switchMap(({ id }) =>
      this.officeService.getOffice(id).pipe(
        map((office) => OfficeActions.loadOfficeSuccess({ office })),
        catchError((error) => of(OfficeActions.loadOfficeFailure({ error: error?.error?.detail ?? 'Failed to load office' })))
      )
    )
  ));

  createOffice$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.createOffice),
    exhaustMap(({ request }) =>
      this.officeService.createOffice(request).pipe(
        map((office) => OfficeActions.createOfficeSuccess({ office })),
        catchError((error) => of(OfficeActions.createOfficeFailure({ error: error?.error?.detail ?? 'Failed to create office' })))
      )
    )
  ));

  createOfficeSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.createOfficeSuccess),
    tap(() => {
      this.notification.success('Office created successfully');
      this.router.navigate(['/offices']);
    })
  ), { dispatch: false });

  updateOffice$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.updateOffice),
    exhaustMap(({ id, request }) =>
      this.officeService.updateOffice(id, request).pipe(
        map((office) => OfficeActions.updateOfficeSuccess({ office })),
        catchError((error) => of(OfficeActions.updateOfficeFailure({ error: error?.error?.detail ?? 'Failed to update office' })))
      )
    )
  ));

  updateOfficeSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.updateOfficeSuccess),
    tap(() => this.notification.success('Office updated successfully'))
  ), { dispatch: false });

  deleteOffice$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.deleteOffice),
    exhaustMap(({ id }) =>
      this.officeService.deleteOffice(id).pipe(
        map(() => OfficeActions.deleteOfficeSuccess({ id })),
        catchError((error) => of(OfficeActions.deleteOfficeFailure({ error: error?.error?.detail ?? 'Failed to delete office' })))
      )
    )
  ));

  deleteOfficeSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(OfficeActions.deleteOfficeSuccess),
    tap(() => this.notification.success('Office deleted successfully'))
  ), { dispatch: false });
}
