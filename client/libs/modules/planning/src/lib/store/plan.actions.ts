import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  PlanEntryDto,
  PlanEntryListItemDto,
  PlanHierarchyDto,
  CreatePlanEntryRequest,
  UpdatePlanEntryRequest,
  RejectPlanRequest,
  PlanLevel,
} from '../models/plan.model';
import { PlanningConfigurationDto } from '../models/planning-config.model';

export const PlanActions = createActionGroup({
  source: 'Planning',
  events: {
    'Load Plans': props<{ page: number; pageSize: number; projectId: string; level?: PlanLevel; parentId?: string }>(),
    'Load Plans Success': props<{ plans: PlanEntryListItemDto[]; totalCount: number }>(),
    'Load Plans Failure': props<{ error: string }>(),
    'Load Plan': props<{ id: string }>(),
    'Load Plan Success': props<{ plan: PlanEntryDto }>(),
    'Load Plan Failure': props<{ error: string }>(),
    'Load Hierarchy': props<{ projectId: string; fiscalYear?: number }>(),
    'Load Hierarchy Success': props<{ hierarchy: PlanHierarchyDto[] }>(),
    'Load Hierarchy Failure': props<{ error: string }>(),
    'Create Plan': props<{ request: CreatePlanEntryRequest }>(),
    'Create Plan Success': props<{ id: string }>(),
    'Create Plan Failure': props<{ error: string }>(),
    'Update Plan': props<{ id: string; request: UpdatePlanEntryRequest }>(),
    'Update Plan Success': emptyProps(),
    'Update Plan Failure': props<{ error: string }>(),
    'Submit Plan': props<{ id: string }>(),
    'Submit Plan Success': props<{ id: string }>(),
    'Submit Plan Failure': props<{ error: string }>(),
    'Approve Plan': props<{ id: string }>(),
    'Approve Plan Success': props<{ id: string }>(),
    'Approve Plan Failure': props<{ error: string }>(),
    'Reject Plan': props<{ id: string; request: RejectPlanRequest }>(),
    'Reject Plan Success': props<{ id: string }>(),
    'Reject Plan Failure': props<{ error: string }>(),
    'Load Config': emptyProps(),
    'Load Config Success': props<{ config: PlanningConfigurationDto }>(),
    'Load Config Failure': props<{ error: string }>(),
  }
});
