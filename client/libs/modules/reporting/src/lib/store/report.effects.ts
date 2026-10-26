import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReportService } from '../services/report.service';
import { ReportTemplateService } from '../services/report-template.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { ReportActions } from './report.actions';

@Injectable()
export class ReportEffects {
  private readonly actions$ = inject(Actions);
  private readonly reportService = inject(ReportService);
  private readonly reportTemplateService = inject(ReportTemplateService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loadReports$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.loadReports),
    switchMap(({ page, pageSize, projectId, reportType, status }) =>
      this.reportService.listReports({ projectId, reportType, status, page, pageSize }).pipe(
        map((response) => ReportActions.loadReportsSuccess({ reports: response.items, totalCount: response.totalCount })),
        catchError((error) => of(ReportActions.loadReportsFailure({ error: error?.error?.detail ?? 'Failed to load reports' })))
      )
    )
  ));

  loadReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.loadReport),
    switchMap(({ id }) =>
      this.reportService.getReport(id).pipe(
        map((report) => ReportActions.loadReportSuccess({ report })),
        catchError((error) => of(ReportActions.loadReportFailure({ error: error?.error?.detail ?? 'Failed to load report' })))
      )
    )
  ));

  createReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.createReport),
    exhaustMap(({ request }) =>
      this.reportService.createReport(request).pipe(
        map((response) => ReportActions.createReportSuccess({ id: response.id })),
        catchError((error) => of(ReportActions.createReportFailure({ error: error?.error?.detail ?? 'Failed to create report' })))
      )
    )
  ));

  createReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.createReportSuccess),
    tap(() => {
      this.notification.success('Report created successfully');
      this.router.navigate(['/reporting']);
    })
  ), { dispatch: false });

  updateReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.updateReport),
    exhaustMap(({ id, request }) =>
      this.reportService.updateReport(id, request).pipe(
        map(() => ReportActions.updateReportSuccess()),
        catchError((error) => of(ReportActions.updateReportFailure({ error: error?.error?.detail ?? 'Failed to update report' })))
      )
    )
  ));

  updateReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.updateReportSuccess),
    tap(() => this.notification.success('Report updated successfully'))
  ), { dispatch: false });

  submitReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.submitReport),
    exhaustMap(({ id }) =>
      this.reportService.submitReport(id).pipe(
        map(() => ReportActions.submitReportSuccess({ id })),
        catchError((error) => of(ReportActions.submitReportFailure({ error: error?.error?.detail ?? 'Failed to submit report' })))
      )
    )
  ));

  submitReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.submitReportSuccess),
    tap(({ id }) => {
      this.notification.success('Report submitted successfully');
    }),
    map(({ id }) => ReportActions.loadReport({ id }))
  ));

  approveReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.approveReport),
    exhaustMap(({ id, request }) =>
      this.reportService.approveReport(id, request).pipe(
        map(() => ReportActions.approveReportSuccess({ id })),
        catchError((error) => of(ReportActions.approveReportFailure({ error: error?.error?.detail ?? 'Failed to approve report' })))
      )
    )
  ));

  approveReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.approveReportSuccess),
    tap(({ id }) => {
      this.notification.success('Report approved successfully');
    }),
    map(({ id }) => ReportActions.loadReport({ id }))
  ));

  rejectReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.rejectReport),
    exhaustMap(({ id, request }) =>
      this.reportService.rejectReport(id, request).pipe(
        map(() => ReportActions.rejectReportSuccess({ id })),
        catchError((error) => of(ReportActions.rejectReportFailure({ error: error?.error?.detail ?? 'Failed to reject report' })))
      )
    )
  ));

  rejectReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.rejectReportSuccess),
    tap(({ id }) => {
      this.notification.success('Report rejected successfully');
    }),
    map(({ id }) => ReportActions.loadReport({ id }))
  ));

  loadApprovalHistory$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.loadApprovalHistory),
    switchMap(({ id }) =>
      this.reportService.getApprovalHistory(id).pipe(
        map((approvals) => ReportActions.loadApprovalHistorySuccess({ approvals })),
        catchError((error) => of(ReportActions.loadApprovalHistoryFailure({ error: error?.error?.detail ?? 'Failed to load approval history' })))
      )
    )
  ));

  loadFinancialSummary$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.loadFinancialSummary),
    switchMap(({ projectId, fiscalYear }) =>
      this.reportService.getFinancialSummary(projectId, fiscalYear).pipe(
        map((summary) => ReportActions.loadFinancialSummarySuccess({ summary })),
        catchError((error) => of(ReportActions.loadFinancialSummaryFailure({ error: error?.error?.detail ?? 'Failed to load financial summary' })))
      )
    )
  ));

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.loadTemplates),
    switchMap(({ reportType }) =>
      this.reportTemplateService.listTemplates(reportType).pipe(
        map((templates) => ReportActions.loadTemplatesSuccess({ templates })),
        catchError((error) => of(ReportActions.loadTemplatesFailure({ error: error?.error?.detail ?? 'Failed to load templates' })))
      )
    )
  ));

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.createTemplate),
    exhaustMap(({ request }) =>
      this.reportTemplateService.createTemplate(request).pipe(
        map((response) => ReportActions.createTemplateSuccess({ id: response.id })),
        catchError((error) => of(ReportActions.createTemplateFailure({ error: error?.error?.detail ?? 'Failed to create template' })))
      )
    )
  ));

  createTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.createTemplateSuccess),
    tap(() => {
      this.notification.success('Template created successfully');
    }),
    map(() => ReportActions.loadTemplates({}))
  ));

  updateTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.updateTemplate),
    exhaustMap(({ id, request }) =>
      this.reportTemplateService.updateTemplate(id, request).pipe(
        map(() => ReportActions.updateTemplateSuccess()),
        catchError((error) => of(ReportActions.updateTemplateFailure({ error: error?.error?.detail ?? 'Failed to update template' })))
      )
    )
  ));

  updateTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportActions.updateTemplateSuccess),
    tap(() => this.notification.success('Template updated successfully'))
  ), { dispatch: false });
}
