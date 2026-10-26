export type MealPlanStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
export type IndicatorLevel = 'Goal' | 'Outcome' | 'Output';
export type CollectionFrequency = 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Annually' | 'Baseline' | 'Endline' | 'AdHoc';

export interface MealPlanDto {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: MealPlanStatus;
  resultsAndIndicators?: string;
  dataQuality?: string;
  indicatorProgressPlans?: string;
  learningPlan?: string;
  melActivities?: string;
  melBudget?: string;
  reportingPlan?: string;
  communicationPlan?: string;
  completenessResultsIndicators: number;
  completenessDataQuality: number;
  completenessProgressPlans: number;
  completenessLearningPlan: number;
  completenessMelActivities: number;
  completenessMelBudget: number;
  completenessReportingPlan: number;
  completenessCommunicationPlan: number;
  overallCompleteness: number;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  indicators: MealIndicatorDto[];
}

export interface MealIndicatorDto {
  id: string;
  mealPlanId: string;
  indicatorId?: string;
  name: string;
  level: IndicatorLevel;
  baselineValue?: number;
  targetValue?: number;
  meansOfVerification?: string;
  dataSource?: string;
  collectionTool?: string;
  collectionFrequency: CollectionFrequency;
  analysisMethod?: string;
  qualityRisks?: string;
  verificationMethod?: string;
  disaggregationTypes?: string;
}

export interface IndicatorMeasurementDto {
  id: string;
  mealIndicatorId: string;
  period: string;
  value: number;
  disaggregatedMale?: number;
  disaggregatedFemale?: number;
  notes?: string;
  dataQualityNotes?: string;
  measurementDate: string;
  collectedByUserId?: string;
}

// Request interfaces
export interface CreateMealPlanRequest {
  title: string;
  projectId: string;
  description?: string;
}

export interface UpdateMealPlanRequest {
  mealPlanId: string;
  title: string;
  description?: string;
}

export interface UpdateMealPlanSectionRequest {
  mealPlanId: string;
  sectionNumber: number;
  content?: string;
}

export interface RejectMealPlanRequest {
  mealPlanId: string;
  reason: string;
}

export interface AddMealIndicatorRequest {
  mealPlanId: string;
  name: string;
  level: IndicatorLevel;
  collectionFrequency: CollectionFrequency;
  indicatorId?: string;
  baselineValue?: number;
  targetValue?: number;
}

export interface RecordMeasurementRequest {
  mealIndicatorId: string;
  period: string;
  value: number;
  measurementDate: string;
  notes?: string;
  male?: number;
  female?: number;
}
