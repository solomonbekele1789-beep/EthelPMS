export interface FeedbackDashboardDto {
  totalCount: number;
  resolvedCount: number;
  avgResolutionDays: number;
  slaBreachedCount: number;
  byCategory: CategorySummaryDto[];
  byStatus: StatusSummaryDto[];
}

export interface CategorySummaryDto {
  categoryName: string;
  count: number;
}

export interface StatusSummaryDto {
  status: string;
  count: number;
}
