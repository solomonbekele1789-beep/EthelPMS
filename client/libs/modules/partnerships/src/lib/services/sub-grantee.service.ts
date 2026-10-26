import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import {
  SubGranteeDto,
  SubGranteeListDto,
  RegisterSubGranteeRequest,
  UpdateSubGranteeRequest,
  AssessRiskRequest,
} from '../models/sub-grantee.model';

@Injectable({ providedIn: 'root' })
export class SubGranteeService {
  private readonly api = inject(ApiService);

  list(params: { status?: string; partnerType?: string }): Observable<SubGranteeListDto[]> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.partnerType) httpParams = httpParams.set('partnerType', params.partnerType);
    return this.api.get<SubGranteeListDto[]>('/sub-grantees', httpParams);
  }

  get(id: string): Observable<SubGranteeDto> {
    return this.api.get<SubGranteeDto>(`/sub-grantees/${id}`);
  }

  register(request: RegisterSubGranteeRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/sub-grantees', request);
  }

  update(id: string, request: UpdateSubGranteeRequest): Observable<void> {
    return this.api.put<void>(`/sub-grantees/${id}`, request);
  }

  activate(id: string): Observable<void> {
    return this.api.put<void>(`/sub-grantees/${id}/activate`);
  }

  suspend(id: string): Observable<void> {
    return this.api.put<void>(`/sub-grantees/${id}/suspend`);
  }

  assessRisk(id: string, request: AssessRiskRequest): Observable<void> {
    return this.api.put<void>(`/sub-grantees/${id}/risk-assessment`, request);
  }
}
