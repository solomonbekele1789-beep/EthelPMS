import { createFeature, createReducer, on } from '@ngrx/store';
import { ChartOfAccountDto, AccountCategoryDto } from '../models/account.model';
import { FundCodeDto } from '../models/fund-code.model';
import { JournalEntryDto } from '../models/journal-entry.model';
import { BudgetDto } from '../models/budget.model';
import { FundAccountingActions } from './fund-accounting.actions';

export const FUND_ACCOUNTING_FEATURE_KEY = 'fundAccounting';

export interface FundAccountingState {
  accounts: ChartOfAccountDto[];
  categories: AccountCategoryDto[];
  fundCodes: FundCodeDto[];
  journalEntries: JournalEntryDto[];
  journalEntriesTotalCount: number;
  selectedBudget: BudgetDto | null;
  loading: boolean;
  error: string | null;
}

export const initialFundAccountingState: FundAccountingState = {
  accounts: [],
  categories: [],
  fundCodes: [],
  journalEntries: [],
  journalEntriesTotalCount: 0,
  selectedBudget: null,
  loading: false,
  error: null,
};

export const fundAccountingFeature = createFeature({
  name: FUND_ACCOUNTING_FEATURE_KEY,
  reducer: createReducer(
    initialFundAccountingState,

    // Chart of Accounts
    on(FundAccountingActions.loadAccounts, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(FundAccountingActions.loadAccountsSuccess, (state, { accounts }) => ({
      ...state,
      accounts,
      loading: false,
    })),
    on(FundAccountingActions.loadAccountsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(FundAccountingActions.createAccount, (state) => ({
      ...state,
      loading: true,
    })),
    on(FundAccountingActions.createAccountSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(FundAccountingActions.createAccountFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Account Categories
    on(FundAccountingActions.loadCategories, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(FundAccountingActions.loadCategoriesSuccess, (state, { categories }) => ({
      ...state,
      categories,
      loading: false,
    })),
    on(FundAccountingActions.loadCategoriesFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Fund Codes
    on(FundAccountingActions.loadFundCodes, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(FundAccountingActions.loadFundCodesSuccess, (state, { fundCodes }) => ({
      ...state,
      fundCodes,
      loading: false,
    })),
    on(FundAccountingActions.loadFundCodesFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(FundAccountingActions.createFundCode, (state) => ({
      ...state,
      loading: true,
    })),
    on(FundAccountingActions.createFundCodeSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(FundAccountingActions.createFundCodeFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Journal Entries
    on(FundAccountingActions.loadJournalEntries, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(FundAccountingActions.loadJournalEntriesSuccess, (state, { entries, totalCount }) => ({
      ...state,
      journalEntries: entries,
      journalEntriesTotalCount: totalCount,
      loading: false,
    })),
    on(FundAccountingActions.loadJournalEntriesFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(FundAccountingActions.createJournalEntry, (state) => ({
      ...state,
      loading: true,
    })),
    on(FundAccountingActions.createJournalEntrySuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(FundAccountingActions.createJournalEntryFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Budgets
    on(FundAccountingActions.loadBudget, (state) => ({
      ...state,
      loading: true,
      selectedBudget: null,
    })),
    on(FundAccountingActions.loadBudgetSuccess, (state, { budget }) => ({
      ...state,
      selectedBudget: budget,
      loading: false,
    })),
    on(FundAccountingActions.loadBudgetFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(FundAccountingActions.createBudget, (state) => ({
      ...state,
      loading: true,
    })),
    on(FundAccountingActions.createBudgetSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(FundAccountingActions.createBudgetFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
  ),
});

export const fundAccountingReducer = fundAccountingFeature.reducer;
