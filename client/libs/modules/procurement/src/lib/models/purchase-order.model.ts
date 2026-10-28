export type PurchaseOrderStatus = 'Draft' | 'Issued' | 'PartiallyReceived' | 'FullyReceived' | 'Closed' | 'Cancelled';

export interface PurchaseOrderDto {
  id: string;
  referenceNumber: string;
  purchaseRequestId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItemDto[];
}

export interface PurchaseOrderItemDto {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  receivedQuantity: number;
}

export interface CreatePurchaseOrderRequest {
  referenceNumber: string;
  purchaseRequestId: string;
  supplierId: string;
  rfqResponseId?: string;
  expectedDeliveryDate?: string;
  paymentTerms?: string;
}

export interface RfqDto {
  id: string;
  referenceNumber: string;
  purchaseRequestId: string;
  status: string;
  deadline: string;
  minimumResponses: number;
  items: RfqItemDto[];
  responses: RfqResponseDto[];
}

export interface RfqItemDto {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface RfqResponseDto {
  id: string;
  supplierId: string;
  totalQuotedAmount: number;
  submittedDate: string;
  deliveryDays: number;
  notes?: string;
  isSelected: boolean;
}

export interface CreateRfqRequest {
  referenceNumber: string;
  purchaseRequestId: string;
  deadline: string;
  termsAndConditions?: string;
  minimumResponses?: number;
}

export interface SubmitRfqResponseRequest {
  rfqId: string;
  supplierId: string;
  totalQuotedAmount: number;
  deliveryDays: number;
  notes?: string;
}

export interface EvaluateBidRequest {
  rfqId: string;
  rfqResponseId: string;
  supplierId: string;
  technicalScore: number;
  financialScore: number;
  technicalWeight: number;
  financialWeight: number;
  notes?: string;
}
