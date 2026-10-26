import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  PlanningConfigurationDto,
  UpdatePlanningConfigRequest,
} from '../models/planning-config.model';

@Injectable({ providedIn: 'root' })
export class PlanningConfigService {
  private readonly api = inject(ApiService);

  getConfig(): Observable<PlanningConfigurationDto> {
    return this.api.get<PlanningConfigurationDto>('/planning/config');
  }

  updateConfig(request: UpdatePlanningConfigRequest): Observable<void> {
    return this.api.put<void>('/planning/config', request);
  }
}
