import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  FundCodeDto,
  CreateFundCodeRequest,
  UpdateFundCodeRequest,
  CreateFundRestrictionRequest,
  ReleaseFundRestrictionRequest,
} from '../models/fund-code.model';

@Injectable({ providedIn: 'root' })
export class FundCodeService {
  private readonly api = inject(ApiService);

  listFundCodes(params: {
    fundType?: string;
    isActive?: boolean;
  }): Observable<FundCodeDto[]> {
    let httpParams = new HttpParams();

    if (params.fundType) httpParams = httpParams.set('fundType', params.fundType);
    if (params.isActive != null) httpParams = httpParams.set('isActive', params.isActive.toString());

    return this.api.get<FundCodeDto[]>('/fund-codes', httpParams);
  }

  createFundCode(request: CreateFundCodeRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/fund-codes', request);
  }

  updateFundCode(id: string, request: UpdateFundCodeRequest): Observable<void> {
    return this.api.put<void>(`/fund-codes/${id}`, request);
  }

  createRestriction(fundCodeId: string, request: CreateFundRestrictionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/fund-codes/${fundCodeId}/restrictions`, request);
  }

  releaseRestriction(restrictionId: string, request: ReleaseFundRestrictionRequest): Observable<void> {
    return this.api.put<void>(`/fund-codes/restrictions/${restrictionId}/release`, request);
  }
}
