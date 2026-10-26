import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ChartOfAccountDto,
  AccountCategoryDto,
  CreateAccountRequest,
} from '../models/account.model';
import { FundCodeDto, CreateFundCodeRequest } from '../models/fund-code.model';
import { JournalEntryDto, CreateJournalEntryRequest } from '../models/journal-entry.model';
import { BudgetDto, CreateBudgetRequest } from '../models/budget.model';

export const FundAccountingActions = createActionGroup({
  source: 'FundAccounting',
  events: {
    // Chart of Accounts
    'Load Accounts': props<{ accountType?: string; search?: string; isActive?: boolean }>(),
    'Load Accounts Success': props<{ accounts: ChartOfAccountDto[] }>(),
    'Load Accounts Failure': props<{ error: string }>(),
    'Create Account': props<{ request: CreateAccountRequest }>(),
    'Create Account Success': props<{ id: string }>(),
    'Create Account Failure': props<{ error: string }>(),

    // Account Categories
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: AccountCategoryDto[] }>(),
    'Load Categories Failure': props<{ error: string }>(),

    // Fund Codes
    'Load Fund Codes': props<{ fundType?: string; isActive?: boolean }>(),
    'Load Fund Codes Success': props<{ fundCodes: FundCodeDto[] }>(),
    'Load Fund Codes Failure': props<{ error: string }>(),
    'Create Fund Code': props<{ request: CreateFundCodeRequest }>(),
    'Create Fund Code Success': props<{ id: string }>(),
    'Create Fund Code Failure': props<{ error: string }>(),

    // Journal Entries
    'Load Journal Entries': props<{ projectId?: string; fundCodeId?: string; status?: string; page?: number; pageSize?: number }>(),
    'Load Journal Entries Success': props<{ entries: JournalEntryDto[]; totalCount: number }>(),
    'Load Journal Entries Failure': props<{ error: string }>(),
    'Create Journal Entry': props<{ request: CreateJournalEntryRequest }>(),
    'Create Journal Entry Success': props<{ id: string }>(),
    'Create Journal Entry Failure': props<{ error: string }>(),

    // Budgets
    'Load Budget': props<{ id: string }>(),
    'Load Budget Success': props<{ budget: BudgetDto }>(),
    'Load Budget Failure': props<{ error: string }>(),
    'Create Budget': props<{ request: CreateBudgetRequest }>(),
    'Create Budget Success': props<{ id: string }>(),
    'Create Budget Failure': props<{ error: string }>(),
  }
});
