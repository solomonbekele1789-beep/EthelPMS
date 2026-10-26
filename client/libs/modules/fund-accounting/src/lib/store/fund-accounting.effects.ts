import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChartOfAccountsService } from '../services/chart-of-accounts.service';
import { FundCodeService } from '../services/fund-code.service';
import { JournalEntryService } from '../services/journal-entry.service';
import { BudgetService } from '../services/budget.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { FundAccountingActions } from './fund-accounting.actions';

@Injectable()
export class FundAccountingEffects {
  private readonly actions$ = inject(Actions);
  private readonly chartOfAccountsService = inject(ChartOfAccountsService);
  private readonly fundCodeService = inject(FundCodeService);
  private readonly journalEntryService = inject(JournalEntryService);
  private readonly budgetService = inject(BudgetService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Chart of Accounts

  loadAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.loadAccounts),
    switchMap(({ accountType, search, isActive }) =>
      this.chartOfAccountsService.listAccounts({ accountType, search, isActive }).pipe(
        map((accounts) => FundAccountingActions.loadAccountsSuccess({ accounts })),
        catchError((error) => of(FundAccountingActions.loadAccountsFailure({ error: error?.error?.detail ?? 'Failed to load accounts' })))
      )
    )
  ));

  createAccount$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createAccount),
    exhaustMap(({ request }) =>
      this.chartOfAccountsService.createAccount(request).pipe(
        map((response) => FundAccountingActions.createAccountSuccess({ id: response.id })),
        catchError((error) => of(FundAccountingActions.createAccountFailure({ error: error?.error?.detail ?? 'Failed to create account' })))
      )
    )
  ));

  createAccountSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createAccountSuccess),
    tap(() => {
      this.notification.success('Account created successfully');
      this.router.navigate(['/finance/accounts']);
    })
  ), { dispatch: false });

  // Account Categories

  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.loadCategories),
    switchMap(() =>
      this.chartOfAccountsService.listCategories().pipe(
        map((categories) => FundAccountingActions.loadCategoriesSuccess({ categories })),
        catchError((error) => of(FundAccountingActions.loadCategoriesFailure({ error: error?.error?.detail ?? 'Failed to load categories' })))
      )
    )
  ));

  // Fund Codes

  loadFundCodes$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.loadFundCodes),
    switchMap(({ fundType, isActive }) =>
      this.fundCodeService.listFundCodes({ fundType, isActive }).pipe(
        map((fundCodes) => FundAccountingActions.loadFundCodesSuccess({ fundCodes })),
        catchError((error) => of(FundAccountingActions.loadFundCodesFailure({ error: error?.error?.detail ?? 'Failed to load fund codes' })))
      )
    )
  ));

  createFundCode$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createFundCode),
    exhaustMap(({ request }) =>
      this.fundCodeService.createFundCode(request).pipe(
        map((response) => FundAccountingActions.createFundCodeSuccess({ id: response.id })),
        catchError((error) => of(FundAccountingActions.createFundCodeFailure({ error: error?.error?.detail ?? 'Failed to create fund code' })))
      )
    )
  ));

  createFundCodeSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createFundCodeSuccess),
    tap(() => {
      this.notification.success('Fund code created successfully');
      this.router.navigate(['/finance/fund-codes']);
    })
  ), { dispatch: false });

  // Journal Entries

  loadJournalEntries$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.loadJournalEntries),
    switchMap(({ projectId, fundCodeId, status, page, pageSize }) =>
      this.journalEntryService.listEntries({ projectId, fundCodeId, status, page, pageSize }).pipe(
        map((response) => FundAccountingActions.loadJournalEntriesSuccess({ entries: response.items, totalCount: response.totalCount })),
        catchError((error) => of(FundAccountingActions.loadJournalEntriesFailure({ error: error?.error?.detail ?? 'Failed to load journal entries' })))
      )
    )
  ));

  createJournalEntry$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createJournalEntry),
    exhaustMap(({ request }) =>
      this.journalEntryService.createEntry(request).pipe(
        map((response) => FundAccountingActions.createJournalEntrySuccess({ id: response.id })),
        catchError((error) => of(FundAccountingActions.createJournalEntryFailure({ error: error?.error?.detail ?? 'Failed to create journal entry' })))
      )
    )
  ));

  createJournalEntrySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createJournalEntrySuccess),
    tap(() => {
      this.notification.success('Journal entry created successfully');
      this.router.navigate(['/finance/journals']);
    })
  ), { dispatch: false });

  // Budgets

  loadBudget$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.loadBudget),
    switchMap(({ id }) =>
      this.budgetService.getBudget(id).pipe(
        map((budget) => FundAccountingActions.loadBudgetSuccess({ budget })),
        catchError((error) => of(FundAccountingActions.loadBudgetFailure({ error: error?.error?.detail ?? 'Failed to load budget' })))
      )
    )
  ));

  createBudget$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createBudget),
    exhaustMap(({ request }) =>
      this.budgetService.createBudget(request).pipe(
        map((response) => FundAccountingActions.createBudgetSuccess({ id: response.id })),
        catchError((error) => of(FundAccountingActions.createBudgetFailure({ error: error?.error?.detail ?? 'Failed to create budget' })))
      )
    )
  ));

  createBudgetSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(FundAccountingActions.createBudgetSuccess),
    tap(() => {
      this.notification.success('Budget created successfully');
      this.router.navigate(['/finance/budgets']);
    })
  ), { dispatch: false });
}
