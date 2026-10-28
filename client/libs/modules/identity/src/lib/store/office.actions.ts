import { createActionGroup, props } from '@ngrx/store';
import { OfficeDto, OfficeListItemDto, CreateOfficeRequest, UpdateOfficeRequest } from '../models/office.model';

export const OfficeActions = createActionGroup({
  source: 'Offices',
  events: {
    'Load Offices': props<{ page: number; pageSize: number; search?: string }>(),
    'Load Offices Success': props<{ offices: OfficeListItemDto[]; totalCount: number }>(),
    'Load Offices Failure': props<{ error: string }>(),
    'Load Office': props<{ id: string }>(),
    'Load Office Success': props<{ office: OfficeDto }>(),
    'Load Office Failure': props<{ error: string }>(),
    'Create Office': props<{ request: CreateOfficeRequest }>(),
    'Create Office Success': props<{ office: OfficeDto }>(),
    'Create Office Failure': props<{ error: string }>(),
    'Update Office': props<{ id: string; request: UpdateOfficeRequest }>(),
    'Update Office Success': props<{ office: OfficeDto }>(),
    'Update Office Failure': props<{ error: string }>(),
    'Delete Office': props<{ id: string }>(),
    'Delete Office Success': props<{ id: string }>(),
    'Delete Office Failure': props<{ error: string }>(),
  }
});
