export type DepreciationMethod = 'StraightLine' | 'ReducingBalance';

export interface AssetCategoryDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultDepreciationMethod: DepreciationMethod;
  defaultUsefulLifeYears: number;
  defaultResidualValuePercent: number;
  isActive: boolean;
}

export interface CreateAssetCategoryRequest {
  code: string;
  name: string;
  defaultDepreciationMethod: DepreciationMethod;
  defaultUsefulLifeYears: number;
  defaultResidualValuePercent: number;
  description?: string;
}

export interface UpdateAssetCategoryRequest {
  id: string;
  name: string;
  description?: string;
  defaultDepreciationMethod: DepreciationMethod;
  defaultUsefulLifeYears: number;
  defaultResidualValuePercent: number;
}
