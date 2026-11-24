import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TenantInfo } from '../models/auth.model';

const TENANT_ID_KEY = 'ethelpms_tenant_id';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly currentTenantSubject = new BehaviorSubject<TenantInfo | null>(null);
  readonly currentTenant$: Observable<TenantInfo | null> = this.currentTenantSubject.asObservable();

  getTenantId(): string | null {
    return this.currentTenantSubject.value?.id ?? localStorage.getItem(TENANT_ID_KEY);
  }

  setTenantId(tenantId: string): void {
    localStorage.setItem(TENANT_ID_KEY, tenantId);
  }

  setTenant(tenant: TenantInfo | null): void {
    this.currentTenantSubject.next(tenant);
    if (tenant?.id) {
      localStorage.setItem(TENANT_ID_KEY, tenant.id);
    } else {
      localStorage.removeItem(TENANT_ID_KEY);
    }
  }

  clearTenantId(): void {
    this.currentTenantSubject.next(null);
    localStorage.removeItem(TENANT_ID_KEY);
  }

  isModuleEnabled(moduleName: string): boolean {
    const tenant = this.currentTenantSubject.value;
    if (!tenant || !tenant.enabledModules || tenant.enabledModules.length === 0) {
      return true;
    }
    return tenant.enabledModules.some(
      (m) => m.toLowerCase() === moduleName.toLowerCase()
    );
  }
}
