import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  AssetMaintenanceDto,
  ScheduleMaintenanceRequest,
  CompleteMaintenanceRequest,
} from '../models/maintenance.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly api = inject(ApiService);

  listMaintenance(params: {
    assetId?: string;
    isCompleted?: boolean;
  }): Observable<AssetMaintenanceDto[]> {
    let httpParams = new HttpParams();

    if (params.assetId) httpParams = httpParams.set('assetId', params.assetId);
    if (params.isCompleted != null) httpParams = httpParams.set('isCompleted', params.isCompleted.toString());

    return this.api.get<AssetMaintenanceDto[]>('/asset-maintenance', httpParams);
  }

  scheduleMaintenance(request: ScheduleMaintenanceRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/asset-maintenance', request);
  }

  completeMaintenance(id: string, request: CompleteMaintenanceRequest): Observable<void> {
    return this.api.put<void>(`/asset-maintenance/${id}/complete`, request);
  }
}
