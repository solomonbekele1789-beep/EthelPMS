// Widget Types/Enums as union types
export type WidgetType =
  | 'Chart'
  | 'Table'
  | 'KPI'
  | 'Map'
  | 'Timeline'
  | 'Gauge'
  | 'PieChart'
  | 'BarChart'
  | 'LineChart'
  | 'HeatMap';

// DTOs
export interface DashboardWidgetDto {
  id: string;
  dashboardConfigId: string;
  widgetType: WidgetType;
  title: string;
  dataSourceModule: string;
  queryDefinition?: string;
  displayConfig?: string;
  position: number;
  width: number;
  height: number;
  refreshIntervalMinutes?: number;
}

// Request interfaces
export interface AddWidgetRequest {
  dashboardConfigId: string;
  widgetType: WidgetType;
  title: string;
  dataSourceModule: string;
  queryDefinition?: string;
  displayConfig?: string;
  position: number;
  width: number;
  height: number;
  refreshIntervalMinutes?: number;
}

export interface UpdateWidgetRequest {
  id: string;
  title: string;
  queryDefinition?: string;
  displayConfig?: string;
  position: number;
  width: number;
  height: number;
}
