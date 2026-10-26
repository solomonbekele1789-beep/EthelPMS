import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  AssetDto,
  RegisterAssetRequest,
  UpdateAssetRequest,
  TransferAssetRequest,
  AssignAssetRequest,
  CalculateDepreciationRequest,
} from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly api = inject(ApiService);

  listAssets(params: {
    categoryId?: string;
    status?: string;
    projectId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<AssetDto>> {
    let httpParams = new HttpParams();

    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<AssetDto>>('/assets', httpParams);
  }

  getAsset(id: string): Observable<AssetDto> {
    return this.api.get<AssetDto>(`/assets/${id}`);
  }

  registerAsset(request: RegisterAssetRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/assets', request);
  }

  updateAsset(id: string, request: UpdateAssetRequest): Observable<void> {
    return this.api.put<void>(`/assets/${id}`, request);
  }

  transferAsset(id: string, request: TransferAssetRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/assets/${id}/transfer`, request);
  }

  assignAsset(id: string, request: AssignAssetRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/assets/${id}/assign`, request);
  }

  calculateDepreciation(id: string, request: CalculateDepreciationRequest): Observable<void> {
    return this.api.post<void>(`/assets/${id}/calculate-depreciation`, request);
  }
}
