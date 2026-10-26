import { createReducer, on } from '@ngrx/store';
import { UserDto, UserListItemDto } from '../models/user.model';
import { UserActions } from './user.actions';

export const USERS_FEATURE_KEY = 'users';

export interface UserState {
  users: UserListItemDto[];
  totalCount: number;
  selectedUser: UserDto | null;
  loading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  users: [],
  totalCount: 0,
  selectedUser: null,
  loading: false,
  error: null,
};

export const userReducer = createReducer(
  initialUserState,

  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.loadUsersSuccess, (state, { users, totalCount }) => ({
    ...state,
    users,
    totalCount,
    loading: false,
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(UserActions.loadUser, (state) => ({
    ...state,
    loading: true,
    selectedUser: null,
  })),
  on(UserActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    selectedUser: user,
    loading: false,
  })),
  on(UserActions.loadUserFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(UserActions.createUser, (state) => ({
    ...state,
    loading: true,
  })),
  on(UserActions.createUserSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(UserActions.createUserFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(UserActions.updateUser, (state) => ({
    ...state,
    loading: true,
  })),
  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    selectedUser: user,
    loading: false,
    error: null,
  })),
  on(UserActions.updateUserFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(UserActions.deactivateUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.map((u) =>
      u.id === id ? { ...u, isActive: false } : u
    ),
  })),
  on(UserActions.activateUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.map((u) =>
      u.id === id ? { ...u, isActive: true } : u
    ),
  })),
);
