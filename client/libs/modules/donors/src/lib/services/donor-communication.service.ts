import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { RecordCommunicationRequest } from '../models/communication.model';

@Injectable({ providedIn: 'root' })
export class DonorCommunicationService {
  private readonly api = inject(ApiService);

  recordCommunication(request: RecordCommunicationRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/donor-communications', request);
  }
}
