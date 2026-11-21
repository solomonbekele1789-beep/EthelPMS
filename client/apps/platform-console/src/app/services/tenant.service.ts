import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResult } from '@ethelpms/shared/core';
import {
  AccessKeyDto,
  CreateAccessKeyResponse,
  CreateTenantRequest,
  ProvisioningLogDto,
  SubscriptionPackageDto,
  TenantDetailDto,
  TenantListItemDto,
  TenantModuleDto,
  TenantUsageDto,
  UpdateBrandingRequest,
  UpdateTenantRequest,
} from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class PlatformTenantService {
  private readonly api = inject(ApiService);

  listTenants(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }): Observable<PagedResult<TenantListItemDto>> {
    return this.api.get<PagedResult<TenantListItemDto>>('/platform/tenants', params);
  }

  getTenant(id: string): Observable<TenantDetailDto> {
    return this.api.get<TenantDetailDto>(`/platform/tenants/${id}`);
  }

  createTenant(payload: CreateTenantRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/platform/tenants', payload);
  }

  updateTenant(id: string, payload: UpdateTenantRequest): Observable<void> {
    return this.api.put<void>(`/platform/tenants/${id}`, { tenantId: id, ...payload });
  }

  provisionTenant(id: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/provision`, {});
  }

  activateTenant(id: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/activate`, {});
  }

  suspendTenant(id: string, reason: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/suspend`, { tenantId: id, reason });
  }

  reactivateTenant(id: string): Observable<void> {
    return this.api.post<void>(`/platform/tenants/${id}/reactivate`, {});
  }

  updateBranding(id: string, payload: UpdateBrandingRequest): Observable<void> {
    return this.api.put<void>(`/platform/tenants/${id}/branding`, { tenantId: id, ...payload });
  }

  updateSubscription(id: string, subscriptionPackageId: string): Observable<void> {
    return this.api.put<void>(`/platform/tenants/${id}/subscription`, { tenantId: id, subscriptionPackageId });
  }

  getTenantUsage(id: string): Observable<TenantUsageDto> {
    return this.api.get<TenantUsageDto>(`/platform/tenants/${id}/usage`);
  }

  getProvisioningStatus(id: string): Observable<ProvisioningLogDto[]> {
    return this.api.get<ProvisioningLogDto[]>(`/platform/tenants/${id}/provisioning-status`);
  }

  listModules(tenantId: string): Observable<TenantModuleDto[]> {
    return this.api.get<TenantModuleDto[]>(`/platform/tenants/${tenantId}/modules`);
  }

  toggleModule(tenantId: string, moduleName: string, enabled: boolean): Observable<void> {
    return this.api.put<void>(`/platform/tenants/${tenantId}/modules/${moduleName}`, { enabled });
  }

  listSubscriptions(): Observable<SubscriptionPackageDto[]> {
    return this.api.get<SubscriptionPackageDto[]>('/platform/subscriptions');
  }

  listAccessKeys(tenantId: string): Observable<AccessKeyDto[]> {
    return this.api.get<AccessKeyDto[]>(`/platform/tenants/${tenantId}/keys`);
  }

  createAccessKey(
    tenantId: string,
    payload: { label: string; scopes: string[]; expiresAt?: string | null }
  ): Observable<CreateAccessKeyResponse> {
    return this.api.post<CreateAccessKeyResponse>(`/platform/tenants/${tenantId}/keys`, payload);
  }

  revokeAccessKey(tenantId: string, keyId: string): Observable<void> {
    return this.api.delete<void>(`/platform/tenants/${tenantId}/keys/${keyId}`);
  }
}
