export type AssetStatus = 'Active' | 'InMaintenance' | 'Disposed' | 'Lost' | 'Transferred';
export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';

export interface AssetDto {
  id: string;
  assetCode: string;
  name: string;
  description?: string;
  assetCategoryId: string;
  categoryName: string;
  serialNumber?: string;
  modelNumber?: string;
  location: string;
  donorGrantId?: string;
  projectId?: string;
  purchaseDate: string;
  purchaseCost: number;
  currentBookValue: number;
  depreciationMethod: string;
  usefulLifeYears: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  status: AssetStatus;
  condition: AssetCondition;
  assignedToName?: string;
}

export interface AssetAssignmentDto {
  id: string;
  assetId: string;
  assetName: string;
  assignedToUserId: string;
  assignedToName: string;
  assignmentDate: string;
  returnDate?: string;
  notes?: string;
}

export interface AssetTransferDto {
  id: string;
  assetId: string;
  assetName: string;
  fromLocation: string;
  toLocation: string;
  transferDate: string;
  reason: string;
  approvedBy: string;
}

export interface RegisterAssetRequest {
  name: string;
  assetCategoryId: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  depreciationMethod: string;
  usefulLifeYears: number;
  residualValue: number;
  serialNumber?: string;
  modelNumber?: string;
  donorGrantId?: string;
  projectId?: string;
  purchaseOrderId?: string;
  description?: string;
}

export interface UpdateAssetRequest {
  id: string;
  name: string;
  description?: string;
  serialNumber?: string;
  modelNumber?: string;
}

export interface TransferAssetRequest {
  assetId: string;
  toLocation: string;
  transferDate: string;
  reason: string;
  approvedBy: string;
}

export interface AssignAssetRequest {
  assetId: string;
  assignedToUserId: string;
  assignedToName: string;
  assignmentDate: string;
  notes?: string;
}

export interface CalculateDepreciationRequest {
  assetId: string;
  asOfDate: string;
}
