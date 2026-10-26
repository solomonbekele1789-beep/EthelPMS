// Report Types/Enums as union types
export type ReportType = 'Activity' | 'Weekly' | 'Monthly' | 'Quarterly' | 'BiAnnual' | 'Annual' | 'Incident';
export type ReportStatus = 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected';
export type ApprovalAction = 'Approved' | 'Rejected' | 'ReturnedForRevision';
export type SectionType = 'Narrative' | 'Financial' | 'Indicator' | 'Beneficiary' | 'Risk' | 'Challenge' | 'Custom';

// DTOs
export interface ReportDto {
  id: string;
  title: string;
  reportType: ReportType;
  status: ReportStatus;
  periodStart: string;
  periodEnd: string;
  fiscalYear?: number;
  quarter?: number;
  month?: number;
  weekNumber?: number;
  projectId: string;
  reportTemplateId?: string;
  activityId?: string;
  plannedBudget: number;
  actualSpent: number;
  cumulativeYtdSpent?: number;
  variance: number;
  budgetUtilizationRate: number;
  executiveSummary?: string;
  challenges?: string;
  lessonsLearned?: string;
  recommendations?: string;
  incidentDate?: string;
  incidentLocation?: string;
  incidentType?: string;
  peopleInvolved?: string;
  injuriesDescription?: string;
  impactDescription?: string;
  submittedBy?: string;
  submittedAt?: string;
  currentApprovalLevel: number;
  requiredApprovalLevels: number;
  finalApprovedBy?: string;
  finalApprovedAt?: string;
  rejectionReason?: string;
  submissionDeadline?: string;
  assignedToUserId?: string;
  createdAt: string;
  createdBy?: string;
  sections: ReportSectionDto[];
  approvals: ReportApprovalDto[];
  comments: ReportCommentDto[];
}

export interface ReportListItemDto {
  id: string;
  title: string;
  reportType: ReportType;
  status: ReportStatus;
  periodStart: string;
  periodEnd: string;
  fiscalYear?: number;
  projectId: string;
  plannedBudget: number;
  actualSpent: number;
  submissionDeadline?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ReportSectionDto {
  id: string;
  reportId: string;
  templateSectionId?: string;
  title: string;
  sectionType: SectionType;
  sortOrder: number;
  content?: string;
  dataEntries: ReportDataEntryDto[];
}

export interface ReportDataEntryDto {
  id: string;
  reportSectionId: string;
  key: string;
  label?: string;
  stringValue?: string;
  numericValue?: number;
  sortOrder: number;
  indicatorId?: string;
  activityId?: string;
}

export interface ReportApprovalDto {
  id: string;
  reportId: string;
  userId: string;
  approvalLevel: number;
  action: ApprovalAction;
  comments?: string;
  actionDate: string;
}

export interface ReportCommentDto {
  id: string;
  reportId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  replies: ReportCommentDto[];
}

export interface FinancialSummaryDto {
  projectId: string;
  totalPlannedBudget: number;
  totalActualSpent: number;
  variance: number;
  budgetUtilizationRate: number;
  cumulativeYtdSpent: number;
  burnRate: number;
  reportCount: number;
}

// Request interfaces
export interface CreateReportRequest {
  title: string;
  reportType: ReportType;
  projectId: string;
  periodStart: string;
  periodEnd: string;
  reportTemplateId?: string;
  activityId?: string;
  fiscalYear?: number;
  quarter?: number;
  month?: number;
  weekNumber?: number;
  plannedBudget: number;
}

export interface UpdateReportRequest {
  reportId: string;
  title: string;
  executiveSummary?: string;
  challenges?: string;
  lessonsLearned?: string;
  recommendations?: string;
  plannedBudget: number;
  actualSpent: number;
  cumulativeYtdSpent?: number;
}

export interface ApproveReportRequest {
  reportId: string;
  approvalLevel: number;
  comments?: string;
}

export interface RejectReportRequest {
  reportId: string;
  approvalLevel: number;
  reason: string;
}

export interface AddReportCommentRequest {
  reportId: string;
  content: string;
  parentCommentId?: string;
}

export interface CreateReportSectionRequest {
  reportId: string;
  title: string;
  sectionType: SectionType;
  sortOrder: number;
  templateSectionId?: string;
  content?: string;
}

export interface AddReportDataEntryRequest {
  reportSectionId: string;
  key: string;
  label?: string;
  stringValue?: string;
  numericValue?: number;
  sortOrder: number;
  indicatorId?: string;
  activityId?: string;
}
