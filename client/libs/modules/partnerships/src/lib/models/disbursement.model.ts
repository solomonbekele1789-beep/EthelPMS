export type DisbursementStatus = 'Pending' | 'Approved' | 'Disbursed' | 'Rejected' | 'Returned';

export interface DisbursementDto {
  id: string;
  organizationId: string;
  subGranteeId: string;
  grantId?: string;
  amount: number;
  currency: string;
  disbursementDate: string;
  referenceNumber: string;
  purpose: string;
  status: DisbursementStatus;
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDisbursementRequest {
  subGranteeId: string;
  grantId?: string;
  amount: number;
  currency: string;
  disbursementDate: string;
  referenceNumber: string;
  purpose: string;
}
