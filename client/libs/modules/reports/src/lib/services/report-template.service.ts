import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import {
  ReportTemplateDto,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
} from '../models/report-template.model';

@Injectable({ providedIn: 'root' })
export class ReportTemplateService {
  private readonly api = inject(ApiService);

  list(module?: string): Observable<ReportTemplateDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.api.get<ReportTemplateDto[]>('/report-templates', params);
  }

  getById(id: string): Observable<ReportTemplateDto> {
    return this.api.get<ReportTemplateDto>(`/report-templates/${id}`);
  }

  create(request: CreateReportTemplateRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/report-templates', request);
  }

  update(id: string, request: UpdateReportTemplateRequest): Observable<void> {
    return this.api.put<void>(`/report-templates/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/report-templates/${id}`);
  }
}
