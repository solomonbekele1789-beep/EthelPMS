// Dashboard Types/Enums as union types
export type DashboardType =
  | 'Executive'
  | 'ProjectPortfolio'
  | 'Finance'
  | 'MEAL'
  | 'Participant'
  | 'Risk'
  | 'Procurement'
  | 'Performance'
  | 'Custom';

// DTOs
export interface DashboardConfigDto {
  id: string;
  name: string;
  dashboardType: DashboardType;
  description?: string;
  ownerId: string;
  isDefault: boolean;
  isShared: boolean;
  layoutJson?: string;
  widgetCount: number;
  createdAt: string;
}

export interface DashboardSummaryDto {
  id: string;
  name: string;
  dashboardType: DashboardType;
  widgetCount: number;
  isDefault: boolean;
}

// Request interfaces
export interface CreateDashboardRequest {
  name: string;
  dashboardType: DashboardType;
  description?: string;
  isShared: boolean;
  layoutJson?: string;
}

export interface UpdateDashboardRequest {
  id: string;
  name: string;
  description?: string;
  isShared: boolean;
  layoutJson?: string;
}
