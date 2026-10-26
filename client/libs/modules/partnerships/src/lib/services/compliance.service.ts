import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import {
  PartnerComplianceDto,
  CreateComplianceCheckRequest,
  CompleteComplianceCheckRequest,
  RequireFollowUpRequest,
} from '../models/compliance.model';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private readonly api = inject(ApiService);

  list(params: { subGranteeId?: string }): Observable<PartnerComplianceDto[]> {
    let httpParams = new HttpParams();
    if (params.subGranteeId) httpParams = httpParams.set('subGranteeId', params.subGranteeId);
    return this.api.get<PartnerComplianceDto[]>('/partner-compliance', httpParams);
  }

  create(request: CreateComplianceCheckRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/partner-compliance', request);
  }

  complete(id: string, request: CompleteComplianceCheckRequest): Observable<void> {
    return this.api.put<void>(`/partner-compliance/${id}/complete`, request);
  }

  requireFollowUp(id: string, request: RequireFollowUpRequest): Observable<void> {
    return this.api.put<void>(`/partner-compliance/${id}/follow-up`, request);
  }
}
