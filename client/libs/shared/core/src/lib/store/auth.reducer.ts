import { createReducer, on } from '@ngrx/store';
import { AuthState } from '../models/auth.model';
import { AuthActions } from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

export const initialAuthState: AuthState = {
  user: null,
  permissions: [],
  roles: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    permissions: response.user?.permissions ?? [],
    roles: response.user?.roles ?? [],
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    permissions: [],
    roles: [],
    isAuthenticated: false,
    isLoading: false,
    error,
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState,
  })),

  on(AuthActions.restoreSession, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.restoreSessionSuccess, (state, { user }) => ({
    ...state,
    user,
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.restoreSessionFailure, (state) => ({
    ...state,
    user: null,
    permissions: [],
    roles: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.refreshTokenSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    permissions: response.user?.permissions ?? [],
    roles: response.user?.roles ?? [],
    isAuthenticated: true,
  })),

  on(AuthActions.updatePermissions, (state, { permissions, roles }) => ({
    ...state,
    permissions,
    roles,
  }))
);
