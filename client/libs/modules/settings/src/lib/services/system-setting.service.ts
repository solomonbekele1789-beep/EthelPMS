import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { SystemSettingDto, UpdateSystemSettingRequest } from '../models/system-setting.model';

@Injectable({ providedIn: 'root' })
export class SystemSettingService {
  private readonly api = inject(ApiService);

  listSystemSettings(category?: string): Observable<SystemSettingDto[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.api.get<SystemSettingDto[]>('/system-settings', params);
  }

  updateSystemSetting(key: string, request: UpdateSystemSettingRequest): Observable<void> {
    return this.api.put<void>(`/system-settings/${key}`, request);
  }
}
