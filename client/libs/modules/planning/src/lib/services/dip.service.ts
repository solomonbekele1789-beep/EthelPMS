import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  DipItemDto,
  CreateDipItemRequest,
  UpdateDipItemRequest,
  CreateDipMilestoneRequest,
} from '../models/dip.model';

@Injectable({ providedIn: 'root' })
export class DipService {
  private readonly api = inject(ApiService);

  listDipItems(activityId: string): Observable<DipItemDto[]> {
    return this.api.get<DipItemDto[]>(`/activities/${activityId}/dips`);
  }

  createDipItem(activityId: string, request: CreateDipItemRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/activities/${activityId}/dips`, request);
  }

  updateDipItem(activityId: string, id: string, request: UpdateDipItemRequest): Observable<void> {
    return this.api.put<void>(`/activities/${activityId}/dips/${id}`, request);
  }

  addMilestone(activityId: string, dipId: string, request: CreateDipMilestoneRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/activities/${activityId}/dips/${dipId}/milestones`, request);
  }
}
