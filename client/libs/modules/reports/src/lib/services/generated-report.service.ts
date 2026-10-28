import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import {
  GeneratedReportDto,
  GenerateReportRequest,
  ShareReportRequest,
} from '../models/generated-report.model';

@Injectable({ providedIn: 'root' })
export class GeneratedReportService {
  private readonly api = inject(ApiService);

  list(templateId?: string, dateFrom?: string, dateTo?: string): Observable<GeneratedReportDto[]> {
    let params = new HttpParams();
    if (templateId) params = params.set('reportTemplateId', templateId);
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    return this.api.get<GeneratedReportDto[]>('/generated-reports', params);
  }

  getById(id: string): Observable<GeneratedReportDto> {
    return this.api.get<GeneratedReportDto>(`/generated-reports/${id}`);
  }

  generate(request: GenerateReportRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/generated-reports', request);
  }

  share(id: string, request: ShareReportRequest): Observable<void> {
    return this.api.post<void>(`/generated-reports/${id}/share`, request);
  }
}
