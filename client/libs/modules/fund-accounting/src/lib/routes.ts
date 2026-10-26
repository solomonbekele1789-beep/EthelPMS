import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { FUND_ACCOUNTING_FEATURE_KEY, fundAccountingReducer } from './store/fund-accounting.reducer';
import { FundAccountingEffects } from './store/fund-accounting.effects';

export const fundAccountingRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(FUND_ACCOUNTING_FEATURE_KEY, fundAccountingReducer),
      provideEffects([FundAccountingEffects])
    ],
    children: [
      { path: '', redirectTo: 'accounts', pathMatch: 'full' },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/account-list/account-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'fundacct.accounts.read' }
      },
      {
        path: 'fund-codes',
        loadComponent: () => import('./pages/fund-code-list/fund-code-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'fundacct.funds.read' }
      },
      {
        path: 'journals',
        loadComponent: () => import('./pages/journal-list/journal-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'fundacct.journals.read' }
      },
      {
        path: 'journals/create',
        loadComponent: () => import('./pages/journal-create/journal-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'fundacct.journals.create' }
      },
      {
        path: 'budgets',
        loadComponent: () => import('./pages/budget-list/budget-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'fundacct.budgets.read' }
      },
      {
        path: 'budgets/create',
        loadComponent: () => import('./pages/budget-create/budget-create.component'),
        canActivate: [permissionGuard],
        data: { permission: 'fundacct.budgets.create' }
      },
      {
        path: 'budgets/:id',
        loadComponent: () => import('./pages/budget-detail/budget-detail.component'),
        canActivate: [permissionGuard],
        data: { permission: 'fundacct.budgets.read' }
      }
    ]
  }
];
