import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import {
  ReportScheduleDto,
  CreateReportScheduleRequest,
  UpdateReportScheduleRequest,
} from '../models/report-schedule.model';

@Injectable({ providedIn: 'root' })
export class ReportScheduleService {
  private readonly api = inject(ApiService);

  list(): Observable<ReportScheduleDto[]> {
    return this.api.get<ReportScheduleDto[]>('/report-schedules');
  }

  create(request: CreateReportScheduleRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/report-schedules', request);
  }

  update(id: string, request: UpdateReportScheduleRequest): Observable<void> {
    return this.api.put<void>(`/report-schedules/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/report-schedules/${id}`);
  }
}
