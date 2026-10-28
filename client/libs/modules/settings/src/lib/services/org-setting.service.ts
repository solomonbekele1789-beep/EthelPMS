import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { OrgSettingDto, UpsertOrgSettingRequest } from '../models/org-setting.model';

@Injectable({ providedIn: 'root' })
export class OrgSettingService {
  private readonly api = inject(ApiService);

  listOrgSettings(module?: string, category?: string): Observable<OrgSettingDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    if (category) params = params.set('category', category);
    return this.api.get<OrgSettingDto[]>('/org-settings', params);
  }

  getOrgSetting(key: string): Observable<OrgSettingDto> {
    return this.api.get<OrgSettingDto>(`/org-settings/${key}`);
  }

  upsertOrgSetting(request: UpsertOrgSettingRequest): Observable<{ id: string }> {
    return this.api.put<{ id: string }>('/org-settings', request);
  }
}
