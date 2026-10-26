export type Likelihood = 'VeryLow' | 'Low' | 'Medium' | 'High' | 'VeryHigh';
export type Impact = 'Negligible' | 'Minor' | 'Moderate' | 'Major' | 'Catastrophic';
export type RiskStatus = 'Identified' | 'Assessed' | 'Mitigating' | 'Resolved' | 'Accepted' | 'Closed';
export type MitigationStatus = 'Planned' | 'InProgress' | 'Completed' | 'Overdue';

export interface RiskDto {
  id: string;
  projectId: string;
  riskCategoryId: string | null;
  title: string;
  description: string;
  likelihood: Likelihood;
  impact: Impact;
  riskScore: number;
  status: RiskStatus;
  owner: string | null;
  ownerUserId: string | null;
  location: string | null;
  identifiedDate: string;
  resolvedDate: string | null;
  residualRiskNotes: string | null;
  createdAt: string;
  mitigations: RiskMitigationDto[];
  latestAssessment: RiskAssessmentDto | null;
}

export interface RiskMitigationDto {
  id: string;
  riskId: string;
  action: string;
  responsiblePerson: string | null;
  responsibleUserId: string | null;
  plannedDate: string;
  completedDate: string | null;
  status: MitigationStatus;
  estimatedCost: number | null;
  notes: string | null;
  createdAt: string;
}

export interface RiskAssessmentDto {
  id: string;
  riskId: string;
  likelihood: Likelihood;
  impact: Impact;
  riskScore: number;
  notes: string | null;
  assessedBy: string;
  assessmentDate: string;
  source: string | null;
  createdAt: string;
}

export interface RiskMatrixItemDto {
  id: string;
  title: string;
  likelihood: Likelihood;
  impact: Impact;
  riskScore: number;
  status: RiskStatus;
}

export interface CreateRiskRequest {
  projectId: string;
  title: string;
  description: string;
  likelihood: Likelihood;
  impact: Impact;
  riskCategoryId?: string;
  owner?: string;
  ownerUserId?: string;
  location?: string;
  residualRiskNotes?: string;
}

export interface ReassessRiskRequest {
  riskId: string;
  likelihood: Likelihood;
  impact: Impact;
}

export interface CreateMitigationRequest {
  riskId: string;
  action: string;
  plannedDate: string;
  responsiblePerson?: string;
  responsibleUserId?: string;
  estimatedCost?: number;
  notes?: string;
}

export interface RecordAssessmentRequest {
  riskId: string;
  likelihood: Likelihood;
  impact: Impact;
  notes?: string;
  source?: string;
}
