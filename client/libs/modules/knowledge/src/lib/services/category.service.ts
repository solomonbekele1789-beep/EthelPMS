import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import { KbCategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  listCategories(): Observable<KbCategoryDto[]> {
    return this.api.get<KbCategoryDto[]>('/kb/categories');
  }

  createCategory(request: CreateCategoryRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/kb/categories', request);
  }

  updateCategory(id: string, request: UpdateCategoryRequest): Observable<void> {
    return this.api.put<void>(`/kb/categories/${id}`, request);
  }

  deleteCategory(id: string): Observable<void> {
    return this.api.delete<void>(`/kb/categories/${id}`);
  }
}
