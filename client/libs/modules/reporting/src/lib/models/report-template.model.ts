import { SectionType } from './report.model';
import type { ReportType } from './report.model';

export interface ReportTemplateDto {
  id: string;
  name: string;
  description?: string;
  reportType: ReportType;
  isActive: boolean;
  requiredApprovalLevels: number;
  submissionDeadlineDays: number;
  sections: ReportTemplateSectionDto[];
}

export interface ReportTemplateSectionDto {
  id: string;
  reportTemplateId: string;
  title: string;
  sectionType: SectionType;
  sortOrder: number;
  isRequired: boolean;
  instructions?: string;
}

export interface CreateReportTemplateRequest {
  name: string;
  reportType: ReportType;
  description?: string;
  requiredApprovalLevels: number;
  submissionDeadlineDays: number;
}

export interface UpdateReportTemplateRequest {
  templateId: string;
  name: string;
  description?: string;
  requiredApprovalLevels: number;
  submissionDeadlineDays: number;
}

export interface AddTemplateSectionRequest {
  reportTemplateId: string;
  title: string;
  sectionType: SectionType;
  sortOrder: number;
  isRequired: boolean;
  instructions?: string;
}
