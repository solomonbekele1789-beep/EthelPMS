import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  RiskDto,
  RiskMatrixItemDto,
  CreateRiskRequest,
  ReassessRiskRequest,
  CreateMitigationRequest,
  RecordAssessmentRequest,
} from '../models/risk.model';

@Injectable({ providedIn: 'root' })
export class RiskService {
  private readonly api = inject(ApiService);

  listRisks(params: {
    projectId?: string;
    status?: string;
    categoryId?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<RiskDto>> {
    let httpParams = new HttpParams();

    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<RiskDto>>('/risks', httpParams);
  }

  getRisk(id: string): Observable<RiskDto> {
    return this.api.get<RiskDto>(`/risks/${id}`);
  }

  createRisk(request: CreateRiskRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/risks', request);
  }

  reassessRisk(id: string, request: ReassessRiskRequest): Observable<void> {
    return this.api.put<void>(`/risks/${id}/reassess`, request);
  }

  resolveRisk(id: string): Observable<void> {
    return this.api.put<void>(`/risks/${id}/resolve`, {});
  }

  getMatrix(projectId: string): Observable<RiskMatrixItemDto[]> {
    const httpParams = new HttpParams().set('projectId', projectId);
    return this.api.get<RiskMatrixItemDto[]>('/risks/matrix', httpParams);
  }

  createMitigation(riskId: string, request: CreateMitigationRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/risks/${riskId}/mitigations`, request);
  }

  completeMitigation(riskId: string, mitigationId: string): Observable<void> {
    return this.api.put<void>(`/risks/${riskId}/mitigations/${mitigationId}/complete`, {});
  }

  recordAssessment(riskId: string, request: RecordAssessmentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/risks/${riskId}/assessments`, request);
  }
}
