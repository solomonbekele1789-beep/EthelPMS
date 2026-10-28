import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  TrainingSessionDto,
  CreateTrainingSessionRequest,
  RegisterParticipantRequest,
  RecordAttendanceRequest,
} from '../models/training-session.model';

@Injectable({ providedIn: 'root' })
export class TrainingSessionService {
  private readonly api = inject(ApiService);

  listSessions(params: {
    programId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<TrainingSessionDto>> {
    let httpParams = new HttpParams();

    if (params.programId) httpParams = httpParams.set('programId', params.programId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<TrainingSessionDto>>('/training-sessions', httpParams);
  }

  getSession(id: string): Observable<TrainingSessionDto> {
    return this.api.get<TrainingSessionDto>(`/training-sessions/${id}`);
  }

  createSession(request: CreateTrainingSessionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/training-sessions', request);
  }

  completeSession(id: string): Observable<void> {
    return this.api.post<void>(`/training-sessions/${id}/complete`, {});
  }

  registerParticipant(sessionId: string, request: RegisterParticipantRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/training-sessions/${sessionId}/participants`, request);
  }

  recordAttendance(participantId: string, request: RecordAttendanceRequest): Observable<void> {
    return this.api.post<void>(`/training-sessions/participants/${participantId}/attendance`, request);
  }
}
