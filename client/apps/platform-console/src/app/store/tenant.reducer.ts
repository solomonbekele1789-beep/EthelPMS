import { createReducer, on } from '@ngrx/store';
import {
  AccessKeyDto,
  ProvisioningLogDto,
  SubscriptionPackageDto,
  TenantDetailDto,
  TenantListItemDto,
  TenantModuleDto,
  TenantUsageDto,
} from '../models/tenant.model';
import { TenantActions } from './tenant.actions';

export const TENANTS_FEATURE_KEY = 'platformTenants';

export interface PlatformTenantState {
  tenants: TenantListItemDto[];
  totalCount: number;
  selectedTenant: TenantDetailDto | null;
  usage: TenantUsageDto | null;
  modules: TenantModuleDto[];
  accessKeys: AccessKeyDto[];
  provisioningLogs: ProvisioningLogDto[];
  packages: SubscriptionPackageDto[];
  loading: boolean;
  error: string | null;
}

export const initialPlatformTenantState: PlatformTenantState = {
  tenants: [],
  totalCount: 0,
  selectedTenant: null,
  usage: null,
  modules: [],
  accessKeys: [],
  provisioningLogs: [],
  packages: [],
  loading: false,
  error: null,
};

export const tenantReducer = createReducer(
  initialPlatformTenantState,
  on(TenantActions.loadTenants, (state) => ({ ...state, loading: true, error: null })),
  on(TenantActions.loadTenantsSuccess, (state, { tenants, totalCount }) => ({
    ...state,
    tenants,
    totalCount,
    loading: false,
  })),
  on(TenantActions.loadTenantsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TenantActions.loadTenant, (state) => ({ ...state, loading: true, selectedTenant: null, error: null })),
  on(TenantActions.loadTenantSuccess, (state, { tenant }) => ({ ...state, selectedTenant: tenant, loading: false })),
  on(TenantActions.loadTenantFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TenantActions.loadTenantUsageSuccess, (state, { usage }) => ({ ...state, usage })),
  on(TenantActions.loadTenantModulesSuccess, (state, { modules }) => ({ ...state, modules })),
  on(TenantActions.toggleModuleSuccess, (state, { moduleName, enabled }) => ({
    ...state,
    modules: state.modules.map((m) =>
      m.moduleName === moduleName ? { ...m, isEnabled: enabled } : m
    ),
  })),
  on(TenantActions.loadAccessKeysSuccess, (state, { keys }) => ({ ...state, accessKeys: keys })),
  on(TenantActions.loadProvisioningLogsSuccess, (state, { logs }) => ({ ...state, provisioningLogs: logs })),
  on(TenantActions.loadSubscriptionsSuccess, (state, { packages }) => ({ ...state, packages }))
);
