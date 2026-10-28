export type DisposalStatus = 'Pending' | 'DonorApprovalRequested' | 'DonorApproved' | 'DonorRejected' | 'Disposed';

export interface AssetDisposalDto {
  id: string;
  assetId: string;
  assetName: string;
  status: DisposalStatus;
  reason: string;
  disposalMethod: string;
  disposalValue?: number;
  bookValueAtDisposal: number;
  disposalDate?: string;
  requiresDonorApproval: boolean;
  donorApprovalReference?: string;
}

export interface InitiateDisposalRequest {
  assetId: string;
  reason: string;
  disposalMethod: string;
  requiresDonorApproval: boolean;
  donorGrantId?: string;
}

export interface CompleteDisposalRequest {
  disposalId: string;
  disposalValue: number;
  disposalDate: string;
}
