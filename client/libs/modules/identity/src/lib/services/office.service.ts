import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import { OfficeDto, OfficeListItemDto, CreateOfficeRequest, UpdateOfficeRequest } from '../models/office.model';

@Injectable({ providedIn: 'root' })
export class OfficeService {
  private readonly api = inject(ApiService);

  listOffices(
    page: number,
    pageSize: number,
    search?: string,
    officeType?: string
  ): Observable<PagedResult<OfficeListItemDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (officeType) params = params.set('officeType', officeType);

    return this.api.get<PagedResult<OfficeListItemDto>>('/offices', params);
  }

  getOffice(id: string): Observable<OfficeDto> {
    return this.api.get<OfficeDto>(`/offices/${id}`);
  }

  createOffice(request: CreateOfficeRequest): Observable<OfficeDto> {
    return this.api.post<OfficeDto>('/offices', request);
  }

  updateOffice(id: string, request: UpdateOfficeRequest): Observable<OfficeDto> {
    return this.api.put<OfficeDto>(`/offices/${id}`, request);
  }

  deleteOffice(id: string): Observable<void> {
    return this.api.delete<void>(`/offices/${id}`);
  }
}
