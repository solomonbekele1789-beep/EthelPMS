import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  PlanEntryDto,
  PlanEntryListItemDto,
  PlanHierarchyDto,
  PlanLevel,
  CreatePlanEntryRequest,
  UpdatePlanEntryRequest,
  RejectPlanRequest,
  CreatePlanActivityRequest,
} from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly api = inject(ApiService);

  listPlans(params: {
    projectId: string;
    page: number;
    pageSize: number;
    level?: string;
    parentId?: string;
  }): Observable<PagedResult<PlanEntryListItemDto>> {
    let httpParams = new HttpParams()
      .set('projectId', params.projectId)
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.level) httpParams = httpParams.set('level', params.level);
    if (params.parentId) httpParams = httpParams.set('parentId', params.parentId);

    return this.api.get<PagedResult<PlanEntryListItemDto>>('/plans', httpParams);
  }

  getPlan(id: string): Observable<PlanEntryDto> {
    return this.api.get<PlanEntryDto>(`/plans/${id}`);
  }

  getHierarchy(projectId: string, fiscalYear?: number): Observable<PlanHierarchyDto[]> {
    let params = new HttpParams().set('projectId', projectId);

    if (fiscalYear) params = params.set('fiscalYear', fiscalYear.toString());

    return this.api.get<PlanHierarchyDto[]>('/plans/hierarchy', params);
  }

  createPlan(request: CreatePlanEntryRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/plans', request);
  }

  updatePlan(id: string, request: UpdatePlanEntryRequest): Observable<void> {
    return this.api.put<void>(`/plans/${id}`, request);
  }

  submitPlan(id: string): Observable<void> {
    return this.api.post<void>(`/plans/${id}/submit`);
  }

  approvePlan(id: string): Observable<void> {
    return this.api.post<void>(`/plans/${id}/approve`);
  }

  rejectPlan(id: string, request: RejectPlanRequest): Observable<void> {
    return this.api.post<void>(`/plans/${id}/reject`, request);
  }

  addPlanActivity(id: string, request: CreatePlanActivityRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/plans/${id}/activities`, request);
  }
}
