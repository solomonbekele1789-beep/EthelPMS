export interface DipItemDto {
  id: string;
  activityId: string;
  projectId: string;
  title: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  budgetAllocated: number;
  responsibleUserId?: string;
  status: DipStatus;
  sortOrder: number;
  milestones: DipMilestoneDto[];
}

export interface DipMilestoneDto {
  id: string;
  title: string;
  dueDate: string;
  completedDate?: string;
  isCompleted: boolean;
}

export interface CreateDipItemRequest {
  activityId: string;
  projectId: string;
  title: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  budgetAllocated: number;
  responsibleUserId?: string;
  sortOrder: number;
}

export interface UpdateDipItemRequest {
  dipItemId: string;
  title: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  budgetAllocated: number;
  sortOrder: number;
}

export interface CreateDipMilestoneRequest {
  dipItemId: string;
  title: string;
  dueDate: string;
}

export type DipStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Delayed' | 'Cancelled';
