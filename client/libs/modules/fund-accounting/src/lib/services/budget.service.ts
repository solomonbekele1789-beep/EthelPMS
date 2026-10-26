import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  BudgetDto,
  CreateBudgetRequest,
  AddBudgetLineRequest,
} from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly api = inject(ApiService);

  getBudget(id: string): Observable<BudgetDto> {
    return this.api.get<BudgetDto>(`/budgets/${id}`);
  }

  createBudget(request: CreateBudgetRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/budgets', request);
  }

  addBudgetLine(id: string, request: AddBudgetLineRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/budgets/${id}/lines`, request);
  }

  submitBudget(id: string): Observable<void> {
    return this.api.put<void>(`/budgets/${id}/submit`);
  }

  approveBudget(id: string): Observable<void> {
    return this.api.put<void>(`/budgets/${id}/approve`);
  }
}
