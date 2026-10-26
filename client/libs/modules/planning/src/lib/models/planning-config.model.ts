export interface PlanningConfigurationDto {
  id: string;
  enableAnnualPlanning: boolean;
  enableQuarterlyPlanning: boolean;
  enableMonthlyPlanning: boolean;
  enableWeeklyPlanning: boolean;
  enableDailyPlanning: boolean;
  fiscalYearStartMonth: number;
  defaultApprovalRequired: boolean;
}

export interface UpdatePlanningConfigRequest {
  enableAnnualPlanning: boolean;
  enableQuarterlyPlanning: boolean;
  enableMonthlyPlanning: boolean;
  enableWeeklyPlanning: boolean;
  enableDailyPlanning: boolean;
  fiscalYearStartMonth: number;
  defaultApprovalRequired: boolean;
}
