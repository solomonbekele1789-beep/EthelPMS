export type ReportFormat = 'PDF' | 'Excel' | 'Word' | 'CSV';

export interface ReportTemplateDto {
  id: string;
  name: string;
  description?: string;
  module: string;
  reportFormat: ReportFormat;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateReportTemplateRequest {
  name: string;
  description?: string;
  module: string;
  reportFormat: ReportFormat;
  queryDefinition: string;
  templateContent?: string;
  isSystemTemplate: boolean;
}

export interface UpdateReportTemplateRequest {
  id: string;
  name: string;
  description?: string;
  queryDefinition: string;
  templateContent?: string;
  isActive: boolean;
}
