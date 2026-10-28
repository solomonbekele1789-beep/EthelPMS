export interface GesiAssessmentDto {
  id: string;
  projectId: string;
  gesiAnalysis?: string;
  genderMarkerScore: number;
  genderMarkerJustification?: string;
  keyFindings?: string;
  recommendations?: string;
  assessmentDate: string;
  createdAt: string;
}

export interface CreateGesiAssessmentRequest {
  projectId: string;
  genderMarkerScore: number;
  assessmentDate: string;
  analysis?: string;
  justification?: string;
}
