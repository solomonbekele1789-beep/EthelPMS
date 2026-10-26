import { Injectable, signal, computed } from '@angular/core';

const TENANT_STORAGE_KEY = 'ethelpms_tenant_id';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly _currentTenantId = signal<string | null>(
    localStorage.getItem(TENANT_STORAGE_KEY)
  );

  readonly currentTenantId = this._currentTenantId.asReadonly();
  readonly hasTenant = computed(() => this._currentTenantId() !== null);

  setTenant(tenantId: string): void {
    localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
    this._currentTenantId.set(tenantId);
  }

  clearTenant(): void {
    localStorage.removeItem(TENANT_STORAGE_KEY);
    this._currentTenantId.set(null);
  }

  getTenantId(): string | null {
    return this._currentTenantId();
  }
}
