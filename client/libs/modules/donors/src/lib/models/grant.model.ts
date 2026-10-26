export type GrantStatus = 'Draft' | 'Active' | 'Suspended' | 'Completed' | 'Terminated';
export type ComplianceStatus = 'Green' | 'Amber' | 'Red';
export type ConditionStatus = 'Pending' | 'Met' | 'Overdue' | 'Waived';

export interface GrantDto {
  id: string;
  donorId: string;
  grantNumber: string;
  title: string;
  status: GrantStatus;
  totalAmount: number;
  currencyCode: string;
  startDate: string;
  endDate: string;
  complianceStatus: ComplianceStatus;
  description: string | null;
  projectId: string | null;
  coFinancingAmount: number | null;
  coFinancingPartner: string | null;
  conditions: GrantConditionDto[];
  reports: GrantReportDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface GrantConditionDto {
  id: string;
  grantId: string;
  description: string;
  dueDate: string;
  status: ConditionStatus;
  completionNotes: string | null;
  completedDate: string | null;
}

export interface GrantReportDto {
  id: string;
  grantId: string;
  title: string;
  reportType: string;
  dueDate: string;
  submittedDate: string | null;
  isSubmitted: boolean;
  fileUrl: string | null;
  notes: string | null;
}

export interface ComplianceDashboardDto {
  grantId: string;
  donorName: string;
  grantNumber: string;
  complianceStatus: ComplianceStatus;
  overdueConditions: number;
  nextDueDate: string | null;
}

export interface CreateGrantRequest {
  donorId: string;
  grantNumber: string;
  title: string;
  status: GrantStatus;
  totalAmount: number;
  currencyCode: string;
  startDate: string;
  endDate: string;
  description?: string;
  projectId?: string;
}

export interface AddGrantConditionRequest {
  grantId: string;
  description: string;
  dueDate: string;
}

export interface MarkConditionMetRequest {
  conditionId: string;
  notes?: string;
}

export interface SubmitGrantReportRequest {
  reportId: string;
  fileUrl?: string;
}
