import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  PurchaseOrderDto,
  CreatePurchaseOrderRequest,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly api = inject(ApiService);

  listOrders(params: {
    supplierId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<PurchaseOrderDto>> {
    let httpParams = new HttpParams();

    if (params.supplierId) httpParams = httpParams.set('supplierId', params.supplierId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<PurchaseOrderDto>>('/purchase-orders', httpParams);
  }

  getOrder(id: string): Observable<PurchaseOrderDto> {
    return this.api.get<PurchaseOrderDto>(`/purchase-orders/${id}`);
  }

  createOrder(request: CreatePurchaseOrderRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/purchase-orders', request);
  }

  issueOrder(id: string): Observable<void> {
    return this.api.put<void>(`/purchase-orders/${id}/issue`);
  }
}
