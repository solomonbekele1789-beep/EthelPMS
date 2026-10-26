import { ProcurementMethod, ProcurementStatus } from './procurement-plan.model';

export interface PurchaseRequestDto {
  id: string;
  referenceNumber: string;
  projectId: string;
  status: ProcurementStatus;
  justification: string;
  totalAmount: number;
  method: ProcurementMethod;
  items: PurchaseRequestItemDto[];
  approvedBy?: string;
  approvalDate?: string;
}

export interface PurchaseRequestItemDto {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  specification?: string;
}

export interface CreatePurchaseRequestRequest {
  referenceNumber: string;
  projectId: string;
  justification: string;
  method: ProcurementMethod;
  procurementPlanItemId?: string;
}

export interface AddPurchaseRequestItemRequest {
  requestId: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  specification?: string;
}
