import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from '@ethelpms/shared/ui';
import { SystemSettingService } from '../services/system-setting.service';
import { OrgSettingService } from '../services/org-setting.service';
import { ApprovalConfigService } from '../services/approval-config.service';
import { AlertThresholdService } from '../services/alert-threshold.service';
import { SettingsActions } from './settings.actions';

@Injectable()
export class SettingsEffects {
  private readonly actions$ = inject(Actions);
  private readonly systemSettingService = inject(SystemSettingService);
  private readonly orgSettingService = inject(OrgSettingService);
  private readonly approvalConfigService = inject(ApprovalConfigService);
  private readonly alertThresholdService = inject(AlertThresholdService);
  private readonly notification = inject(NotificationService);

  // System Settings
  loadSystemSettings$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.loadSystemSettings),
    switchMap(({ category }) =>
      this.systemSettingService.listSystemSettings(category).pipe(
        map((systemSettings) => SettingsActions.loadSystemSettingsSuccess({ systemSettings })),
        catchError((error) => of(SettingsActions.loadSystemSettingsFailure({ error: error?.error?.detail ?? 'Failed to load system settings' })))
      )
    )
  ));

  updateSystemSetting$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.updateSystemSetting),
    exhaustMap(({ key, request }) =>
      this.systemSettingService.updateSystemSetting(key, request).pipe(
        map(() => SettingsActions.updateSystemSettingSuccess()),
        catchError((error) => of(SettingsActions.updateSystemSettingFailure({ error: error?.error?.detail ?? 'Failed to update system setting' })))
      )
    )
  ));

  updateSystemSettingSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.updateSystemSettingSuccess),
    tap(() => this.notification.success('System setting updated successfully')),
    map(() => SettingsActions.loadSystemSettings({}))
  ));

  // Org Settings
  loadOrgSettings$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.loadOrgSettings),
    switchMap(({ module, category }) =>
      this.orgSettingService.listOrgSettings(module, category).pipe(
        map((orgSettings) => SettingsActions.loadOrgSettingsSuccess({ orgSettings })),
        catchError((error) => of(SettingsActions.loadOrgSettingsFailure({ error: error?.error?.detail ?? 'Failed to load org settings' })))
      )
    )
  ));

  upsertOrgSetting$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.upsertOrgSetting),
    exhaustMap(({ request }) =>
      this.orgSettingService.upsertOrgSetting(request).pipe(
        map((response) => SettingsActions.upsertOrgSettingSuccess({ id: response.id })),
        catchError((error) => of(SettingsActions.upsertOrgSettingFailure({ error: error?.error?.detail ?? 'Failed to save org setting' })))
      )
    )
  ));

  upsertOrgSettingSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.upsertOrgSettingSuccess),
    tap(() => this.notification.success('Organization setting saved successfully')),
    map(() => SettingsActions.loadOrgSettings({}))
  ));

  // Approval Configs
  loadApprovalConfigs$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.loadApprovalConfigs),
    switchMap(({ module }) =>
      this.approvalConfigService.listApprovalConfigs(module).pipe(
        map((approvalConfigs) => SettingsActions.loadApprovalConfigsSuccess({ approvalConfigs })),
        catchError((error) => of(SettingsActions.loadApprovalConfigsFailure({ error: error?.error?.detail ?? 'Failed to load approval configs' })))
      )
    )
  ));

  createApprovalConfig$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.createApprovalConfig),
    exhaustMap(({ request }) =>
      this.approvalConfigService.createApprovalConfig(request).pipe(
        map((response) => SettingsActions.createApprovalConfigSuccess({ id: response.id })),
        catchError((error) => of(SettingsActions.createApprovalConfigFailure({ error: error?.error?.detail ?? 'Failed to create approval config' })))
      )
    )
  ));

  createApprovalConfigSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.createApprovalConfigSuccess),
    tap(() => this.notification.success('Approval config created successfully')),
    map(() => SettingsActions.loadApprovalConfigs({}))
  ));

  updateApprovalConfig$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.updateApprovalConfig),
    exhaustMap(({ id, request }) =>
      this.approvalConfigService.updateApprovalConfig(id, request).pipe(
        map(() => SettingsActions.updateApprovalConfigSuccess()),
        catchError((error) => of(SettingsActions.updateApprovalConfigFailure({ error: error?.error?.detail ?? 'Failed to update approval config' })))
      )
    )
  ));

  updateApprovalConfigSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.updateApprovalConfigSuccess),
    tap(() => this.notification.success('Approval config updated successfully')),
    map(() => SettingsActions.loadApprovalConfigs({}))
  ));

  // Alert Thresholds
  loadAlertThresholds$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.loadAlertThresholds),
    switchMap(({ module }) =>
      this.alertThresholdService.listAlertThresholds(module).pipe(
        map((alertThresholds) => SettingsActions.loadAlertThresholdsSuccess({ alertThresholds })),
        catchError((error) => of(SettingsActions.loadAlertThresholdsFailure({ error: error?.error?.detail ?? 'Failed to load alert thresholds' })))
      )
    )
  ));

  createAlertThreshold$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.createAlertThreshold),
    exhaustMap(({ request }) =>
      this.alertThresholdService.createAlertThreshold(request).pipe(
        map((response) => SettingsActions.createAlertThresholdSuccess({ id: response.id })),
        catchError((error) => of(SettingsActions.createAlertThresholdFailure({ error: error?.error?.detail ?? 'Failed to create alert threshold' })))
      )
    )
  ));

  createAlertThresholdSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.createAlertThresholdSuccess),
    tap(() => this.notification.success('Alert threshold created successfully')),
    map(() => SettingsActions.loadAlertThresholds({}))
  ));

  updateAlertThreshold$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.updateAlertThreshold),
    exhaustMap(({ id, request }) =>
      this.alertThresholdService.updateAlertThreshold(id, request).pipe(
        map(() => SettingsActions.updateAlertThresholdSuccess()),
        catchError((error) => of(SettingsActions.updateAlertThresholdFailure({ error: error?.error?.detail ?? 'Failed to update alert threshold' })))
      )
    )
  ));

  updateAlertThresholdSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.updateAlertThresholdSuccess),
    tap(() => this.notification.success('Alert threshold updated successfully')),
    map(() => SettingsActions.loadAlertThresholds({}))
  ));

  deleteAlertThreshold$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.deleteAlertThreshold),
    exhaustMap(({ id }) =>
      this.alertThresholdService.deleteAlertThreshold(id).pipe(
        map(() => SettingsActions.deleteAlertThresholdSuccess()),
        catchError((error) => of(SettingsActions.deleteAlertThresholdFailure({ error: error?.error?.detail ?? 'Failed to delete alert threshold' })))
      )
    )
  ));

  deleteAlertThresholdSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SettingsActions.deleteAlertThresholdSuccess),
    tap(() => this.notification.success('Alert threshold deleted successfully')),
    map(() => SettingsActions.loadAlertThresholds({}))
  ));
}
