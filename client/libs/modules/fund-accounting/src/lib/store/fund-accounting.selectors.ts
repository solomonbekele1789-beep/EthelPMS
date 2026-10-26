import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FundAccountingState, FUND_ACCOUNTING_FEATURE_KEY } from './fund-accounting.reducer';

export const selectFundAccountingState = createFeatureSelector<FundAccountingState>(FUND_ACCOUNTING_FEATURE_KEY);
export const selectAccounts = createSelector(selectFundAccountingState, (state) => state.accounts);
export const selectCategories = createSelector(selectFundAccountingState, (state) => state.categories);
export const selectFundCodes = createSelector(selectFundAccountingState, (state) => state.fundCodes);
export const selectJournalEntries = createSelector(selectFundAccountingState, (state) => state.journalEntries);
export const selectJournalEntriesTotalCount = createSelector(selectFundAccountingState, (state) => state.journalEntriesTotalCount);
export const selectSelectedBudget = createSelector(selectFundAccountingState, (state) => state.selectedBudget);
export const selectFundAccountingLoading = createSelector(selectFundAccountingState, (state) => state.loading);
export const selectFundAccountingError = createSelector(selectFundAccountingState, (state) => state.error);
