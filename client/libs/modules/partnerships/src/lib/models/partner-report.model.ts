export type PartnerReportType = 'Financial' | 'Narrative' | 'Combined' | 'Audit' | 'Quarterly' | 'Annual';
export type ReportStatus = 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'RevisionRequested';

export interface PartnerReportDto {
  id: string;
  organizationId: string;
  subGranteeId: string;
  reportType: PartnerReportType;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  title: string;
  narrative?: string;
  financialSummaryJson?: string;
  submittedAt?: string;
  reviewedById?: string;
  reviewedAt?: string;
  status: ReportStatus;
  reviewComments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerReportListDto {
  id: string;
  subGranteeId: string;
  subGranteeName: string;
  reportType: PartnerReportType;
  title: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  status: ReportStatus;
  submittedAt?: string;
}

export interface CreatePartnerReportRequest {
  subGranteeId: string;
  reportType: PartnerReportType;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  title: string;
}

export interface SubmitPartnerReportRequest {
  id: string;
  narrative?: string;
  financialSummaryJson?: string;
}

export interface ReviewPartnerReportRequest {
  id: string;
  status: ReportStatus;
  reviewComments?: string;
}
