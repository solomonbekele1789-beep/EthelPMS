import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { RoleDto, RoleListItemDto, PermissionDto, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';

export const RoleActions = createActionGroup({
  source: 'Roles',
  events: {
    'Load Roles': props<{ page: number; pageSize: number; search?: string }>(),
    'Load Roles Success': props<{ roles: RoleListItemDto[]; totalCount: number }>(),
    'Load Roles Failure': props<{ error: string }>(),
    'Load Role': props<{ id: string }>(),
    'Load Role Success': props<{ role: RoleDto }>(),
    'Load Role Failure': props<{ error: string }>(),
    'Load Permissions': emptyProps(),
    'Load Permissions Success': props<{ permissions: PermissionDto[] }>(),
    'Load Permissions Failure': props<{ error: string }>(),
    'Create Role': props<{ request: CreateRoleRequest }>(),
    'Create Role Success': props<{ role: RoleDto }>(),
    'Create Role Failure': props<{ error: string }>(),
    'Update Role': props<{ id: string; request: UpdateRoleRequest }>(),
    'Update Role Success': props<{ role: RoleDto }>(),
    'Update Role Failure': props<{ error: string }>(),
    'Delete Role': props<{ id: string }>(),
    'Delete Role Success': props<{ id: string }>(),
    'Delete Role Failure': props<{ error: string }>(),
  }
});
