import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  ParticipantDto,
  ParticipantListItemDto,
  RegisterParticipantRequest,
  UpdateParticipantRequest,
  UpdateAddressRequest,
  EnrollParticipantRequest,
  ExitEnrollmentRequest,
} from '../models/participant.model';
import { HouseholdMemberDto, AddHouseholdMemberRequest } from '../models/household.model';
import { ParticipantServiceDto, RecordServiceRequest } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private readonly api = inject(ApiService);

  listParticipants(params: {
    projectId?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<ParticipantListItemDto>> {
    let httpParams = new HttpParams();

    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<ParticipantListItemDto>>('/participants', httpParams);
  }

  getParticipant(id: string): Observable<ParticipantDto> {
    return this.api.get<ParticipantDto>(`/participants/${id}`);
  }

  registerParticipant(request: RegisterParticipantRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/participants', request);
  }

  updateParticipant(id: string, request: UpdateParticipantRequest): Observable<void> {
    return this.api.put<void>(`/participants/${id}`, request);
  }

  updateAddress(id: string, request: UpdateAddressRequest): Observable<void> {
    return this.api.put<void>(`/participants/${id}/address`, request);
  }

  enrollParticipant(id: string, request: EnrollParticipantRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/participants/${id}/enroll`, request);
  }

  exitEnrollment(enrollmentId: string, request: ExitEnrollmentRequest): Observable<void> {
    return this.api.post<void>(`/participants/enrollments/${enrollmentId}/exit`, request);
  }

  addHouseholdMember(id: string, request: AddHouseholdMemberRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/participants/${id}/household`, request);
  }

  listHouseholdMembers(householdCode: string): Observable<HouseholdMemberDto[]> {
    const params = new HttpParams().set('householdCode', householdCode);
    return this.api.get<HouseholdMemberDto[]>('/participants/household', params);
  }

  recordService(id: string, request: RecordServiceRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/participants/${id}/services`, request);
  }

  listServices(id: string, projectId?: string): Observable<ParticipantServiceDto[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.api.get<ParticipantServiceDto[]>(`/participants/${id}/services`, params);
  }
}
