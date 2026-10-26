import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  ImportTemplateDto,
  CreateImportTemplateRequest,
  UpdateImportTemplateRequest,
} from '../models/import-template.model';

@Injectable({ providedIn: 'root' })
export class ImportTemplateService {
  private readonly api = inject(ApiService);

  list(module?: string): Observable<ImportTemplateDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.api.get<ImportTemplateDto[]>('/import-templates', params);
  }

  getById(id: string): Observable<ImportTemplateDto> {
    return this.api.get<ImportTemplateDto>(`/import-templates/${id}`);
  }

  create(request: CreateImportTemplateRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/import-templates', request);
  }

  update(id: string, request: UpdateImportTemplateRequest): Observable<void> {
    return this.api.put<void>(`/import-templates/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/import-templates/${id}`);
  }
}
