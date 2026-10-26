export type ScheduleStatus = 'Active' | 'Paused' | 'Failed' | 'Completed';

export interface ReportScheduleDto {
  id: string;
  reportTemplateId: string;
  templateName: string;
  name: string;
  cronExpression: string;
  recipients: string[];
  parameters?: Record<string, unknown>;
  lastRunAt?: string;
  nextRunAt?: string;
  status: ScheduleStatus;
  isActive: boolean;
}

export interface CreateReportScheduleRequest {
  reportTemplateId: string;
  name: string;
  cronExpression: string;
  recipients: string[];
  parameters?: Record<string, unknown>;
}

export interface UpdateReportScheduleRequest {
  id: string;
  name: string;
  cronExpression: string;
  recipients: string[];
  parameters?: Record<string, unknown>;
  isActive: boolean;
}
