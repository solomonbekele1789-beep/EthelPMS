import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CashBankService } from '../../services/cash-bank.service';
import { BankAccountDto, BankReconciliationDto, ReconciliationStatus } from '../../models/cash-bank.model';

@Component({
  selector: 'cash-bank-reconciliation-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, DecimalPipe, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <h2>Bank Reconciliations</h2>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Cancel' : 'Start Reconciliation' }}
      </button>
    </div>

    @if (showForm()) {
      <form [formGroup]="form" (ngSubmit)="submit()" class="inline-form">
        <mat-form-field appearance="outline">
          <mat-label>Bank Account</mat-label>
          <mat-select formControlName="bankAccountId">
            @for (a of accounts(); track a.id) {
              <mat-option [value]="a.id">{{ a.accountCode }} — {{ a.accountName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Period Start</mat-label><input matInput type="date" formControlName="periodStart" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Period End</mat-label><input matInput type="date" formControlName="periodEnd" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Statement Ending Balance</mat-label><input matInput type="number" formControlName="statementEndingBalance" /></mat-form-field>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">Start</button>
      </form>
    }

    <table mat-table [dataSource]="reconciliations()" class="full-width">
      <ng-container matColumnDef="bankAccountName"><th mat-header-cell *matHeaderCellDef>Account</th><td mat-cell *matCellDef="let r">{{ r.bankAccountName }}</td></ng-container>
      <ng-container matColumnDef="statementDate"><th mat-header-cell *matHeaderCellDef>Statement Date</th><td mat-cell *matCellDef="let r">{{ r.statementDate | date: 'mediumDate' }}</td></ng-container>
      <ng-container matColumnDef="statementEndingBalance"><th mat-header-cell *matHeaderCellDef>Statement Balance</th><td mat-cell *matCellDef="let r">{{ r.statementEndingBalance | number: '1.2-2' }}</td></ng-container>
      <ng-container matColumnDef="bookEndingBalance"><th mat-header-cell *matHeaderCellDef>Book Balance</th><td mat-cell *matCellDef="let r">{{ r.bookEndingBalance | number: '1.2-2' }}</td></ng-container>
      <ng-container matColumnDef="difference"><th mat-header-cell *matHeaderCellDef>Difference</th><td mat-cell *matCellDef="let r">{{ r.difference | number: '1.2-2' }}</td></ng-container>
      <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r">{{ statusLabel(r.status) }}</td></ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let r">
          @if (r.status === 1 && r.difference === 0) {
            <button mat-button color="primary" (click)="complete(r.id)">Complete</button>
          }
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>
    </table>
  `,
  styles: [`
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .inline-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: center; margin-bottom: 20px; }
    .full-width { width: 100%; }
  `],
})
export default class BankReconciliationListComponent implements OnInit {
  private readonly service = inject(CashBankService);
  private readonly fb = inject(FormBuilder);

  readonly accounts = signal<BankAccountDto[]>([]);
  readonly reconciliations = signal<BankReconciliationDto[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly columns = ['bankAccountName', 'statementDate', 'statementEndingBalance', 'bookEndingBalance', 'difference', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    bankAccountId: ['', Validators.required],
    periodStart: [new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10), Validators.required],
    periodEnd: [new Date().toISOString().slice(0, 10), Validators.required],
    statementEndingBalance: [0, Validators.required],
  });

  ngOnInit(): void {
    this.service.listAccounts({ isActive: true }).subscribe({ next: (a) => this.accounts.set(a) });
    this.load();
  }

  load(): void {
    this.service.listReconciliations().subscribe({ next: (rows) => this.reconciliations.set(rows) });
  }

  statusLabel(status: ReconciliationStatus): string {
    return ({ 1: 'In Progress', 2: 'Completed', 3: 'Approved' } as Record<number, string>)[status] ?? 'Unknown';
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    this.service.startReconciliation({
      bankAccountId: val.bankAccountId,
      statementDate: new Date(val.periodEnd).toISOString(),
      periodStart: new Date(val.periodStart).toISOString(),
      periodEnd: new Date(val.periodEnd).toISOString(),
      statementEndingBalance: val.statementEndingBalance,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  complete(id: string): void {
    this.service.completeReconciliation(id, []).subscribe({ next: () => this.load() });
  }
}
