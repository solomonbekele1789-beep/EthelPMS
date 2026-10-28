import { createReducer, on } from '@ngrx/store';
import { RoleListItemDto, RoleDto, PermissionDto } from '../models/role.model';
import { RoleActions } from './role.actions';

export const ROLES_FEATURE_KEY = 'roles';

export interface RoleState {
  roles: RoleListItemDto[];
  totalCount: number;
  selectedRole: RoleDto | null;
  allPermissions: PermissionDto[];
  loading: boolean;
  error: string | null;
}

export const initialRoleState: RoleState = {
  roles: [],
  totalCount: 0,
  selectedRole: null,
  allPermissions: [],
  loading: false,
  error: null,
};

export const roleReducer = createReducer(
  initialRoleState,

  on(RoleActions.loadRoles, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.loadRolesSuccess, (state, { roles, totalCount }) => ({
    ...state,
    roles,
    totalCount,
    loading: false,
  })),
  on(RoleActions.loadRolesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(RoleActions.loadRole, (state) => ({
    ...state,
    loading: true,
    selectedRole: null,
  })),
  on(RoleActions.loadRoleSuccess, (state, { role }) => ({
    ...state,
    selectedRole: role,
    loading: false,
  })),
  on(RoleActions.loadRoleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(RoleActions.loadPermissions, (state) => ({
    ...state,
    loading: true,
  })),
  on(RoleActions.loadPermissionsSuccess, (state, { permissions }) => ({
    ...state,
    allPermissions: permissions,
    loading: false,
  })),
  on(RoleActions.loadPermissionsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(RoleActions.createRole, (state) => ({
    ...state,
    loading: true,
  })),
  on(RoleActions.createRoleSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(RoleActions.createRoleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(RoleActions.updateRole, (state) => ({
    ...state,
    loading: true,
  })),
  on(RoleActions.updateRoleSuccess, (state, { role }) => ({
    ...state,
    selectedRole: role,
    loading: false,
    error: null,
  })),
  on(RoleActions.updateRoleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(RoleActions.deleteRole, (state) => ({
    ...state,
    loading: true,
  })),
  on(RoleActions.deleteRoleSuccess, (state, { id }) => ({
    ...state,
    roles: state.roles.filter((r) => r.id !== id),
    loading: false,
  })),
  on(RoleActions.deleteRoleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
