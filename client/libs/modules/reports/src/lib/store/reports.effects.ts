import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from '@ethelpms/shared/ui';
import { ReportTemplateService } from '../services/report-template.service';
import { ReportScheduleService } from '../services/report-schedule.service';
import { GeneratedReportService } from '../services/generated-report.service';
import { ReportsActions } from './reports.actions';

@Injectable()
export class ReportsEffects {
  private readonly actions$ = inject(Actions);
  private readonly templateService = inject(ReportTemplateService);
  private readonly scheduleService = inject(ReportScheduleService);
  private readonly generatedService = inject(GeneratedReportService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Template Effects

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.loadTemplates),
    switchMap(({ module }) =>
      this.templateService.list(module).pipe(
        map((templates) => ReportsActions.loadTemplatesSuccess({ templates })),
        catchError((error) => of(ReportsActions.loadTemplatesFailure({ error: error?.error?.detail ?? 'Failed to load report templates' })))
      )
    )
  ));

  loadTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.loadTemplate),
    switchMap(({ id }) =>
      this.templateService.getById(id).pipe(
        map((template) => ReportsActions.loadTemplateSuccess({ template })),
        catchError((error) => of(ReportsActions.loadTemplateFailure({ error: error?.error?.detail ?? 'Failed to load report template' })))
      )
    )
  ));

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.createTemplate),
    exhaustMap(({ request }) =>
      this.templateService.create(request).pipe(
        map((response) => ReportsActions.createTemplateSuccess({ id: response.id })),
        catchError((error) => of(ReportsActions.createTemplateFailure({ error: error?.error?.detail ?? 'Failed to create report template' })))
      )
    )
  ));

  createTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.createTemplateSuccess),
    tap(() => {
      this.notification.success('Report template created successfully');
      this.router.navigate(['/reports/templates']);
    })
  ), { dispatch: false });

  updateTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.updateTemplate),
    exhaustMap(({ id, request }) =>
      this.templateService.update(id, request).pipe(
        map(() => ReportsActions.updateTemplateSuccess()),
        catchError((error) => of(ReportsActions.updateTemplateFailure({ error: error?.error?.detail ?? 'Failed to update report template' })))
      )
    )
  ));

  updateTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.updateTemplateSuccess),
    tap(() => this.notification.success('Report template updated successfully'))
  ), { dispatch: false });

  deleteTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.deleteTemplate),
    exhaustMap(({ id }) =>
      this.templateService.delete(id).pipe(
        map(() => ReportsActions.deleteTemplateSuccess({ id })),
        catchError((error) => of(ReportsActions.deleteTemplateFailure({ error: error?.error?.detail ?? 'Failed to delete report template' })))
      )
    )
  ));

  deleteTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.deleteTemplateSuccess),
    tap(() => this.notification.success('Report template deleted successfully'))
  ), { dispatch: false });

  // Schedule Effects

  loadSchedules$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.loadSchedules),
    switchMap(() =>
      this.scheduleService.list().pipe(
        map((schedules) => ReportsActions.loadSchedulesSuccess({ schedules })),
        catchError((error) => of(ReportsActions.loadSchedulesFailure({ error: error?.error?.detail ?? 'Failed to load report schedules' })))
      )
    )
  ));

  createSchedule$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.createSchedule),
    exhaustMap(({ request }) =>
      this.scheduleService.create(request).pipe(
        map((response) => ReportsActions.createScheduleSuccess({ id: response.id })),
        catchError((error) => of(ReportsActions.createScheduleFailure({ error: error?.error?.detail ?? 'Failed to create report schedule' })))
      )
    )
  ));

  createScheduleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.createScheduleSuccess),
    tap(() => this.notification.success('Report schedule created successfully')),
    map(() => ReportsActions.loadSchedules())
  ));

  updateSchedule$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.updateSchedule),
    exhaustMap(({ id, request }) =>
      this.scheduleService.update(id, request).pipe(
        map(() => ReportsActions.updateScheduleSuccess()),
        catchError((error) => of(ReportsActions.updateScheduleFailure({ error: error?.error?.detail ?? 'Failed to update report schedule' })))
      )
    )
  ));

  updateScheduleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.updateScheduleSuccess),
    tap(() => this.notification.success('Report schedule updated successfully')),
    map(() => ReportsActions.loadSchedules())
  ));

  deleteSchedule$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.deleteSchedule),
    exhaustMap(({ id }) =>
      this.scheduleService.delete(id).pipe(
        map(() => ReportsActions.deleteScheduleSuccess({ id })),
        catchError((error) => of(ReportsActions.deleteScheduleFailure({ error: error?.error?.detail ?? 'Failed to delete report schedule' })))
      )
    )
  ));

  deleteScheduleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.deleteScheduleSuccess),
    tap(() => this.notification.success('Report schedule deleted successfully'))
  ), { dispatch: false });

  // Generated Report Effects

  loadGeneratedReports$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.loadGeneratedReports),
    switchMap(({ templateId, dateFrom, dateTo }) =>
      this.generatedService.list(templateId, dateFrom, dateTo).pipe(
        map((reports) => ReportsActions.loadGeneratedReportsSuccess({ reports })),
        catchError((error) => of(ReportsActions.loadGeneratedReportsFailure({ error: error?.error?.detail ?? 'Failed to load generated reports' })))
      )
    )
  ));

  loadGeneratedReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.loadGeneratedReport),
    switchMap(({ id }) =>
      this.generatedService.getById(id).pipe(
        map((report) => ReportsActions.loadGeneratedReportSuccess({ report })),
        catchError((error) => of(ReportsActions.loadGeneratedReportFailure({ error: error?.error?.detail ?? 'Failed to load generated report' })))
      )
    )
  ));

  generateReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.generateReport),
    exhaustMap(({ request }) =>
      this.generatedService.generate(request).pipe(
        map((response) => ReportsActions.generateReportSuccess({ id: response.id })),
        catchError((error) => of(ReportsActions.generateReportFailure({ error: error?.error?.detail ?? 'Failed to generate report' })))
      )
    )
  ));

  generateReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.generateReportSuccess),
    tap(() => {
      this.notification.success('Report generated successfully');
      this.router.navigate(['/reports/generated']);
    })
  ), { dispatch: false });

  shareReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.shareReport),
    exhaustMap(({ id, request }) =>
      this.generatedService.share(id, request).pipe(
        map(() => ReportsActions.shareReportSuccess()),
        catchError((error) => of(ReportsActions.shareReportFailure({ error: error?.error?.detail ?? 'Failed to share report' })))
      )
    )
  ));

  shareReportSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.shareReportSuccess),
    tap(() => this.notification.success('Report shared successfully'))
  ), { dispatch: false });
}
