import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  ProcurementPlanDto,
  CreateProcurementPlanRequest,
  AddPlanItemRequest,
} from '../models/procurement-plan.model';

@Injectable({ providedIn: 'root' })
export class ProcurementPlanService {
  private readonly api = inject(ApiService);

  getPlan(id: string): Observable<ProcurementPlanDto> {
    return this.api.get<ProcurementPlanDto>(`/procurement-plans/${id}`);
  }

  createPlan(request: CreateProcurementPlanRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/procurement-plans', request);
  }

  addPlanItem(id: string, request: AddPlanItemRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/procurement-plans/${id}/items`, request);
  }

  submitPlan(id: string): Observable<void> {
    return this.api.put<void>(`/procurement-plans/${id}/submit`);
  }

  approvePlan(id: string): Observable<void> {
    return this.api.put<void>(`/procurement-plans/${id}/approve`);
  }
}
