import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import { DisbursementDto, CreateDisbursementRequest } from '../models/disbursement.model';

@Injectable({ providedIn: 'root' })
export class DisbursementService {
  private readonly api = inject(ApiService);

  list(params: { subGranteeId?: string }): Observable<DisbursementDto[]> {
    let httpParams = new HttpParams();
    if (params.subGranteeId) httpParams = httpParams.set('subGranteeId', params.subGranteeId);
    return this.api.get<DisbursementDto[]>('/disbursements', httpParams);
  }

  create(request: CreateDisbursementRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/disbursements', request);
  }

  approve(id: string): Observable<void> {
    return this.api.put<void>(`/disbursements/${id}/approve`);
  }

  disburse(id: string): Observable<void> {
    return this.api.put<void>(`/disbursements/${id}/disburse`);
  }

  reject(id: string): Observable<void> {
    return this.api.put<void>(`/disbursements/${id}/reject`);
  }
}
