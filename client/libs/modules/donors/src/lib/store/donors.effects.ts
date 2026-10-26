import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DonorService } from '../services/donor.service';
import { GrantService } from '../services/grant.service';
import { DonorsActions } from './donors.actions';

@Injectable()
export class DonorsEffects {
  private readonly actions$ = inject(Actions);
  private readonly donorService = inject(DonorService);
  private readonly grantService = inject(GrantService);

  loadDonors$ = createEffect(() => this.actions$.pipe(
    ofType(DonorsActions.loadDonors),
    switchMap(({ page, pageSize, isActive, search }) =>
      this.donorService.listDonors({ page, pageSize, isActive, search }).pipe(
        map((response) => DonorsActions.loadDonorsSuccess({ donors: response.items, totalCount: response.totalCount })),
        catchError((error) => of(DonorsActions.loadDonorsFailure({ error: error?.error?.detail ?? 'Failed to load donors' })))
      )
    )
  ));

  loadDonor$ = createEffect(() => this.actions$.pipe(
    ofType(DonorsActions.loadDonor),
    switchMap(({ id }) =>
      this.donorService.getDonor(id).pipe(
        map((donor) => DonorsActions.loadDonorSuccess({ donor })),
        catchError((error) => of(DonorsActions.loadDonorFailure({ error: error?.error?.detail ?? 'Failed to load donor' })))
      )
    )
  ));

  createDonor$ = createEffect(() => this.actions$.pipe(
    ofType(DonorsActions.createDonor),
    exhaustMap(({ request }) =>
      this.donorService.createDonor(request).pipe(
        map((response) => DonorsActions.createDonorSuccess({ id: response.id })),
        catchError((error) => of(DonorsActions.createDonorFailure({ error: error?.error?.detail ?? 'Failed to create donor' })))
      )
    )
  ));

  loadGrants$ = createEffect(() => this.actions$.pipe(
    ofType(DonorsActions.loadGrants),
    switchMap(({ page, pageSize, donorId, status, projectId }) =>
      this.grantService.listGrants({ page, pageSize, donorId, status, projectId }).pipe(
        map((response) => DonorsActions.loadGrantsSuccess({ grants: response.items, totalCount: response.totalCount })),
        catchError((error) => of(DonorsActions.loadGrantsFailure({ error: error?.error?.detail ?? 'Failed to load grants' })))
      )
    )
  ));

  loadGrant$ = createEffect(() => this.actions$.pipe(
    ofType(DonorsActions.loadGrant),
    switchMap(({ id }) =>
      this.grantService.getGrant(id).pipe(
        map((grant) => DonorsActions.loadGrantSuccess({ grant })),
        catchError((error) => of(DonorsActions.loadGrantFailure({ error: error?.error?.detail ?? 'Failed to load grant' })))
      )
    )
  ));

  createGrant$ = createEffect(() => this.actions$.pipe(
    ofType(DonorsActions.createGrant),
    exhaustMap(({ request }) =>
      this.grantService.createGrant(request).pipe(
        map((response) => DonorsActions.createGrantSuccess({ id: response.id })),
        catchError((error) => of(DonorsActions.createGrantFailure({ error: error?.error?.detail ?? 'Failed to create grant' })))
      )
    )
  ));

  loadComplianceDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(DonorsActions.loadComplianceDashboard),
    switchMap(() =>
      this.grantService.getComplianceDashboard().pipe(
        map((items) => DonorsActions.loadComplianceDashboardSuccess({ items })),
        catchError((error) => of(DonorsActions.loadComplianceDashboardFailure({ error: error?.error?.detail ?? 'Failed to load compliance dashboard' })))
      )
    )
  ));
}
