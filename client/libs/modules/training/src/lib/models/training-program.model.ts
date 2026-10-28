export type TrainingCategory = 'Technical' | 'LifeSkills' | 'Financial' | 'Health' | 'Agriculture' | 'Other';

export interface TrainingProgramDto {
  id: string;
  title: string;
  description?: string;
  category: string;
  projectId: string;
  totalSessions: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTrainingProgramRequest {
  title: string;
  category: TrainingCategory;
  projectId: string;
  totalSessions: number;
  description?: string;
}

export interface UpdateTrainingProgramRequest {
  programId: string;
  title: string;
  category: TrainingCategory;
  totalSessions: number;
  description?: string;
}
