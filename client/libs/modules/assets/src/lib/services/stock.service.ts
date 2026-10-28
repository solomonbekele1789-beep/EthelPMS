import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  StockItemDto,
  CreateStockItemRequest,
  RecordStockMovementRequest,
} from '../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly api = inject(ApiService);

  listStockItems(params: {
    category?: string;
    search?: string;
  }): Observable<StockItemDto[]> {
    let httpParams = new HttpParams();

    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.api.get<StockItemDto[]>('/stock-items', httpParams);
  }

  createStockItem(request: CreateStockItemRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/stock-items', request);
  }

  recordMovement(id: string, request: RecordStockMovementRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/stock-items/${id}/movements`, request);
  }
}
