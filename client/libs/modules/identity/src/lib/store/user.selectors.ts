import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState, USERS_FEATURE_KEY } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>(USERS_FEATURE_KEY);

export const selectUsers = createSelector(selectUserState, (state) => state.users);

export const selectUserTotalCount = createSelector(selectUserState, (state) => state.totalCount);

export const selectUsersLoading = createSelector(selectUserState, (state) => state.loading);

export const selectUsersError = createSelector(selectUserState, (state) => state.error);

export const selectSelectedUser = createSelector(selectUserState, (state) => state.selectedUser);
