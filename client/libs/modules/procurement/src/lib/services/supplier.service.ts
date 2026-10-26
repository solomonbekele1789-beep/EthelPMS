import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  SupplierDto,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly api = inject(ApiService);

  listSuppliers(params: {
    status?: string;
    search?: string;
  }): Observable<SupplierDto[]> {
    let httpParams = new HttpParams();

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.api.get<SupplierDto[]>('/suppliers', httpParams);
  }

  getSupplier(id: string): Observable<SupplierDto> {
    return this.api.get<SupplierDto>(`/suppliers/${id}`);
  }

  createSupplier(request: CreateSupplierRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/suppliers', request);
  }

  updateSupplier(id: string, request: UpdateSupplierRequest): Observable<void> {
    return this.api.put<void>(`/suppliers/${id}`, request);
  }

  rateSupplier(id: string, score: number): Observable<void> {
    const params = new HttpParams().set('score', score.toString());
    return this.api.put<void>(`/suppliers/${id}/rate`, params);
  }

  blacklistSupplier(id: string): Observable<void> {
    return this.api.put<void>(`/suppliers/${id}/blacklist`);
  }
}
