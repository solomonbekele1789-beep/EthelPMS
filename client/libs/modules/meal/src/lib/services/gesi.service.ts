import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  GesiAssessmentDto,
  CreateGesiAssessmentRequest,
} from '../models/gesi.model';

@Injectable({ providedIn: 'root' })
export class GesiService {
  private readonly api = inject(ApiService);

  listAssessments(projectId: string): Observable<GesiAssessmentDto[]> {
    const params = new HttpParams().set('projectId', projectId);

    return this.api.get<GesiAssessmentDto[]>('/gesi-assessments', params);
  }

  createAssessment(request: CreateGesiAssessmentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/gesi-assessments', request);
  }
}
