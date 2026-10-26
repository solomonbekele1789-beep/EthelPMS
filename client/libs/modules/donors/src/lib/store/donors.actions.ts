import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DonorDto, CreateDonorRequest } from '../models/donor.model';
import { GrantDto, ComplianceDashboardDto, CreateGrantRequest } from '../models/grant.model';

export const DonorsActions = createActionGroup({
  source: 'Donors',
  events: {
    'Load Donors': props<{ page?: number; pageSize?: number; isActive?: boolean; search?: string }>(),
    'Load Donors Success': props<{ donors: DonorDto[]; totalCount: number }>(),
    'Load Donors Failure': props<{ error: string }>(),
    'Load Donor': props<{ id: string }>(),
    'Load Donor Success': props<{ donor: DonorDto }>(),
    'Load Donor Failure': props<{ error: string }>(),
    'Create Donor': props<{ request: CreateDonorRequest }>(),
    'Create Donor Success': props<{ id: string }>(),
    'Create Donor Failure': props<{ error: string }>(),
    'Load Grants': props<{ page?: number; pageSize?: number; donorId?: string; status?: string; projectId?: string }>(),
    'Load Grants Success': props<{ grants: GrantDto[]; totalCount: number }>(),
    'Load Grants Failure': props<{ error: string }>(),
    'Load Grant': props<{ id: string }>(),
    'Load Grant Success': props<{ grant: GrantDto }>(),
    'Load Grant Failure': props<{ error: string }>(),
    'Create Grant': props<{ request: CreateGrantRequest }>(),
    'Create Grant Success': props<{ id: string }>(),
    'Create Grant Failure': props<{ error: string }>(),
    'Load Compliance Dashboard': emptyProps(),
    'Load Compliance Dashboard Success': props<{ items: ComplianceDashboardDto[] }>(),
    'Load Compliance Dashboard Failure': props<{ error: string }>(),
  },
});
