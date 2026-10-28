export type GrnStatus = 'Draft' | 'Confirmed' | 'PartiallyInvoiced' | 'FullyInvoiced';
export type InvoiceStatus = 'Pending' | 'Verified' | 'Matched' | 'Disputed' | 'Paid';
export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';
export type MatchingStatus = 'Pending' | 'Matched' | 'Discrepancy';

export interface GoodsReceivedNoteDto {
  id: string;
  referenceNumber: string;
  purchaseOrderId: string;
  status: GrnStatus;
  receivedDate: string;
  receivedBy: string;
  items: GrnItemDto[];
}

export interface GrnItemDto {
  id: string;
  purchaseOrderItemId: string;
  quantityReceived: number;
  quantityAccepted: number;
  rejectionReason?: string;
}

export interface SupplierInvoiceDto {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  purchaseOrderId: string;
  grnId?: string;
  status: InvoiceStatus;
  invoiceAmount: number;
  verifiedAmount?: number;
  invoiceDate: string;
  dueDate?: string;
  threeWayMatchStatus: MatchingStatus;
}

export interface PaymentRequestDto {
  id: string;
  referenceNumber: string;
  supplierInvoiceId: string;
  projectId: string;
  status: PaymentStatus;
  amount: number;
  paymentMethod?: string;
  approvedBy?: string;
  approvalDate?: string;
  paymentDate?: string;
}

export interface CreateGoodsReceiptRequest {
  referenceNumber: string;
  purchaseOrderId: string;
  receivedDate: string;
  receivedBy: string;
  deliveryNoteNumber?: string;
  remarks?: string;
}

export interface CreateSupplierInvoiceRequest {
  invoiceNumber: string;
  supplierId: string;
  purchaseOrderId: string;
  invoiceAmount: number;
  invoiceDate: string;
  dueDate?: string;
  grnId?: string;
}

export interface CreatePaymentRequestRequest {
  referenceNumber: string;
  supplierInvoiceId: string;
  projectId: string;
  amount: number;
  paymentMethod?: string;
  bankDetails?: string;
}
