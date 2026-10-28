import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  PurchaseRequestDto,
  CreatePurchaseRequestRequest,
  AddPurchaseRequestItemRequest,
} from '../models/purchase-request.model';

@Injectable({ providedIn: 'root' })
export class PurchaseRequestService {
  private readonly api = inject(ApiService);

  listRequests(params: {
    projectId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<PurchaseRequestDto>> {
    let httpParams = new HttpParams();

    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<PurchaseRequestDto>>('/purchase-requests', httpParams);
  }

  getRequest(id: string): Observable<PurchaseRequestDto> {
    return this.api.get<PurchaseRequestDto>(`/purchase-requests/${id}`);
  }

  createRequest(request: CreatePurchaseRequestRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/purchase-requests', request);
  }

  addRequestItem(id: string, request: AddPurchaseRequestItemRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/purchase-requests/${id}/items`, request);
  }

  submitRequest(id: string): Observable<void> {
    return this.api.put<void>(`/purchase-requests/${id}/submit`);
  }

  approveRequest(id: string): Observable<void> {
    return this.api.put<void>(`/purchase-requests/${id}/approve`);
  }
}
