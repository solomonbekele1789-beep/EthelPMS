import { ReportFormat } from './report-template.model';

export interface GeneratedReportDto {
  id: string;
  reportTemplateId: string;
  templateName: string;
  scheduleId?: string;
  generatedById: string;
  generatedAt: string;
  reportFormat: ReportFormat;
  fileName: string;
  fileSize: number;
  storagePath: string;
  expiresAt?: string;
}

export interface GenerateReportRequest {
  reportTemplateId: string;
  parameters?: Record<string, unknown>;
}

export interface ShareReportRequest {
  generatedReportId: string;
  recipientUserIds: string[];
}
