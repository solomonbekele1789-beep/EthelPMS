import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  CreateRfqRequest,
  SubmitRfqResponseRequest,
  EvaluateBidRequest,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class RfqService {
  private readonly api = inject(ApiService);

  createRfq(request: CreateRfqRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/rfqs', request);
  }

  submitResponse(request: SubmitRfqResponseRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/rfqs/${request.rfqId}/responses`, request);
  }

  evaluateBid(rfqId: string, request: EvaluateBidRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/rfqs/${rfqId}/evaluations`, request);
  }
}
