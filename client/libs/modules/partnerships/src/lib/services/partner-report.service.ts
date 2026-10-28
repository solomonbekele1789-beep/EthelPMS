import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import {
  PartnerReportDto,
  PartnerReportListDto,
  CreatePartnerReportRequest,
  SubmitPartnerReportRequest,
  ReviewPartnerReportRequest,
} from '../models/partner-report.model';

@Injectable({ providedIn: 'root' })
export class PartnerReportService {
  private readonly api = inject(ApiService);

  list(params: { subGranteeId?: string; status?: string }): Observable<PartnerReportListDto[]> {
    let httpParams = new HttpParams();
    if (params.subGranteeId) httpParams = httpParams.set('subGranteeId', params.subGranteeId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.api.get<PartnerReportListDto[]>('/partner-reports', httpParams);
  }

  getById(id: string): Observable<PartnerReportDto> {
    return this.api.get<PartnerReportDto>(`/partner-reports/${id}`);
  }

  create(request: CreatePartnerReportRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/partner-reports', request);
  }

  submit(id: string, request: SubmitPartnerReportRequest): Observable<void> {
    return this.api.put<void>(`/partner-reports/${id}/submit`, request);
  }

  review(id: string, request: ReviewPartnerReportRequest): Observable<void> {
    return this.api.put<void>(`/partner-reports/${id}/review`, request);
  }
}
