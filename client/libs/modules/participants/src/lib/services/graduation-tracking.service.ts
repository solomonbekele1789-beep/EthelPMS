import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  GraduationPipelineDto,
  GraduationAssessmentDto,
  GraduationDecisionDto,
  RecordAssessmentRequest,
  CreateGraduationDecisionRequest,
  RejectGraduationRequest,
} from '../models/graduation.model';

@Injectable({ providedIn: 'root' })
export class GraduationTrackingService {
  private readonly api = inject(ApiService);

  getPipeline(projectId: string): Observable<GraduationPipelineDto> {
    return this.api.get<GraduationPipelineDto>(`/graduation-tracking/pipeline/${projectId}`);
  }

  recordAssessment(request: RecordAssessmentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/graduation-tracking/assessments', request);
  }

  listAssessments(participantId: string, benchmarkId?: string): Observable<GraduationAssessmentDto[]> {
    let params = new HttpParams();
    if (benchmarkId) params = params.set('benchmarkId', benchmarkId);
    return this.api.get<GraduationAssessmentDto[]>(
      `/graduation-tracking/assessments/${participantId}`,
      params
    );
  }

  listDecisions(projectId?: string, participantId?: string): Observable<GraduationDecisionDto[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    if (participantId) params = params.set('participantId', participantId);
    return this.api.get<GraduationDecisionDto[]>('/graduation-tracking/decisions', params);
  }

  createDecision(request: CreateGraduationDecisionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/graduation-tracking/decisions', request);
  }

  approveDecision(id: string): Observable<void> {
    return this.api.post<void>(`/graduation-tracking/decisions/${id}/approve`);
  }

  rejectDecision(id: string, request: RejectGraduationRequest): Observable<void> {
    return this.api.post<void>(`/graduation-tracking/decisions/${id}/reject`, request);
  }
}
