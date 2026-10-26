import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  DashboardWidgetDto,
  AddWidgetRequest,
  UpdateWidgetRequest,
} from '../models/widget.model';

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private readonly api = inject(ApiService);

  listWidgets(dashboardId: string): Observable<DashboardWidgetDto[]> {
    return this.api.get<DashboardWidgetDto[]>(`/dashboards/${dashboardId}/widgets`);
  }

  addWidget(dashboardId: string, request: AddWidgetRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/dashboards/${dashboardId}/widgets`, request);
  }

  updateWidget(dashboardId: string, widgetId: string, request: UpdateWidgetRequest): Observable<void> {
    return this.api.put<void>(`/dashboards/${dashboardId}/widgets/${widgetId}`, request);
  }

  removeWidget(dashboardId: string, widgetId: string): Observable<void> {
    return this.api.delete<void>(`/dashboards/${dashboardId}/widgets/${widgetId}`);
  }
}
