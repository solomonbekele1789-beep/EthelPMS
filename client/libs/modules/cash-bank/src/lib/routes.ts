import { Routes } from '@angular/router';
import { permissionGuard } from '@ethelpms/shared/core';

export const cashBankRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cash-bank-shell/cash-bank-shell.component'),
    children: [
      { path: '', redirectTo: 'accounts', pathMatch: 'full' },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/bank-account-list/bank-account-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'cashbank.accounts.read' },
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/cash-transaction-list/cash-transaction-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'cashbank.transactions.read' },
      },
      {
        path: 'petty-cash',
        loadComponent: () => import('./pages/petty-cash-list/petty-cash-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'cashbank.pettycash.read' },
      },
      {
        path: 'reconciliations',
        loadComponent: () => import('./pages/bank-reconciliation-list/bank-reconciliation-list.component'),
        canActivate: [permissionGuard],
        data: { permission: 'cashbank.reconciliations.read' },
      },
    ],
  },
];
