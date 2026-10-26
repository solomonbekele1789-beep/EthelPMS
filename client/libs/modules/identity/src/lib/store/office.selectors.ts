import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OfficeState, OFFICES_FEATURE_KEY } from './office.reducer';

export const selectOfficeState = createFeatureSelector<OfficeState>(OFFICES_FEATURE_KEY);

export const selectOffices = createSelector(selectOfficeState, (state) => state.offices);

export const selectOfficeTotalCount = createSelector(selectOfficeState, (state) => state.totalCount);

export const selectOfficesLoading = createSelector(selectOfficeState, (state) => state.loading);

export const selectOfficesError = createSelector(selectOfficeState, (state) => state.error);

export const selectSelectedOffice = createSelector(selectOfficeState, (state) => state.selectedOffice);
