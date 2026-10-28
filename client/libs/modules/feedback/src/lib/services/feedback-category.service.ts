import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  FeedbackCategoryDto,
  CreateFeedbackCategoryRequest,
  UpdateFeedbackCategoryRequest,
} from '../models/feedback-category.model';

@Injectable({ providedIn: 'root' })
export class FeedbackCategoryService {
  private readonly api = inject(ApiService);

  listCategories(): Observable<FeedbackCategoryDto[]> {
    return this.api.get<FeedbackCategoryDto[]>('/feedback-categories');
  }

  createCategory(request: CreateFeedbackCategoryRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/feedback-categories', request);
  }

  updateCategory(id: string, request: UpdateFeedbackCategoryRequest): Observable<{ id: string }> {
    return this.api.put<{ id: string }>(`/feedback-categories/${id}`, request);
  }
}
