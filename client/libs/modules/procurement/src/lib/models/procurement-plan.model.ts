export type ProcurementStatus = 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Cancelled';
export type ProcurementMethod = 'DirectPurchase' | 'RequestForQuotation' | 'OpenBidding' | 'RestrictedBidding' | 'SingleSource';

export interface ProcurementPlanDto {
  id: string;
  title: string;
  referenceNumber: string;
  projectId: string;
  fiscalYear: number;
  status: ProcurementStatus;
  description?: string;
  totalEstimatedValue: number;
  items: ProcurementPlanItemDto[];
}

export interface ProcurementPlanItemDto {
  id: string;
  description: string;
  estimatedCost: number;
  method: ProcurementMethod;
  quantity: number;
  unit?: string;
  plannedQuarter: number;
}

export interface CreateProcurementPlanRequest {
  title: string;
  projectId: string;
  fiscalYear: number;
  description?: string;
}

export interface AddPlanItemRequest {
  planId: string;
  description: string;
  estimatedCost: number;
  method: ProcurementMethod;
  quantity: number;
  unit?: string;
  plannedQuarter: number;
}
