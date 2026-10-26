export type EvaluationType = 'Monitoring' | 'Evaluation' | 'Learning';
export type EvaluationStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
export type DacCriteria = 'Relevance' | 'Coherence' | 'Effectiveness' | 'Efficiency' | 'Impact' | 'Sustainability';
export type FindingStatus = 'Open' | 'ResponseProvided' | 'Verified' | 'Closed';

export interface EvaluationDto {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  evaluationType: EvaluationType;
  status: EvaluationStatus;
  primaryDacCriteria?: DacCriteria;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  budget?: number;
  leadEvaluatorUserId?: string;
  externalEvaluator?: string;
  methodology?: string;
  scope?: string;
  keyQuestions?: string;
  createdAt: string;
  findings: EvaluationFindingDto[];
}

export interface EvaluationFindingDto {
  id: string;
  evaluationId: string;
  finding: string;
  dacCriteria?: DacCriteria;
  recommendation?: string;
  status: FindingStatus;
  sortOrder: number;
  managementResponse?: string;
  responsibleUserId?: string;
  responseDate?: string;
  dueDate?: string;
  verifiedByUserId?: string;
  verifiedAt?: string;
  verificationNotes?: string;
}

// Request interfaces
export interface CreateEvaluationRequest {
  title: string;
  projectId: string;
  evaluationType: EvaluationType;
  plannedStartDate: string;
  plannedEndDate: string;
  primaryDacCriteria?: DacCriteria;
  budget?: number;
  description?: string;
}

export interface CompleteEvaluationRequest {
  evaluationId: string;
  actualEndDate: string;
}

export interface AddFindingRequest {
  evaluationId: string;
  finding: string;
  dacCriteria?: DacCriteria;
  recommendation?: string;
  sortOrder: number;
}

export interface RespondToFindingRequest {
  findingId: string;
  response: string;
  responsibleUserId: string;
  dueDate?: string;
}

export interface VerifyFindingRequest {
  findingId: string;
  notes?: string;
}
