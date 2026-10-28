import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  RiskCategoryDto,
  CreateRiskCategoryRequest,
} from '../models/risk-category.model';

@Injectable({ providedIn: 'root' })
export class RiskCategoryService {
  private readonly api = inject(ApiService);

  listCategories(): Observable<RiskCategoryDto[]> {
    return this.api.get<RiskCategoryDto[]>('/risk-categories');
  }

  createCategory(request: CreateRiskCategoryRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/risk-categories', request);
  }
}
