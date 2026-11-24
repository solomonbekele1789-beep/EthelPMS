import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import {
  BankAccountDto,
  BankReconciliationDto,
  CashBankSummaryDto,
  CashTransactionDto,
  CreateBankAccountRequest,
  CreateCashTransactionRequest,
  CreatePettyCashFundRequest,
  PettyCashFundDto,
  StartBankReconciliationRequest,
} from '../models/cash-bank.model';

@Injectable({ providedIn: 'root' })
export class CashBankService {
  private readonly api = inject(ApiService);

  getSummary(): Observable<CashBankSummaryDto> {
    return this.api.get<CashBankSummaryDto>('/cash-bank/accounts/summary');
  }

  listAccounts(params?: { isActive?: boolean; currencyCode?: string }): Observable<BankAccountDto[]> {
    let httpParams = new HttpParams();
    if (params?.isActive != null) httpParams = httpParams.set('isActive', String(params.isActive));
    if (params?.currencyCode) httpParams = httpParams.set('currencyCode', params.currencyCode);
    return this.api.get<BankAccountDto[]>('/cash-bank/accounts', httpParams);
  }

  createAccount(request: CreateBankAccountRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/cash-bank/accounts', request);
  }

  listTransactions(params?: { bankAccountId?: string; isReconciled?: boolean }): Observable<CashTransactionDto[]> {
    let httpParams = new HttpParams();
    if (params?.bankAccountId) httpParams = httpParams.set('bankAccountId', params.bankAccountId);
    if (params?.isReconciled != null) httpParams = httpParams.set('isReconciled', String(params.isReconciled));
    return this.api.get<CashTransactionDto[]>('/cash-bank/transactions', httpParams);
  }

  createTransaction(request: CreateCashTransactionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/cash-bank/transactions', request);
  }

  approveTransaction(id: string): Observable<void> {
    return this.api.post<void>(`/cash-bank/transactions/${id}/approve`, {});
  }

  postTransaction(id: string): Observable<void> {
    return this.api.post<void>(`/cash-bank/transactions/${id}/post`, {});
  }

  voidTransaction(id: string): Observable<void> {
    return this.api.post<void>(`/cash-bank/transactions/${id}/void`, {});
  }

  listPettyCashFunds(isActive?: boolean): Observable<PettyCashFundDto[]> {
    let httpParams = new HttpParams();
    if (isActive != null) httpParams = httpParams.set('isActive', String(isActive));
    return this.api.get<PettyCashFundDto[]>('/cash-bank/petty-cash', httpParams);
  }

  createPettyCashFund(request: CreatePettyCashFundRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/cash-bank/petty-cash', request);
  }

  replenishPettyCash(fundId: string, amount: number): Observable<void> {
    return this.api.post<void>(`/cash-bank/petty-cash/${fundId}/replenish`, { fundId, amount });
  }

  listReconciliations(bankAccountId?: string): Observable<BankReconciliationDto[]> {
    let httpParams = new HttpParams();
    if (bankAccountId) httpParams = httpParams.set('bankAccountId', bankAccountId);
    return this.api.get<BankReconciliationDto[]>('/cash-bank/reconciliations', httpParams);
  }

  startReconciliation(request: StartBankReconciliationRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/cash-bank/reconciliations', request);
  }

  completeReconciliation(reconciliationId: string, clearedTransactionIds: string[], notes?: string): Observable<void> {
    return this.api.post<void>(`/cash-bank/reconciliations/${reconciliationId}/complete`, {
      reconciliationId,
      clearedTransactionIds,
      notes,
    });
  }
}
