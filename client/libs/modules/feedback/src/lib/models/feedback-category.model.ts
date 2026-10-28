import { FeedbackType } from './feedback.model';

export interface FeedbackCategoryDto {
  id: string;
  name: string;
  description: string | null;
  defaultType: FeedbackType;
  slaResponseDays: number;
  slaResolutionDays: number;
  requiresEscalation: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateFeedbackCategoryRequest {
  name: string;
  description?: string;
  defaultType: FeedbackType;
  slaResponseDays: number;
  slaResolutionDays: number;
  requiresEscalation: boolean;
  sortOrder: number;
}

export interface UpdateFeedbackCategoryRequest {
  id: string;
  name: string;
  description?: string;
  defaultType: FeedbackType;
  slaResponseDays: number;
  slaResolutionDays: number;
  requiresEscalation: boolean;
  sortOrder: number;
}
