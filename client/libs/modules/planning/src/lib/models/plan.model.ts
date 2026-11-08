export interface PlanEntryDto {
  id: string;
  level: PlanLevel;
  projectId: string;
  parentId?: string;
  title: string;
  description?: string;
  fiscalYear?: number;
  quarter?: number;
  month?: number;
  weekNumber?: number;
  dayDate?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  plannedBudget: number;
  actualBudget: number;
  beneficiariesMale: number;
  beneficiariesFemale: number;
  totalBeneficiaries: number;
  status: PlanStatus;
  progressPercentage: number;
  approvalStatus: ApprovalStatus;
  submittedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  indicatorAllocations: PlanIndicatorAllocationDto[];
  planActivities: PlanActivityDto[];
  createdAt: string;
  createdBy: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface PlanEntryListItemDto {
  id: string;
  projectId?: string;
  level: PlanLevel;
  title: string;
  fiscalYear?: number;
  quarter?: number;
  month?: number;
  weekNumber?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
  actualBudget?: number;
  beneficiariesMale?: number;
  beneficiariesFemale?: number;
  totalBeneficiaries?: number;
  status: PlanStatus;
  approvalStatus: ApprovalStatus;
  progressPercentage: number;
  childCount: number;
}

export interface PlanHierarchyDto {
  id: string;
  level: PlanLevel;
  title: string;
  status: PlanStatus;
  approvalStatus: ApprovalStatus;
  progressPercentage: number;
  plannedBudget: number;
  children: PlanHierarchyDto[];
}

export interface PlanActivityDto {
  id: string;
  planEntryId: string;
  outcomeId?: string;
  outputId?: string;
  activityId?: string;
  plannedBudget: number;
  responsibleUserId?: string;
}

export interface PlanIndicatorAllocationDto {
  id: string;
  indicatorId: string;
  targetValue: number;
  actualValue?: number;
}

export interface CreatePlanEntryRequest {
  level: PlanLevel;
  projectId: string;
  parentId?: string;
  title: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
  fiscalYear?: number;
  quarter?: number;
  month?: number;
  weekNumber?: number;
  dayDate?: string;
  beneficiariesMale?: number;
  beneficiariesFemale?: number;
}

export interface UpdatePlanEntryRequest {
  planEntryId: string;
  title: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
}

export interface RejectPlanRequest {
  planEntryId: string;
  reason: string;
}

export interface CreatePlanActivityRequest {
  planEntryId: string;
  outcomeId?: string;
  outputId?: string;
  activityId?: string;
  plannedBudget: number;
  responsibleUserId?: string;
}

export type PlanLevel = 'Annual' | 'Quarterly' | 'Monthly' | 'Weekly' | 'Daily';
export type PlanStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Delayed' | 'Pending' | 'Cancelled';
export type ApprovalStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
