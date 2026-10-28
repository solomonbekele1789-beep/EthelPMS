import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  DataSyncConfigDto,
  CreateDataSyncRequest,
  UpdateDataSyncRequest,
} from '../models/data-sync.model';

@Injectable({ providedIn: 'root' })
export class DataSyncService {
  private readonly api = inject(ApiService);

  list(): Observable<DataSyncConfigDto[]> {
    return this.api.get<DataSyncConfigDto[]>('/data-sync');
  }

  create(request: CreateDataSyncRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/data-sync', request);
  }

  update(id: string, request: UpdateDataSyncRequest): Observable<void> {
    return this.api.put<void>(`/data-sync/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/data-sync/${id}`);
  }

  trigger(id: string): Observable<void> {
    return this.api.post<void>(`/data-sync/${id}/trigger`, {});
  }
}
