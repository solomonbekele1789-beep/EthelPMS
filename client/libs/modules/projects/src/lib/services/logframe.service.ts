import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { LogframeDto } from '../models/logframe.model';

@Injectable({ providedIn: 'root' })
export class LogframeService {
  private readonly api = inject(ApiService);

  getLogframe(projectId: string): Observable<LogframeDto> {
    return this.api.get<LogframeDto>(`/projects/${projectId}/logframe`);
  }
}
