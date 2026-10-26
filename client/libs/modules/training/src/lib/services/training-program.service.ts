import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  TrainingProgramDto,
  CreateTrainingProgramRequest,
  UpdateTrainingProgramRequest,
} from '../models/training-program.model';

@Injectable({ providedIn: 'root' })
export class TrainingProgramService {
  private readonly api = inject(ApiService);

  listPrograms(params: {
    projectId?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<TrainingProgramDto>> {
    let httpParams = new HttpParams();

    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<TrainingProgramDto>>('/training-programs', httpParams);
  }

  createProgram(request: CreateTrainingProgramRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/training-programs', request);
  }

  updateProgram(id: string, request: UpdateTrainingProgramRequest): Observable<void> {
    return this.api.put<void>(`/training-programs/${id}`, request);
  }
}
