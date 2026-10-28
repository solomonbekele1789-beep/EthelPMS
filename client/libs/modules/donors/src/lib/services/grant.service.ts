import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  GrantDto,
  CreateGrantRequest,
  AddGrantConditionRequest,
  MarkConditionMetRequest,
  SubmitGrantReportRequest,
  ComplianceDashboardDto,
} from '../models/grant.model';

@Injectable({ providedIn: 'root' })
export class GrantService {
  private readonly api = inject(ApiService);

  listGrants(params: {
    donorId?: string;
    status?: string;
    projectId?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<GrantDto>> {
    let httpParams = new HttpParams();

    if (params.donorId) httpParams = httpParams.set('donorId', params.donorId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<GrantDto>>('/grants', httpParams);
  }

  getGrant(id: string): Observable<GrantDto> {
    return this.api.get<GrantDto>(`/grants/${id}`);
  }

  createGrant(request: CreateGrantRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/grants', request);
  }

  activateGrant(id: string): Observable<void> {
    return this.api.put<void>(`/grants/${id}/activate`, {});
  }

  addCondition(grantId: string, request: AddGrantConditionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/grants/${grantId}/conditions`, request);
  }

  markConditionMet(conditionId: string, request: MarkConditionMetRequest): Observable<void> {
    return this.api.put<void>(`/grants/conditions/${conditionId}/mark-met`, request);
  }

  submitReport(reportId: string, request: SubmitGrantReportRequest): Observable<void> {
    return this.api.put<void>(`/grants/reports/${reportId}/submit`, request);
  }

  getComplianceDashboard(): Observable<ComplianceDashboardDto[]> {
    return this.api.get<ComplianceDashboardDto[]>('/grants/compliance-dashboard');
  }
}
