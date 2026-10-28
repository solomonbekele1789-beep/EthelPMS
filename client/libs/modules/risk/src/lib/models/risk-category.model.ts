export interface RiskCategoryDto {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRiskCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}
