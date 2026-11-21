import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  AccessKeyDto,
  ProvisioningLogDto,
  SubscriptionPackageDto,
  TenantDetailDto,
  TenantListItemDto,
  TenantModuleDto,
  TenantUsageDto,
} from '../models/tenant.model';

export const TenantActions = createActionGroup({
  source: 'Platform Tenants',
  events: {
    'Load Tenants': props<{ page?: number; pageSize?: number; search?: string; status?: string }>(),
    'Load Tenants Success': props<{ tenants: TenantListItemDto[]; totalCount: number }>(),
    'Load Tenants Failure': props<{ error: string }>(),

    'Load Tenant': props<{ id: string }>(),
    'Load Tenant Success': props<{ tenant: TenantDetailDto }>(),
    'Load Tenant Failure': props<{ error: string }>(),

    'Load Tenant Usage': props<{ id: string }>(),
    'Load Tenant Usage Success': props<{ usage: TenantUsageDto }>(),

    'Load Tenant Modules': props<{ tenantId: string }>(),
    'Load Tenant Modules Success': props<{ modules: TenantModuleDto[] }>(),

    'Toggle Module': props<{ tenantId: string; moduleName: string; enabled: boolean }>(),
    'Toggle Module Success': props<{ moduleName: string; enabled: boolean }>(),
    'Toggle Module Failure': props<{ error: string }>(),

    'Load Access Keys': props<{ tenantId: string }>(),
    'Load Access Keys Success': props<{ keys: AccessKeyDto[] }>(),

    'Load Provisioning Logs': props<{ tenantId: string }>(),
    'Load Provisioning Logs Success': props<{ logs: ProvisioningLogDto[] }>(),

    'Load Subscriptions': emptyProps(),
    'Load Subscriptions Success': props<{ packages: SubscriptionPackageDto[] }>(),
  },
});
