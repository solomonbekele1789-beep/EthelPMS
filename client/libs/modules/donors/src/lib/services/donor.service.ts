import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  DonorDto,
  CreateDonorRequest,
  UpdateDonorRequest,
  AddDonorContactRequest,
} from '../models/donor.model';

@Injectable({ providedIn: 'root' })
export class DonorService {
  private readonly api = inject(ApiService);

  listDonors(params: {
    isActive?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<DonorDto>> {
    let httpParams = new HttpParams();

    if (params.isActive != null) httpParams = httpParams.set('isActive', params.isActive.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<DonorDto>>('/donors', httpParams);
  }

  getDonor(id: string): Observable<DonorDto> {
    return this.api.get<DonorDto>(`/donors/${id}`);
  }

  createDonor(request: CreateDonorRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/donors', request);
  }

  updateDonor(id: string, request: UpdateDonorRequest): Observable<void> {
    return this.api.put<void>(`/donors/${id}`, request);
  }

  addContact(donorId: string, request: AddDonorContactRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/donors/${donorId}/contacts`, request);
  }
}
