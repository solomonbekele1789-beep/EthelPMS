export interface PagedRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export type PaginatedRequest = PagedRequest;

export interface PagedResult<T> {
  items: T[];
  data?: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface ApiErrorItem {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  errorDetails?: ApiErrorItem[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  items?: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code?: string;
  title: string;
  detail: string;
  errors?: Record<string, string[]>;
  errorDetails?: ApiErrorItem[];
}
