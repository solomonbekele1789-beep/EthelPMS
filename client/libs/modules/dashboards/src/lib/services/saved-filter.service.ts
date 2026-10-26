import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { SavedFilterDto, CreateSavedFilterRequest } from '../models/saved-filter.model';

@Injectable({ providedIn: 'root' })
export class SavedFilterService {
  private readonly api = inject(ApiService);

  listFilters(module?: string): Observable<SavedFilterDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.api.get<SavedFilterDto[]>('/saved-filters', params);
  }

  createFilter(request: CreateSavedFilterRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/saved-filters', request);
  }

  deleteFilter(id: string): Observable<void> {
    return this.api.delete<void>(`/saved-filters/${id}`);
  }
}
