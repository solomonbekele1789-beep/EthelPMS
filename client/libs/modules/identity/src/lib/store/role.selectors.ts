import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState, ROLES_FEATURE_KEY } from './role.reducer';
import { PermissionDto } from '../models/role.model';

export const selectRoleState = createFeatureSelector<RoleState>(ROLES_FEATURE_KEY);

export const selectRoles = createSelector(selectRoleState, (state) => state.roles);

export const selectRoleTotalCount = createSelector(selectRoleState, (state) => state.totalCount);

export const selectRolesLoading = createSelector(selectRoleState, (state) => state.loading);

export const selectRolesError = createSelector(selectRoleState, (state) => state.error);

export const selectSelectedRole = createSelector(selectRoleState, (state) => state.selectedRole);

export const selectAllPermissions = createSelector(selectRoleState, (state) => state.allPermissions);

export const selectPermissionsByModule = createSelector(
  selectAllPermissions,
  (permissions) => {
    const grouped = new Map<string, PermissionDto[]>();
    for (const permission of permissions) {
      const existing = grouped.get(permission.module) ?? [];
      existing.push(permission);
      grouped.set(permission.module, existing);
    }
    return grouped;
  }
);
