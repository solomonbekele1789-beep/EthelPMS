export interface LessonLearnedDto {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category?: string;
  context?: string;
  actionTaken?: string;
  impact?: string;
  recommendedAction?: string;
  evaluationId?: string;
  createdAt: string;
}

export interface CreateLessonLearnedRequest {
  projectId: string;
  title: string;
  description: string;
  category?: string;
  evaluationId?: string;
}
