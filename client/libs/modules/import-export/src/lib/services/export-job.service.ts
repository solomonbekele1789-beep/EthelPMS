import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { ExportJobDto, StartExportRequest } from '../models/export-job.model';

@Injectable({ providedIn: 'root' })
export class ExportJobService {
  private readonly api = inject(ApiService);

  list(module?: string): Observable<ExportJobDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.api.get<ExportJobDto[]>('/export-jobs', params);
  }

  start(request: StartExportRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/export-jobs', request);
  }
}
