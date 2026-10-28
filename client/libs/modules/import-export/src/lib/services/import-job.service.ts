import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  ImportJobDto,
  ImportJobListDto,
  ImportJobStatus,
  StartImportRequest,
} from '../models/import-job.model';

@Injectable({ providedIn: 'root' })
export class ImportJobService {
  private readonly api = inject(ApiService);

  list(module?: string, status?: ImportJobStatus): Observable<ImportJobListDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    if (status) params = params.set('status', status);
    return this.api.get<ImportJobListDto[]>('/import-jobs', params);
  }

  getById(id: string): Observable<ImportJobDto> {
    return this.api.get<ImportJobDto>(`/import-jobs/${id}`);
  }

  start(request: StartImportRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/import-jobs', request);
  }

  cancel(id: string): Observable<void> {
    return this.api.put<void>(`/import-jobs/${id}/cancel`, {});
  }
}
