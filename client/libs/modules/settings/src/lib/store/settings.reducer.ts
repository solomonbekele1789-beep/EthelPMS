import { createReducer, on } from '@ngrx/store';
import { SystemSettingDto } from '../models/system-setting.model';
import { OrgSettingDto } from '../models/org-setting.model';
import { ApprovalConfigDto } from '../models/approval-config.model';
import { AlertThresholdDto } from '../models/alert-threshold.model';
import { SettingsActions } from './settings.actions';

export const SETTINGS_FEATURE_KEY = 'settings';

export interface SettingsState {
  systemSettings: SystemSettingDto[];
  orgSettings: OrgSettingDto[];
  approvalConfigs: ApprovalConfigDto[];
  alertThresholds: AlertThresholdDto[];
  loading: boolean;
  error: string | null;
}

export const initialSettingsState: SettingsState = {
  systemSettings: [],
  orgSettings: [],
  approvalConfigs: [],
  alertThresholds: [],
  loading: false,
  error: null,
};

export const settingsReducer = createReducer(
  initialSettingsState,

  // System Settings
  on(SettingsActions.loadSystemSettings, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SettingsActions.loadSystemSettingsSuccess, (state, { systemSettings }) => ({
    ...state,
    systemSettings,
    loading: false,
  })),
  on(SettingsActions.loadSystemSettingsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(SettingsActions.updateSystemSetting, (state) => ({
    ...state,
    loading: true,
  })),
  on(SettingsActions.updateSystemSettingSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SettingsActions.updateSystemSettingFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Org Settings
  on(SettingsActions.loadOrgSettings, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SettingsActions.loadOrgSettingsSuccess, (state, { orgSettings }) => ({
    ...state,
    orgSettings,
    loading: false,
  })),
  on(SettingsActions.loadOrgSettingsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(SettingsActions.upsertOrgSetting, (state) => ({
    ...state,
    loading: true,
  })),
  on(SettingsActions.upsertOrgSettingSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SettingsActions.upsertOrgSettingFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Approval Configs
  on(SettingsActions.loadApprovalConfigs, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SettingsActions.loadApprovalConfigsSuccess, (state, { approvalConfigs }) => ({
    ...state,
    approvalConfigs,
    loading: false,
  })),
  on(SettingsActions.loadApprovalConfigsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(SettingsActions.createApprovalConfig, (state) => ({
    ...state,
    loading: true,
  })),
  on(SettingsActions.createApprovalConfigSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SettingsActions.createApprovalConfigFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(SettingsActions.updateApprovalConfig, (state) => ({
    ...state,
    loading: true,
  })),
  on(SettingsActions.updateApprovalConfigSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SettingsActions.updateApprovalConfigFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Alert Thresholds
  on(SettingsActions.loadAlertThresholds, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SettingsActions.loadAlertThresholdsSuccess, (state, { alertThresholds }) => ({
    ...state,
    alertThresholds,
    loading: false,
  })),
  on(SettingsActions.loadAlertThresholdsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(SettingsActions.createAlertThreshold, (state) => ({
    ...state,
    loading: true,
  })),
  on(SettingsActions.createAlertThresholdSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SettingsActions.createAlertThresholdFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(SettingsActions.updateAlertThreshold, (state) => ({
    ...state,
    loading: true,
  })),
  on(SettingsActions.updateAlertThresholdSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SettingsActions.updateAlertThresholdFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(SettingsActions.deleteAlertThreshold, (state) => ({
    ...state,
    loading: true,
  })),
  on(SettingsActions.deleteAlertThresholdSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SettingsActions.deleteAlertThresholdFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
