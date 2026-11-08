import { IndicatorDto } from './results-framework.model';

export interface LogframeDto {
  projectId: string;
  projectCode: string;
  projectName: string;
  outcomes: LogframeOutcomeDto[];
}

export interface LogframeOutcomeDto {
  id: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
  indicators: IndicatorDto[];
  outputs: LogframeOutputDto[];
}

export interface LogframeOutputDto {
  id: string;
  code: string;
  description: string;
  baselineValue?: number;
  targetValue?: number;
  assumptions?: string;
  indicators: IndicatorDto[];
  activities: LogframeActivityDto[];
}

export interface LogframeActivityDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit?: string;
  lifetimeTarget?: number;
  budgetAllocated?: number;
  assumptions?: string;
}
