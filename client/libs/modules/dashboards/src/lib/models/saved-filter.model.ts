// DTOs
export interface SavedFilterDto {
  id: string;
  userId: string;
  name: string;
  module: string;
  filterJson?: string;
  isDefault: boolean;
}

// Request interfaces
export interface CreateSavedFilterRequest {
  name: string;
  module: string;
  filterJson?: string;
  isDefault: boolean;
}
