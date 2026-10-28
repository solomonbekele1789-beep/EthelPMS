export type FundType = 'Unrestricted' | 'TemporarilyRestricted' | 'PermanentlyRestricted';
export type RestrictionStatus = 'Active' | 'PartiallyReleased' | 'FullyReleased';

export interface FundCodeDto {
  id: string;
  code: string;
  name: string;
  fundType: FundType;
  description?: string;
  donorGrantId?: string;
  isActive: boolean;
}

export interface FundRestrictionDto {
  id: string;
  fundCodeId: string;
  fundCodeName: string;
  description: string;
  originalAmount: number;
  releasedAmount: number;
  remainingAmount: number;
  status: RestrictionStatus;
  conditionDescription?: string;
  expiryDate?: string;
}

export interface CreateFundCodeRequest {
  code: string;
  name: string;
  fundType: FundType;
  description?: string;
  donorGrantId?: string;
}

export interface UpdateFundCodeRequest {
  id: string;
  name: string;
  description?: string;
}

export interface CreateFundRestrictionRequest {
  fundCodeId: string;
  description: string;
  originalAmount: number;
  conditionDescription?: string;
  expiryDate?: string;
}

export interface ReleaseFundRestrictionRequest {
  fundRestrictionId: string;
  amount: number;
}
