import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  FeedbackItemDto,
  SubmitFeedbackRequest,
  AssignFeedbackRequest,
  EscalateFeedbackRequest,
  AddFeedbackResponseRequest,
} from '../models/feedback.model';
import { FeedbackDashboardDto } from '../models/feedback-dashboard.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly api = inject(ApiService);

  listFeedback(params: {
    status?: string;
    type?: string;
    feedbackCategoryId?: string;
    projectId?: string;
    isConfidential?: boolean;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<FeedbackItemDto>> {
    let httpParams = new HttpParams();

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.feedbackCategoryId) httpParams = httpParams.set('feedbackCategoryId', params.feedbackCategoryId);
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.isConfidential != null) httpParams = httpParams.set('isConfidential', params.isConfidential.toString());
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<FeedbackItemDto>>('/feedback', httpParams);
  }

  getFeedback(id: string): Observable<FeedbackItemDto> {
    return this.api.get<FeedbackItemDto>(`/feedback/${id}`);
  }

  submitFeedback(request: SubmitFeedbackRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/feedback', request);
  }

  acknowledgeFeedback(id: string): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/feedback/${id}/acknowledge`, {});
  }

  assignFeedback(id: string, request: AssignFeedbackRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/feedback/${id}/assign`, request);
  }

  escalateFeedback(id: string, request: EscalateFeedbackRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/feedback/${id}/escalate`, request);
  }

  resolveFeedback(id: string): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/feedback/${id}/resolve`, {});
  }

  addResponse(id: string, request: AddFeedbackResponseRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/feedback/${id}/responses`, request);
  }

  getDashboard(): Observable<FeedbackDashboardDto> {
    return this.api.get<FeedbackDashboardDto>('/feedback/dashboard');
  }
}
