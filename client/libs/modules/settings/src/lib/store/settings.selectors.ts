import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SettingsState, SETTINGS_FEATURE_KEY } from './settings.reducer';

export const selectSettingsState = createFeatureSelector<SettingsState>(SETTINGS_FEATURE_KEY);

export const selectSystemSettings = createSelector(selectSettingsState, (state) => state.systemSettings);

export const selectOrgSettings = createSelector(selectSettingsState, (state) => state.orgSettings);

export const selectApprovalConfigs = createSelector(selectSettingsState, (state) => state.approvalConfigs);

export const selectAlertThresholds = createSelector(selectSettingsState, (state) => state.alertThresholds);

export const selectSettingsLoading = createSelector(selectSettingsState, (state) => state.loading);

export const selectSettingsError = createSelector(selectSettingsState, (state) => state.error);

export const selectSystemSettingsByCategory = (category: string) =>
  createSelector(selectSystemSettings, (settings) =>
    settings.filter((s) => s.category === category)
  );

export const selectSystemSettingCategories = createSelector(selectSystemSettings, (settings) =>
  [...new Set(settings.map((s) => s.category))]
);
