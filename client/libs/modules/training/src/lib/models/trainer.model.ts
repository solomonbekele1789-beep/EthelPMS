export interface TrainerDto {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  specialization?: string;
  organization?: string;
  isInternal: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTrainerRequest {
  fullName: string;
  isInternal: boolean;
  email?: string;
  phone?: string;
  specialization?: string;
  organization?: string;
}
