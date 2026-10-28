import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  JournalEntryDto,
  CreateJournalEntryRequest,
} from '../models/journal-entry.model';

@Injectable({ providedIn: 'root' })
export class JournalEntryService {
  private readonly api = inject(ApiService);

  listEntries(params: {
    projectId?: string;
    fundCodeId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<JournalEntryDto>> {
    let httpParams = new HttpParams();

    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.fundCodeId) httpParams = httpParams.set('fundCodeId', params.fundCodeId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<JournalEntryDto>>('/journal-entries', httpParams);
  }

  createEntry(request: CreateJournalEntryRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/journal-entries', request);
  }

  postEntry(id: string): Observable<void> {
    return this.api.put<void>(`/journal-entries/${id}/post`);
  }
}
