import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from '@ethelpms/shared/ui';
import { SubGranteeService } from '../services/sub-grantee.service';
import { DisbursementService } from '../services/disbursement.service';
import { PartnerReportService } from '../services/partner-report.service';
import { ComplianceService } from '../services/compliance.service';
import { PartnershipDashboardService } from '../services/partnership-dashboard.service';
import { PartnershipsActions } from './partnerships.actions';

@Injectable()
export class PartnershipsEffects {
  private readonly actions$ = inject(Actions);
  private readonly subGranteeService = inject(SubGranteeService);
  private readonly disbursementService = inject(DisbursementService);
  private readonly reportService = inject(PartnerReportService);
  private readonly complianceService = inject(ComplianceService);
  private readonly dashboardService = inject(PartnershipDashboardService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Sub-Grantees

  loadSubGrantees$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.loadSubGrantees),
    switchMap(({ status, partnerType }) =>
      this.subGranteeService.list({ status, partnerType }).pipe(
        map((subGrantees) => PartnershipsActions.loadSubGranteesSuccess({ subGrantees })),
        catchError((error) => of(PartnershipsActions.loadSubGranteesFailure({ error: error?.error?.detail ?? 'Failed to load partners' })))
      )
    )
  ));

  loadSubGrantee$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.loadSubGrantee),
    switchMap(({ id }) =>
      this.subGranteeService.get(id).pipe(
        map((subGrantee) => PartnershipsActions.loadSubGranteeSuccess({ subGrantee })),
        catchError((error) => of(PartnershipsActions.loadSubGranteeFailure({ error: error?.error?.detail ?? 'Failed to load partner' })))
      )
    )
  ));

  registerSubGrantee$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.registerSubGrantee),
    exhaustMap(({ request }) =>
      this.subGranteeService.register(request).pipe(
        map((response) => PartnershipsActions.registerSubGranteeSuccess({ id: response.id })),
        catchError((error) => of(PartnershipsActions.registerSubGranteeFailure({ error: error?.error?.detail ?? 'Failed to register partner' })))
      )
    )
  ));

  registerSubGranteeSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.registerSubGranteeSuccess),
    tap(() => {
      this.notification.success('Partner registered successfully');
      this.router.navigate(['/partnerships/partners']);
    })
  ), { dispatch: false });

  // Disbursements

  loadDisbursements$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.loadDisbursements),
    switchMap(({ subGranteeId }) =>
      this.disbursementService.list({ subGranteeId }).pipe(
        map((disbursements) => PartnershipsActions.loadDisbursementsSuccess({ disbursements })),
        catchError((error) => of(PartnershipsActions.loadDisbursementsFailure({ error: error?.error?.detail ?? 'Failed to load disbursements' })))
      )
    )
  ));

  createDisbursement$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.createDisbursement),
    exhaustMap(({ request }) =>
      this.disbursementService.create(request).pipe(
        map((response) => PartnershipsActions.createDisbursementSuccess({ id: response.id })),
        catchError((error) => of(PartnershipsActions.createDisbursementFailure({ error: error?.error?.detail ?? 'Failed to create disbursement' })))
      )
    )
  ));

  createDisbursementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.createDisbursementSuccess),
    tap(() => {
      this.notification.success('Disbursement created successfully');
    })
  ), { dispatch: false });

  // Reports

  loadReports$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.loadReports),
    switchMap(({ subGranteeId, status }) =>
      this.reportService.list({ subGranteeId, status }).pipe(
        map((reports) => PartnershipsActions.loadReportsSuccess({ reports })),
        catchError((error) => of(PartnershipsActions.loadReportsFailure({ error: error?.error?.detail ?? 'Failed to load reports' })))
      )
    )
  ));

  loadReport$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.loadReport),
    switchMap(({ id }) =>
      this.reportService.getById(id).pipe(
        map((report) => PartnershipsActions.loadReportSuccess({ report })),
        catchError((error) => of(PartnershipsActions.loadReportFailure({ error: error?.error?.detail ?? 'Failed to load report' })))
      )
    )
  ));

  createReport$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.createReport),
    exhaustMap(({ request }) =>
      this.reportService.create(request).pipe(
        map((response) => PartnershipsActions.createReportSuccess({ id: response.id })),
        catchError((error) => of(PartnershipsActions.createReportFailure({ error: error?.error?.detail ?? 'Failed to create report' })))
      )
    )
  ));

  createReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.createReportSuccess),
    tap(() => {
      this.notification.success('Report created successfully');
    })
  ), { dispatch: false });

  // Compliance

  loadComplianceChecks$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.loadComplianceChecks),
    switchMap(({ subGranteeId }) =>
      this.complianceService.list({ subGranteeId }).pipe(
        map((complianceChecks) => PartnershipsActions.loadComplianceChecksSuccess({ complianceChecks })),
        catchError((error) => of(PartnershipsActions.loadComplianceChecksFailure({ error: error?.error?.detail ?? 'Failed to load compliance checks' })))
      )
    )
  ));

  createComplianceCheck$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.createComplianceCheck),
    exhaustMap(({ request }) =>
      this.complianceService.create(request).pipe(
        map((response) => PartnershipsActions.createComplianceCheckSuccess({ id: response.id })),
        catchError((error) => of(PartnershipsActions.createComplianceCheckFailure({ error: error?.error?.detail ?? 'Failed to create compliance check' })))
      )
    )
  ));

  createComplianceCheckSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.createComplianceCheckSuccess),
    tap(() => {
      this.notification.success('Compliance check created successfully');
    })
  ), { dispatch: false });

  // Dashboard

  loadDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(PartnershipsActions.loadDashboard),
    switchMap(() =>
      this.dashboardService.getDashboard().pipe(
        map((dashboard) => PartnershipsActions.loadDashboardSuccess({ dashboard })),
        catchError((error) => of(PartnershipsActions.loadDashboardFailure({ error: error?.error?.detail ?? 'Failed to load dashboard' })))
      )
    )
  ));
}
