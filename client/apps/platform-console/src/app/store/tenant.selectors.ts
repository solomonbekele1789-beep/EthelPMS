import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlatformTenantState, TENANTS_FEATURE_KEY } from './tenant.reducer';

export const selectPlatformTenantState =
  createFeatureSelector<PlatformTenantState>(TENANTS_FEATURE_KEY);

export const selectTenants = createSelector(selectPlatformTenantState, (s) => s.tenants);
export const selectTenantsTotalCount = createSelector(selectPlatformTenantState, (s) => s.totalCount);
export const selectSelectedTenant = createSelector(selectPlatformTenantState, (s) => s.selectedTenant);
export const selectTenantUsage = createSelector(selectPlatformTenantState, (s) => s.usage);
export const selectTenantModules = createSelector(selectPlatformTenantState, (s) => s.modules);
export const selectTenantAccessKeys = createSelector(selectPlatformTenantState, (s) => s.accessKeys);
export const selectProvisioningLogs = createSelector(selectPlatformTenantState, (s) => s.provisioningLogs);
export const selectSubscriptionPackages = createSelector(selectPlatformTenantState, (s) => s.packages);
export const selectTenantsLoading = createSelector(selectPlatformTenantState, (s) => s.loading);
