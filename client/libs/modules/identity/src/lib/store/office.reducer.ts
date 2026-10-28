import { createReducer, on } from '@ngrx/store';
import { OfficeDto, OfficeListItemDto } from '../models/office.model';
import { OfficeActions } from './office.actions';

export const OFFICES_FEATURE_KEY = 'offices';

export interface OfficeState {
  offices: OfficeListItemDto[];
  totalCount: number;
  selectedOffice: OfficeDto | null;
  loading: boolean;
  error: string | null;
}

export const initialOfficeState: OfficeState = {
  offices: [],
  totalCount: 0,
  selectedOffice: null,
  loading: false,
  error: null,
};

export const officeReducer = createReducer(
  initialOfficeState,

  on(OfficeActions.loadOffices, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OfficeActions.loadOfficesSuccess, (state, { offices, totalCount }) => ({
    ...state,
    offices,
    totalCount,
    loading: false,
  })),
  on(OfficeActions.loadOfficesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(OfficeActions.loadOffice, (state) => ({
    ...state,
    loading: true,
    selectedOffice: null,
  })),
  on(OfficeActions.loadOfficeSuccess, (state, { office }) => ({
    ...state,
    selectedOffice: office,
    loading: false,
  })),
  on(OfficeActions.loadOfficeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(OfficeActions.createOffice, (state) => ({
    ...state,
    loading: true,
  })),
  on(OfficeActions.createOfficeSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(OfficeActions.createOfficeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(OfficeActions.updateOffice, (state) => ({
    ...state,
    loading: true,
  })),
  on(OfficeActions.updateOfficeSuccess, (state, { office }) => ({
    ...state,
    selectedOffice: office,
    loading: false,
    error: null,
  })),
  on(OfficeActions.updateOfficeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(OfficeActions.deleteOffice, (state) => ({
    ...state,
    loading: true,
  })),
  on(OfficeActions.deleteOfficeSuccess, (state, { id }) => ({
    ...state,
    offices: state.offices.filter((office) => office.id !== id),
    loading: false,
  })),
  on(OfficeActions.deleteOfficeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
