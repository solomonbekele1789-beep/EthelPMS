import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { RiskCategoryDto } from '../models/risk-category.model';
import {
  RiskDto,
  RiskMatrixItemDto,
  CreateRiskRequest,
} from '../models/risk.model';

export const RiskActions = createActionGroup({
  source: 'Risk',
  events: {
    // Categories
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: RiskCategoryDto[] }>(),
    'Load Categories Failure': props<{ error: string }>(),

    // Risks
    'Load Risks': props<{ projectId?: string; status?: string; categoryId?: string; page?: number; pageSize?: number }>(),
    'Load Risks Success': props<{ risks: RiskDto[]; totalCount: number }>(),
    'Load Risks Failure': props<{ error: string }>(),
    'Load Risk': props<{ id: string }>(),
    'Load Risk Success': props<{ risk: RiskDto }>(),
    'Load Risk Failure': props<{ error: string }>(),
    'Create Risk': props<{ request: CreateRiskRequest }>(),
    'Create Risk Success': props<{ id: string }>(),
    'Create Risk Failure': props<{ error: string }>(),

    // Matrix
    'Load Matrix': props<{ projectId: string }>(),
    'Load Matrix Success': props<{ items: RiskMatrixItemDto[] }>(),
    'Load Matrix Failure': props<{ error: string }>(),
  }
});
