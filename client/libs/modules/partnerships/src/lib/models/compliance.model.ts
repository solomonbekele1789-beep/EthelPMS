export type ComplianceType = 'FinancialAudit' | 'ProgrammaticReview' | 'SafeguardingCheck' | 'EnvironmentalCompliance' | 'AntiCorruption' | 'CapacityAssessment';
export type ComplianceStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'FollowUpRequired';

export interface PartnerComplianceDto {
  id: string;
  organizationId: string;
  subGranteeId: string;
  complianceType: ComplianceType;
  checkDate: string;
  assessorId: string;
  score: number;
  findings: string;
  recommendations?: string;
  status: ComplianceStatus;
  followUpDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateComplianceCheckRequest {
  subGranteeId: string;
  complianceType: ComplianceType;
  checkDate: string;
  assessorId: string;
}

export interface CompleteComplianceCheckRequest {
  id: string;
  score: number;
  findings: string;
}

export interface RequireFollowUpRequest {
  id: string;
  followUpDate: string;
  recommendations: string;
}
