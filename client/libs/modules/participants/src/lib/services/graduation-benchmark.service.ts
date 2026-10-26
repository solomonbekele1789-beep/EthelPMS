import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  GraduationBenchmarkDto,
  CreateBenchmarkRequest,
  UpdateBenchmarkRequest,
} from '../models/graduation.model';

@Injectable({ providedIn: 'root' })
export class GraduationBenchmarkService {
  private readonly api = inject(ApiService);

  listBenchmarks(projectId?: string, activeOnly?: boolean): Observable<GraduationBenchmarkDto[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    if (activeOnly != null) params = params.set('activeOnly', activeOnly.toString());
    return this.api.get<GraduationBenchmarkDto[]>('/graduation-criteria', params);
  }

  createBenchmark(request: CreateBenchmarkRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/graduation-criteria', request);
  }

  updateBenchmark(id: string, request: UpdateBenchmarkRequest): Observable<void> {
    return this.api.put<void>(`/graduation-criteria/${id}`, request);
  }
}
