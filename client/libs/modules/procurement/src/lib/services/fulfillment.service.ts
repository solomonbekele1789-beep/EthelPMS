import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  CreateGoodsReceiptRequest,
  CreateSupplierInvoiceRequest,
  CreatePaymentRequestRequest,
} from '../models/fulfillment.model';

@Injectable({ providedIn: 'root' })
export class FulfillmentService {
  private readonly api = inject(ApiService);

  createGoodsReceipt(request: CreateGoodsReceiptRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/goods-receipts', request);
  }

  confirmGoodsReceipt(id: string): Observable<void> {
    return this.api.put<void>(`/goods-receipts/${id}/confirm`);
  }

  createInvoice(request: CreateSupplierInvoiceRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/supplier-invoices', request);
  }

  createPaymentRequest(request: CreatePaymentRequestRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/payment-requests', request);
  }
}
