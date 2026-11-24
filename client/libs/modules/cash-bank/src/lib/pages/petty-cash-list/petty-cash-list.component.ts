import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CashBankService } from '../../services/cash-bank.service';
import { PettyCashFundDto } from '../../models/cash-bank.model';

@Component({
  selector: 'cash-bank-petty-cash-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatTableModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <h2>Petty Cash Imprest Funds</h2>
    </div>
    <table mat-table [dataSource]="funds()" class="full-width">
      <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r">{{ r.code }}</td></ng-container>
      <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Fund Name</th><td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
      <ng-container matColumnDef="imprestLimit"><th mat-header-cell *matHeaderCellDef>Imprest Limit</th><td mat-cell *matCellDef="let r">{{ r.imprestLimit | number: '1.2-2' }} {{ r.currencyCode }}</td></ng-container>
      <ng-container matColumnDef="currentBalance"><th mat-header-cell *matHeaderCellDef>Current Balance</th><td mat-cell *matCellDef="let r">{{ r.currentBalance | number: '1.2-2' }} {{ r.currencyCode }}</td></ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let r">{{ r.needsReplenishment ? 'Needs Replenishment' : 'Healthy' }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let r">
          @if (r.currentBalance < r.imprestLimit) {
            <button mat-button color="primary" (click)="replenishToLimit(r)">Replenish to Limit</button>
          }
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>
    </table>
  `,
  styles: [`
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
  `],
})
export default class PettyCashListComponent implements OnInit {
  private readonly service = inject(CashBankService);
  readonly funds = signal<PettyCashFundDto[]>([]);
  readonly columns = ['code', 'name', 'imprestLimit', 'currentBalance', 'status', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.listPettyCashFunds().subscribe({ next: (rows) => this.funds.set(rows) });
  }

  replenishToLimit(fund: PettyCashFundDto): void {
    const needed = +(fund.imprestLimit - fund.currentBalance).toFixed(2);
    if (needed <= 0) return;
    this.service.replenishPettyCash(fund.id, needed).subscribe({ next: () => this.load() });
  }
}
