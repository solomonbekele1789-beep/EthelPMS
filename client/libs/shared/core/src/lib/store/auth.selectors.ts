import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../models/auth.model';
import { AUTH_FEATURE_KEY } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectPermissions = createSelector(
  selectAuthState,
  (state) => state.permissions
);

export const selectRoles = createSelector(
  selectAuthState,
  (state) => state.roles
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserFullName = createSelector(
  selectUser,
  (user) => (user ? `${user.firstName} ${user.lastName}` : '')
);

export const selectUserOrganization = createSelector(
  selectUser,
  (user) => (user ? { id: user.organizationId, name: user.organizationName } : null)
);

// Aliases used by layout components
export const selectCurrentUser = selectUser;
