import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  InterventionAreaDto,
  CreateInterventionAreaRequest,
  UpdateInterventionAreaRequest,
  AllocateInterventionAreaRequest,
} from '../models/intervention-area.model';

@Injectable({ providedIn: 'root' })
export class InterventionAreaService {
  private readonly api = inject(ApiService);

  listInterventionAreas(): Observable<InterventionAreaDto[]> {
    return this.api.get<InterventionAreaDto[]>('/intervention-areas');
  }

  createInterventionArea(request: CreateInterventionAreaRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/intervention-areas', request);
  }

  updateInterventionArea(id: string, request: UpdateInterventionAreaRequest): Observable<void> {
    return this.api.put<void>(`/intervention-areas/${id}`, request);
  }

  allocateInterventionArea(request: AllocateInterventionAreaRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/intervention-areas/allocate', request);
  }
}
