import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  AssetDisposalDto,
  InitiateDisposalRequest,
  CompleteDisposalRequest,
} from '../models/disposal.model';

@Injectable({ providedIn: 'root' })
export class DisposalService {
  private readonly api = inject(ApiService);

  listDisposals(params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<AssetDisposalDto>> {
    let httpParams = new HttpParams();

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<AssetDisposalDto>>('/asset-disposals', httpParams);
  }

  initiateDisposal(request: InitiateDisposalRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/asset-disposals', request);
  }

  completeDisposal(id: string, request: CompleteDisposalRequest): Observable<void> {
    return this.api.put<void>(`/asset-disposals/${id}/complete`, request);
  }
}
