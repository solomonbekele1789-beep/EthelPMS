import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  OutcomeDto,
  CreateOutcomeRequest,
  UpdateOutcomeRequest,
  CreateOutputRequest,
  UpdateOutputRequest,
  CreateActivityRequest,
  UpdateActivityRequest,
  CreateIndicatorRequest,
  UpdateIndicatorRequest,
} from '../models/results-framework.model';

@Injectable({ providedIn: 'root' })
export class ResultsFrameworkService {
  private readonly api = inject(ApiService);

  // --- Outcomes ---

  listOutcomes(projectId: string): Observable<OutcomeDto[]> {
    return this.api.get<OutcomeDto[]>(`/projects/${projectId}/outcomes`);
  }

  createOutcome(projectId: string, request: CreateOutcomeRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/projects/${projectId}/outcomes`, request);
  }

  updateOutcome(projectId: string, outcomeId: string, request: UpdateOutcomeRequest): Observable<void> {
    return this.api.put<void>(`/projects/${projectId}/outcomes/${outcomeId}`, request);
  }

  deleteOutcome(projectId: string, outcomeId: string): Observable<void> {
    return this.api.delete<void>(`/projects/${projectId}/outcomes/${outcomeId}`);
  }

  // --- Outputs ---

  createOutput(outcomeId: string, request: CreateOutputRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/outcomes/${outcomeId}/outputs`, request);
  }

  updateOutput(outcomeId: string, outputId: string, request: UpdateOutputRequest): Observable<void> {
    return this.api.put<void>(`/outcomes/${outcomeId}/outputs/${outputId}`, request);
  }

  deleteOutput(outcomeId: string, outputId: string): Observable<void> {
    return this.api.delete<void>(`/outcomes/${outcomeId}/outputs/${outputId}`);
  }

  // --- Activities ---

  createActivity(outputId: string, request: CreateActivityRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/outputs/${outputId}/activities`, request);
  }

  updateActivity(outputId: string, activityId: string, request: UpdateActivityRequest): Observable<void> {
    return this.api.put<void>(`/outputs/${outputId}/activities/${activityId}`, request);
  }

  deleteActivity(outputId: string, activityId: string): Observable<void> {
    return this.api.delete<void>(`/outputs/${outputId}/activities/${activityId}`);
  }

  // --- Indicators ---

  createIndicator(projectId: string, request: CreateIndicatorRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/projects/${projectId}/indicators`, request);
  }

  updateIndicator(projectId: string, indicatorId: string, request: UpdateIndicatorRequest): Observable<void> {
    return this.api.put<void>(`/projects/${projectId}/indicators/${indicatorId}`, request);
  }

  deleteIndicator(projectId: string, indicatorId: string): Observable<void> {
    return this.api.delete<void>(`/projects/${projectId}/indicators/${indicatorId}`);
  }
}
