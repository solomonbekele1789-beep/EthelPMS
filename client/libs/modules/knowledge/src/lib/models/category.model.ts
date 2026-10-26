export interface KbCategoryDto {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  sortOrder: number;
  isActive: boolean;
  childCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
  sortOrder: number;
}

export interface UpdateCategoryRequest {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}
