import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { CashBankService } from '../../services/cash-bank.service';
import { CashBankSummaryDto } from '../../models/cash-bank.model';

@Component({
  selector: 'cash-bank-shell',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cb-page">
      <div class="cb-header">
        <h1>Cash &amp; Bank Management</h1>
        <p class="cb-subtitle">Bank accounts, payment &amp; receipt vouchers, petty cash imprests, and monthly reconciliations.</p>
      </div>

      @if (summary(); as s) {
        <div class="cb-kpi-row">
          <mat-card class="cb-kpi">
            <div class="cb-kpi-label">Active Accounts</div>
            <div class="cb-kpi-value">{{ s.activeBankAccounts }}</div>
          </mat-card>
          <mat-card class="cb-kpi">
            <div class="cb-kpi-label">Petty Cash Funds</div>
            <div class="cb-kpi-value">{{ s.activePettyCashFunds }}</div>
          </mat-card>
          <mat-card class="cb-kpi">
            <div class="cb-kpi-label">Pending Vouchers</div>
            <div class="cb-kpi-value">{{ s.pendingVouchers }}</div>
          </mat-card>
          <mat-card class="cb-kpi">
            <div class="cb-kpi-label">Unreconciled Posted</div>
            <div class="cb-kpi-value">{{ s.unreconciledTransactions }}</div>
          </mat-card>
          @for (bal of s.balancesByCurrency; track bal.currencyCode) {
            <mat-card class="cb-kpi">
              <div class="cb-kpi-label">Total Balance ({{ bal.currencyCode }})</div>
              <div class="cb-kpi-value">{{ bal.totalBalance | number: '1.2-2' }}</div>
            </mat-card>
          }
        </div>
      }

      <nav mat-tab-nav-bar [tabPanel]="tabPanel">
        @for (link of navLinks; track link.path) {
          <a mat-tab-link [routerLink]="link.path" routerLinkActive #rla="routerLinkActive" [active]="rla.isActive">
            {{ link.label }}
          </a>
        }
      </nav>
      <mat-tab-nav-panel #tabPanel>
        <div class="cb-content">
          <router-outlet />
        </div>
      </mat-tab-nav-panel>
    </div>
  `,
  styles: [`
    .cb-page { padding: 24px; }
    .cb-header { margin-bottom: 16px; }
    .cb-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 600; }
    .cb-subtitle { margin: 0; color: #64748b; font-size: 14px; }
    .cb-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .cb-kpi { padding: 14px 16px; }
    .cb-kpi-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
    .cb-kpi-value { font-size: 22px; font-weight: 600; }
    .cb-content { padding-top: 20px; }
  `],
})
export default class CashBankShellComponent implements OnInit {
  private readonly service = inject(CashBankService);
  readonly summary = signal<CashBankSummaryDto | null>(null);

  readonly navLinks = [
    { path: 'accounts', label: 'Bank Accounts' },
    { path: 'transactions', label: 'Vouchers & Transactions' },
    { path: 'petty-cash', label: 'Petty Cash' },
    { path: 'reconciliations', label: 'Bank Reconciliations' },
  ];

  ngOnInit(): void {
    this.service.getSummary().subscribe({ next: (s) => this.summary.set(s) });
  }
}
