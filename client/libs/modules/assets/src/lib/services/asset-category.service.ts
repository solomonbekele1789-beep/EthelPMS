import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  AssetCategoryDto,
  CreateAssetCategoryRequest,
  UpdateAssetCategoryRequest,
} from '../models/asset-category.model';

@Injectable({ providedIn: 'root' })
export class AssetCategoryService {
  private readonly api = inject(ApiService);

  listCategories(params: {
    search?: string;
  }): Observable<AssetCategoryDto[]> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.api.get<AssetCategoryDto[]>('/asset-categories', httpParams);
  }

  createCategory(request: CreateAssetCategoryRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/asset-categories', request);
  }

  updateCategory(id: string, request: UpdateAssetCategoryRequest): Observable<void> {
    return this.api.put<void>(`/asset-categories/${id}`, request);
  }
}
