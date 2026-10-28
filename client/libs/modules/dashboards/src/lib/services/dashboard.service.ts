import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  DashboardConfigDto,
  DashboardSummaryDto,
  CreateDashboardRequest,
  UpdateDashboardRequest,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  listDashboards(): Observable<DashboardSummaryDto[]> {
    return this.api.get<DashboardSummaryDto[]>('/dashboards');
  }

  getDashboard(id: string): Observable<DashboardConfigDto> {
    return this.api.get<DashboardConfigDto>(`/dashboards/${id}`);
  }

  createDashboard(request: CreateDashboardRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/dashboards', request);
  }

  updateDashboard(id: string, request: UpdateDashboardRequest): Observable<void> {
    return this.api.put<void>(`/dashboards/${id}`, request);
  }

  deleteDashboard(id: string): Observable<void> {
    return this.api.delete<void>(`/dashboards/${id}`);
  }
}
