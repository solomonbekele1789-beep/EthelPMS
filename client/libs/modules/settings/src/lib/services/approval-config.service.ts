import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  ApprovalConfigDto,
  CreateApprovalConfigRequest,
  UpdateApprovalConfigRequest,
} from '../models/approval-config.model';

@Injectable({ providedIn: 'root' })
export class ApprovalConfigService {
  private readonly api = inject(ApiService);

  listApprovalConfigs(module?: string): Observable<ApprovalConfigDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.api.get<ApprovalConfigDto[]>('/approval-configs', params);
  }

  createApprovalConfig(request: CreateApprovalConfigRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/approval-configs', request);
  }

  updateApprovalConfig(id: string, request: UpdateApprovalConfigRequest): Observable<void> {
    return this.api.put<void>(`/approval-configs/${id}`, request);
  }
}
