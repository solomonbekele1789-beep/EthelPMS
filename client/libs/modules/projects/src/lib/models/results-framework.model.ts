export interface OutcomeDto {
  id: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
  directBeneficiariesMale: number;
  directBeneficiariesFemale: number;
  projectId: string;
  outputs: OutputDto[];
  indicators: IndicatorDto[];
}

export interface OutputDto {
  id: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
  directBeneficiariesMale: number;
  directBeneficiariesFemale: number;
  outcomeId: string;
  activities: ActivityDto[];
  indicators: IndicatorDto[];
}

export interface ActivityDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit?: string;
  lifetimeTarget?: number;
  budgetAllocated?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  assignedUserId?: string;
  outputId: string;
}

export interface IndicatorDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  baselineValue?: number;
  targetValue?: number;
  dataSource?: string;
  collectionFrequency?: string;
  outcomeId?: string;
  outputId?: string;
  unitOfMeasurementId?: string;
  projectId: string;
  targets: IndicatorTargetDto[];
}

export interface IndicatorTargetDto {
  id: string;
  period: string;
  targetValue: number;
  actualValue?: number;
}

export interface CreateOutcomeRequest {
  projectId: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
}

export interface UpdateOutcomeRequest {
  outcomeId: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
}

export interface CreateOutputRequest {
  outcomeId: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
}

export interface UpdateOutputRequest {
  outputId: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
}

export interface CreateActivityRequest {
  outputId: string;
  code: string;
  name: string;
  description?: string;
  unit?: string;
  lifetimeTarget?: number;
  budgetAllocated?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  assignedUserId?: string;
}

export interface UpdateActivityRequest {
  activityId: string;
  code: string;
  name: string;
  description?: string;
  unit?: string;
  lifetimeTarget?: number;
  budgetAllocated?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  assignedUserId?: string;
}

export interface CreateIndicatorRequest {
  projectId: string;
  code: string;
  name: string;
  description?: string;
  baselineValue?: number;
  targetValue?: number;
  dataSource?: string;
  collectionFrequency?: string;
  outcomeId?: string;
  outputId?: string;
  unitOfMeasurementId?: string;
}

export interface UpdateIndicatorRequest {
  indicatorId: string;
  code: string;
  name: string;
  description?: string;
  baselineValue?: number;
  targetValue?: number;
  dataSource?: string;
  collectionFrequency?: string;
}
