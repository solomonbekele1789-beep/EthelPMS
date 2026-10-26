import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  MealPlanDto,
  IndicatorMeasurementDto,
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
  RejectMealPlanRequest,
  AddMealIndicatorRequest,
  RecordMeasurementRequest,
} from '../models/meal-plan.model';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private readonly api = inject(ApiService);

  listPlans(params: {
    projectId?: string;
    page: number;
    pageSize: number;
  }): Observable<PagedResult<MealPlanDto>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);

    return this.api.get<PagedResult<MealPlanDto>>('/meal-plans', httpParams);
  }

  getPlan(id: string): Observable<MealPlanDto> {
    return this.api.get<MealPlanDto>(`/meal-plans/${id}`);
  }

  createPlan(request: CreateMealPlanRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/meal-plans', request);
  }

  updatePlan(id: string, request: UpdateMealPlanRequest): Observable<void> {
    return this.api.put<void>(`/meal-plans/${id}`, request);
  }

  updateSection(id: string, sectionNumber: number, content?: string): Observable<void> {
    return this.api.put<void>(`/meal-plans/${id}/sections/${sectionNumber}`, { content });
  }

  submitPlan(id: string): Observable<void> {
    return this.api.post<void>(`/meal-plans/${id}/submit`);
  }

  approvePlan(id: string): Observable<void> {
    return this.api.post<void>(`/meal-plans/${id}/approve`);
  }

  rejectPlan(id: string, request: RejectMealPlanRequest): Observable<void> {
    return this.api.post<void>(`/meal-plans/${id}/reject`, request);
  }

  addIndicator(id: string, request: AddMealIndicatorRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/meal-plans/${id}/indicators`, request);
  }

  recordMeasurement(indicatorId: string, request: RecordMeasurementRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/meal-plans/indicators/${indicatorId}/measurements`, request);
  }

  listMeasurements(indicatorId: string): Observable<IndicatorMeasurementDto[]> {
    return this.api.get<IndicatorMeasurementDto[]>(`/meal-plans/indicators/${indicatorId}/measurements`);
  }
}
