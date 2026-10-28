export type PillarStage = 'P1' | 'P2' | 'P3' | 'P4';
export type GraduationDecisionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface GraduationBenchmarkDto {
  id: string;
  name: string;
  description?: string;
  domain: string;
  thresholdP2: number;
  thresholdP3: number;
  thresholdP4: number;
  requiredForGraduation: boolean;
  weight: number;
  isActive: boolean;
  projectId?: string;
  createdAt: string;
}

export interface GraduationAssessmentDto {
  id: string;
  participantId: string;
  benchmarkId: string;
  score: number;
  pillarStage: PillarStage;
  assessmentDate: string;
  assessedByUserId: string;
  notes?: string;
}

export interface GraduationDecisionDto {
  id: string;
  participantId: string;
  projectId: string;
  status: GraduationDecisionStatus;
  requiredMetPercentage: number;
  isReadyToGraduate: boolean;
  decisionDate?: string;
  approvedByUserId?: string;
  notes?: string;
  rejectionReason?: string;
  graduationDate?: string;
  createdAt: string;
}

export interface GraduationPipelineDto {
  projectId: string;
  totalParticipants: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  p4Count: number;
  graduatedCount: number;
  graduationRate: number;
}

export interface CreateBenchmarkRequest {
  name: string;
  domain: string;
  requiredForGraduation: boolean;
  projectId?: string;
  description?: string;
}

export interface UpdateBenchmarkRequest {
  benchmarkId: string;
  name: string;
  domain: string;
  description?: string;
  thresholdP2: number;
  thresholdP3: number;
  thresholdP4: number;
  requiredForGraduation: boolean;
  weight: number;
}

export interface RecordAssessmentRequest {
  participantId: string;
  benchmarkId: string;
  score: number;
  notes?: string;
}

export interface CreateGraduationDecisionRequest {
  participantId: string;
  projectId: string;
  notes?: string;
}

export interface RejectGraduationRequest {
  decisionId: string;
  reason: string;
}
