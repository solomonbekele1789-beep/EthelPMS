import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { OrganizationDto, UpdateOrganizationRequest } from '../models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly api = inject(ApiService);

  getOrganization(): Observable<OrganizationDto> {
    return this.api.get<OrganizationDto>('/organizations');
  }

  updateOrganization(request: UpdateOrganizationRequest): Observable<OrganizationDto> {
    return this.api.put<OrganizationDto>('/organizations', request);
  }
}
