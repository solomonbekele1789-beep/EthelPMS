import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { WidgetService } from '../services/widget.service';
import { SavedFilterService } from '../services/saved-filter.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { DashboardActions } from './dashboards.actions';

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly dashboardService = inject(DashboardService);
  private readonly widgetService = inject(WidgetService);
  private readonly savedFilterService = inject(SavedFilterService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loadDashboards$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.loadDashboards),
    switchMap(() =>
      this.dashboardService.listDashboards().pipe(
        map((dashboards) => DashboardActions.loadDashboardsSuccess({ dashboards })),
        catchError((error) => of(DashboardActions.loadDashboardsFailure({ error: error?.error?.detail ?? 'Failed to load dashboards' })))
      )
    )
  ));

  loadDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.loadDashboard),
    switchMap(({ id }) =>
      this.dashboardService.getDashboard(id).pipe(
        map((dashboard) => DashboardActions.loadDashboardSuccess({ dashboard })),
        catchError((error) => of(DashboardActions.loadDashboardFailure({ error: error?.error?.detail ?? 'Failed to load dashboard' })))
      )
    )
  ));

  createDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.createDashboard),
    exhaustMap(({ request }) =>
      this.dashboardService.createDashboard(request).pipe(
        map((response) => DashboardActions.createDashboardSuccess({ id: response.id })),
        catchError((error) => of(DashboardActions.createDashboardFailure({ error: error?.error?.detail ?? 'Failed to create dashboard' })))
      )
    )
  ));

  createDashboardSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.createDashboardSuccess),
    tap(() => {
      this.notification.success('Dashboard created successfully');
      this.router.navigate(['/dashboards']);
    })
  ), { dispatch: false });

  updateDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.updateDashboard),
    exhaustMap(({ id, request }) =>
      this.dashboardService.updateDashboard(id, request).pipe(
        map(() => DashboardActions.updateDashboardSuccess()),
        catchError((error) => of(DashboardActions.updateDashboardFailure({ error: error?.error?.detail ?? 'Failed to update dashboard' })))
      )
    )
  ));

  updateDashboardSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.updateDashboardSuccess),
    tap(() => this.notification.success('Dashboard updated successfully'))
  ), { dispatch: false });

  deleteDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.deleteDashboard),
    exhaustMap(({ id }) =>
      this.dashboardService.deleteDashboard(id).pipe(
        map(() => DashboardActions.deleteDashboardSuccess({ id })),
        catchError((error) => of(DashboardActions.deleteDashboardFailure({ error: error?.error?.detail ?? 'Failed to delete dashboard' })))
      )
    )
  ));

  deleteDashboardSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.deleteDashboardSuccess),
    tap(() => this.notification.success('Dashboard deleted successfully'))
  ), { dispatch: false });

  // Widgets
  loadWidgets$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.loadWidgets),
    switchMap(({ dashboardId }) =>
      this.widgetService.listWidgets(dashboardId).pipe(
        map((widgets) => DashboardActions.loadWidgetsSuccess({ widgets })),
        catchError((error) => of(DashboardActions.loadWidgetsFailure({ error: error?.error?.detail ?? 'Failed to load widgets' })))
      )
    )
  ));

  addWidget$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.addWidget),
    exhaustMap(({ dashboardId, request }) =>
      this.widgetService.addWidget(dashboardId, request).pipe(
        map((response) => DashboardActions.addWidgetSuccess({ id: response.id, dashboardId })),
        catchError((error) => of(DashboardActions.addWidgetFailure({ error: error?.error?.detail ?? 'Failed to add widget' })))
      )
    )
  ));

  addWidgetSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.addWidgetSuccess),
    tap(() => this.notification.success('Widget added successfully')),
    map(({ dashboardId }) => DashboardActions.loadWidgets({ dashboardId }))
  ));

  updateWidget$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.updateWidget),
    exhaustMap(({ dashboardId, widgetId, request }) =>
      this.widgetService.updateWidget(dashboardId, widgetId, request).pipe(
        map(() => DashboardActions.updateWidgetSuccess({ dashboardId })),
        catchError((error) => of(DashboardActions.updateWidgetFailure({ error: error?.error?.detail ?? 'Failed to update widget' })))
      )
    )
  ));

  updateWidgetSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.updateWidgetSuccess),
    tap(() => this.notification.success('Widget updated successfully')),
    map(({ dashboardId }) => DashboardActions.loadWidgets({ dashboardId }))
  ));

  removeWidget$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.removeWidget),
    exhaustMap(({ dashboardId, widgetId }) =>
      this.widgetService.removeWidget(dashboardId, widgetId).pipe(
        map(() => DashboardActions.removeWidgetSuccess({ widgetId, dashboardId })),
        catchError((error) => of(DashboardActions.removeWidgetFailure({ error: error?.error?.detail ?? 'Failed to remove widget' })))
      )
    )
  ));

  removeWidgetSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.removeWidgetSuccess),
    tap(() => this.notification.success('Widget removed successfully'))
  ), { dispatch: false });

  // Saved Filters
  loadFilters$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.loadFilters),
    switchMap(({ module }) =>
      this.savedFilterService.listFilters(module).pipe(
        map((filters) => DashboardActions.loadFiltersSuccess({ filters })),
        catchError((error) => of(DashboardActions.loadFiltersFailure({ error: error?.error?.detail ?? 'Failed to load filters' })))
      )
    )
  ));

  createFilter$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.createFilter),
    exhaustMap(({ request }) =>
      this.savedFilterService.createFilter(request).pipe(
        map((response) => DashboardActions.createFilterSuccess({ id: response.id })),
        catchError((error) => of(DashboardActions.createFilterFailure({ error: error?.error?.detail ?? 'Failed to create filter' })))
      )
    )
  ));

  createFilterSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.createFilterSuccess),
    tap(() => this.notification.success('Filter saved successfully')),
    map(() => DashboardActions.loadFilters({}))
  ));

  deleteFilter$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.deleteFilter),
    exhaustMap(({ id }) =>
      this.savedFilterService.deleteFilter(id).pipe(
        map(() => DashboardActions.deleteFilterSuccess({ id })),
        catchError((error) => of(DashboardActions.deleteFilterFailure({ error: error?.error?.detail ?? 'Failed to delete filter' })))
      )
    )
  ));

  deleteFilterSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.deleteFilterSuccess),
    tap(() => this.notification.success('Filter deleted successfully'))
  ), { dispatch: false });
}
