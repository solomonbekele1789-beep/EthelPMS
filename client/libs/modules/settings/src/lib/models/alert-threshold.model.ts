export interface AlertThresholdDto {
  id: string;
  module: string;
  metricName: string;
  thresholdValue: number;
  operator: ComparisonOperator;
  alertSeverity: AlertSeverity;
  isActive: boolean;
}

export interface CreateAlertThresholdRequest {
  module: string;
  metricName: string;
  thresholdValue: number;
  operator: ComparisonOperator;
  alertSeverity: AlertSeverity;
  isActive: boolean;
}

export interface UpdateAlertThresholdRequest {
  id: string;
  thresholdValue: number;
  operator: ComparisonOperator;
  alertSeverity: AlertSeverity;
  isActive: boolean;
}

export type ComparisonOperator = 'GreaterThan' | 'LessThan' | 'GreaterThanOrEqual' | 'LessThanOrEqual' | 'Equal';
export type AlertSeverity = 'Info' | 'Warning' | 'Critical';
