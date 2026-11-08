import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  InterventionAreaDto,
  ProjectInterventionAreaDto,
  CreateInterventionAreaRequest,
  UpdateInterventionAreaRequest,
  AllocateInterventionAreaRequest,
} from '../models/intervention-area.model';

@Injectable({ providedIn: 'root' })
export class InterventionAreaService {
  private readonly api = inject(ApiService);

  listInterventionAreas(flat = false): Observable<InterventionAreaDto[]> {
    return this.api.get<InterventionAreaDto[]>(`/intervention-areas${flat ? '?flat=true' : ''}`);
  }

  listProjectInterventionAreas(projectId: string): Observable<ProjectInterventionAreaDto[]> {
    return this.api.get<ProjectInterventionAreaDto[]>(`/projects/${projectId}/intervention-areas`);
  }

  createInterventionArea(request: CreateInterventionAreaRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/intervention-areas', request);
  }

  updateInterventionArea(id: string, request: UpdateInterventionAreaRequest): Observable<void> {
    return this.api.put<void>(`/intervention-areas/${id}`, request);
  }

  deleteInterventionArea(id: string): Observable<void> {
    return this.api.delete<void>(`/intervention-areas/${id}`);
  }

  allocateInterventionArea(request: AllocateInterventionAreaRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/intervention-areas/allocate', request);
  }

  deallocateInterventionArea(projectId: string, allocationId: string): Observable<void> {
    return this.api.delete<void>(`/projects/${projectId}/intervention-areas/${allocationId}`);
  }
}
