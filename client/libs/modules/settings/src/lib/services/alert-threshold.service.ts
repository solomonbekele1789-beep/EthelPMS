import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  AlertThresholdDto,
  CreateAlertThresholdRequest,
  UpdateAlertThresholdRequest,
} from '../models/alert-threshold.model';

@Injectable({ providedIn: 'root' })
export class AlertThresholdService {
  private readonly api = inject(ApiService);

  listAlertThresholds(module?: string): Observable<AlertThresholdDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.api.get<AlertThresholdDto[]>('/alert-thresholds', params);
  }

  createAlertThreshold(request: CreateAlertThresholdRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/alert-thresholds', request);
  }

  updateAlertThreshold(id: string, request: UpdateAlertThresholdRequest): Observable<void> {
    return this.api.put<void>(`/alert-thresholds/${id}`, request);
  }

  deleteAlertThreshold(id: string): Observable<void> {
    return this.api.delete<void>(`/alert-thresholds/${id}`);
  }
}
