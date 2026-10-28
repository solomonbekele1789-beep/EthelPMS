import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  ChartOfAccountDto,
  AccountCategoryDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class ChartOfAccountsService {
  private readonly api = inject(ApiService);

  listAccounts(params: {
    accountType?: string;
    search?: string;
    isActive?: boolean;
  }): Observable<ChartOfAccountDto[]> {
    let httpParams = new HttpParams();

    if (params.accountType) httpParams = httpParams.set('accountType', params.accountType);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive != null) httpParams = httpParams.set('isActive', params.isActive.toString());

    return this.api.get<ChartOfAccountDto[]>('/chart-of-accounts', httpParams);
  }

  createAccount(request: CreateAccountRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/chart-of-accounts', request);
  }

  updateAccount(id: string, request: UpdateAccountRequest): Observable<void> {
    return this.api.put<void>(`/chart-of-accounts/${id}`, request);
  }

  listCategories(): Observable<AccountCategoryDto[]> {
    return this.api.get<AccountCategoryDto[]>('/chart-of-accounts/categories');
  }
}
