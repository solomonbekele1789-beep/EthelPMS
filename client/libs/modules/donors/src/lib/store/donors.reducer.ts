import { createFeature, createReducer, on } from '@ngrx/store';
import { DonorDto } from '../models/donor.model';
import { GrantDto, ComplianceDashboardDto } from '../models/grant.model';
import { DonorsActions } from './donors.actions';

export const DONORS_FEATURE_KEY = 'donors';

export interface DonorsState {
  donors: DonorDto[];
  donorsTotalCount: number;
  selectedDonor: DonorDto | null;
  grants: GrantDto[];
  grantsTotalCount: number;
  selectedGrant: GrantDto | null;
  complianceDashboard: ComplianceDashboardDto[];
  loading: boolean;
  error: string | null;
}

const initialState: DonorsState = {
  donors: [],
  donorsTotalCount: 0,
  selectedDonor: null,
  grants: [],
  grantsTotalCount: 0,
  selectedGrant: null,
  complianceDashboard: [],
  loading: false,
  error: null,
};

export const donorsFeature = createFeature({
  name: DONORS_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    // --- Donors list ---
    on(DonorsActions.loadDonors, (state) => ({ ...state, loading: true, error: null })),
    on(DonorsActions.loadDonorsSuccess, (state, { donors, totalCount }) => ({
      ...state, donors, donorsTotalCount: totalCount, loading: false,
    })),
    on(DonorsActions.loadDonorsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Single donor ---
    on(DonorsActions.loadDonor, (state) => ({ ...state, loading: true, error: null })),
    on(DonorsActions.loadDonorSuccess, (state, { donor }) => ({
      ...state, selectedDonor: donor, loading: false,
    })),
    on(DonorsActions.loadDonorFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Create donor ---
    on(DonorsActions.createDonor, (state) => ({ ...state, loading: true, error: null })),
    on(DonorsActions.createDonorSuccess, (state) => ({ ...state, loading: false })),
    on(DonorsActions.createDonorFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Grants list ---
    on(DonorsActions.loadGrants, (state) => ({ ...state, loading: true, error: null })),
    on(DonorsActions.loadGrantsSuccess, (state, { grants, totalCount }) => ({
      ...state, grants, grantsTotalCount: totalCount, loading: false,
    })),
    on(DonorsActions.loadGrantsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Single grant ---
    on(DonorsActions.loadGrant, (state) => ({ ...state, loading: true, error: null })),
    on(DonorsActions.loadGrantSuccess, (state, { grant }) => ({
      ...state, selectedGrant: grant, loading: false,
    })),
    on(DonorsActions.loadGrantFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Create grant ---
    on(DonorsActions.createGrant, (state) => ({ ...state, loading: true, error: null })),
    on(DonorsActions.createGrantSuccess, (state) => ({ ...state, loading: false })),
    on(DonorsActions.createGrantFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Compliance dashboard ---
    on(DonorsActions.loadComplianceDashboard, (state) => ({ ...state, loading: true, error: null })),
    on(DonorsActions.loadComplianceDashboardSuccess, (state, { items }) => ({
      ...state, complianceDashboard: items, loading: false,
    })),
    on(DonorsActions.loadComplianceDashboardFailure, (state, { error }) => ({ ...state, error, loading: false })),
  ),
});

export const donorsReducer = donorsFeature.reducer;
