import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  ReportTemplateDto,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
  AddTemplateSectionRequest,
} from '../models/report-template.model';

@Injectable({ providedIn: 'root' })
export class ReportTemplateService {
  private readonly api = inject(ApiService);

  listTemplates(reportType?: string): Observable<ReportTemplateDto[]> {
    let params = new HttpParams();

    if (reportType) params = params.set('reportType', reportType);

    return this.api.get<ReportTemplateDto[]>('/report-templates', params);
  }

  createTemplate(request: CreateReportTemplateRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/report-templates', request);
  }

  updateTemplate(id: string, request: UpdateReportTemplateRequest): Observable<void> {
    return this.api.put<void>(`/report-templates/${id}`, request);
  }

  addSection(id: string, request: AddTemplateSectionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/report-templates/${id}/sections`, request);
  }
}
