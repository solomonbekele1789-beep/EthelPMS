import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  ReportDto,
  ReportListItemDto,
  ReportApprovalDto,
  FinancialSummaryDto,
  CreateReportRequest,
  UpdateReportRequest,
  ApproveReportRequest,
  RejectReportRequest,
  CreateReportSectionRequest,
  AddReportDataEntryRequest,
  AddReportCommentRequest,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);

  listReports(params: {
    projectId?: string;
    reportType?: string;
    status?: string;
    page: number;
    pageSize: number;
  }): Observable<PagedResult<ReportListItemDto>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.reportType) httpParams = httpParams.set('reportType', params.reportType);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.api.get<PagedResult<ReportListItemDto>>('/reports', httpParams);
  }

  getReport(id: string): Observable<ReportDto> {
    return this.api.get<ReportDto>(`/reports/${id}`);
  }

  createReport(request: CreateReportRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/reports', request);
  }

  updateReport(id: string, request: UpdateReportRequest): Observable<void> {
    return this.api.put<void>(`/reports/${id}`, request);
  }

  submitReport(id: string): Observable<void> {
    return this.api.post<void>(`/reports/${id}/submit`);
  }

  approveReport(id: string, request: ApproveReportRequest): Observable<void> {
    return this.api.post<void>(`/reports/${id}/approve`, request);
  }

  rejectReport(id: string, request: RejectReportRequest): Observable<void> {
    return this.api.post<void>(`/reports/${id}/reject`, request);
  }

  addSection(id: string, request: CreateReportSectionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/reports/${id}/sections`, request);
  }

  addDataEntry(sectionId: string, request: AddReportDataEntryRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/reports/sections/${sectionId}/data`, request);
  }

  addComment(id: string, request: AddReportCommentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/reports/${id}/comments`, request);
  }

  getApprovalHistory(id: string): Observable<ReportApprovalDto[]> {
    return this.api.get<ReportApprovalDto[]>(`/reports/${id}/approvals`);
  }

  getFinancialSummary(projectId: string, fiscalYear?: number): Observable<FinancialSummaryDto> {
    let params = new HttpParams().set('projectId', projectId);

    if (fiscalYear) params = params.set('fiscalYear', fiscalYear.toString());

    return this.api.get<FinancialSummaryDto>('/reports/financial-summary', params);
  }
}
