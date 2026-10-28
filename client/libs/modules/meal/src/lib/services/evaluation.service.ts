import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  EvaluationDto,
  CreateEvaluationRequest,
  CompleteEvaluationRequest,
  AddFindingRequest,
  RespondToFindingRequest,
  VerifyFindingRequest,
} from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private readonly api = inject(ApiService);

  listEvaluations(projectId?: string, status?: string): Observable<EvaluationDto[]> {
    let params = new HttpParams();

    if (projectId) params = params.set('projectId', projectId);
    if (status) params = params.set('status', status);

    return this.api.get<EvaluationDto[]>('/evaluations', params);
  }

  getEvaluation(id: string): Observable<EvaluationDto> {
    return this.api.get<EvaluationDto>(`/evaluations/${id}`);
  }

  createEvaluation(request: CreateEvaluationRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/evaluations', request);
  }

  completeEvaluation(id: string, request: CompleteEvaluationRequest): Observable<void> {
    return this.api.post<void>(`/evaluations/${id}/complete`, request);
  }

  addFinding(id: string, request: AddFindingRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/evaluations/${id}/findings`, request);
  }

  respondToFinding(findingId: string, request: RespondToFindingRequest): Observable<void> {
    return this.api.post<void>(`/evaluations/findings/${findingId}/respond`, request);
  }

  verifyFinding(findingId: string, request: VerifyFindingRequest): Observable<void> {
    return this.api.post<void>(`/evaluations/findings/${findingId}/verify`, request);
  }
}
