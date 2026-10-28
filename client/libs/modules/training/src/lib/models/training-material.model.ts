export interface TrainingMaterialDto {
  id: string;
  trainingProgramId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  materialType: string;
  createdAt: string;
}

export interface AddTrainingMaterialRequest {
  trainingProgramId: string;
  title: string;
  materialType: string;
  description?: string;
  fileUrl?: string;
}
