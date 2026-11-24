import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CashBankService } from '../../services/cash-bank.service';
import { BankAccountDto, CashTransactionDto, CashTransactionStatus, CashTransactionType } from '../../models/cash-bank.model';

@Component({
  selector: 'cash-bank-transaction-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, DecimalPipe, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <h2>Payment &amp; Receipt Vouchers</h2>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Cancel' : 'New Voucher' }}
      </button>
    </div>

    @if (showForm()) {
      <form [formGroup]="form" (ngSubmit)="submit()" class="inline-form">
        <mat-form-field appearance="outline"><mat-label>Voucher #</mat-label><input matInput formControlName="voucherNumber" /></mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Bank Account</mat-label>
          <mat-select formControlName="bankAccountId">
            @for (a of accounts(); track a.id) {
              <mat-option [value]="a.id">{{ a.accountCode }} — {{ a.accountName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Date</mat-label><input matInput type="date" formControlName="transactionDate" /></mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="transactionType">
            <mat-option [value]="1">Receipt</mat-option>
            <mat-option [value]="2">Payment</mat-option>
            <mat-option [value]="3">Transfer In</mat-option>
            <mat-option [value]="4">Transfer Out</mat-option>
            <mat-option [value]="5">Bank Charge</mat-option>
            <mat-option [value]="6">Interest</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Amount</mat-label><input matInput type="number" formControlName="amount" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Payee / Payer</mat-label><input matInput formControlName="payeeOrPayer" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Description</mat-label><input matInput formControlName="description" /></mat-form-field>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">Create Voucher</button>
      </form>
    }

    <table mat-table [dataSource]="transactions()" class="full-width">
      <ng-container matColumnDef="voucherNumber"><th mat-header-cell *matHeaderCellDef>Voucher #</th><td mat-cell *matCellDef="let r">{{ r.voucherNumber }}</td></ng-container>
      <ng-container matColumnDef="transactionDate"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.transactionDate | date: 'mediumDate' }}</td></ng-container>
      <ng-container matColumnDef="bankAccountName"><th mat-header-cell *matHeaderCellDef>Account</th><td mat-cell *matCellDef="let r">{{ r.bankAccountName }}</td></ng-container>
      <ng-container matColumnDef="payeeOrPayer"><th mat-header-cell *matHeaderCellDef>Payee / Payer</th><td mat-cell *matCellDef="let r">{{ r.payeeOrPayer }}</td></ng-container>
      <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let r">{{ r.amount | number: '1.2-2' }} {{ r.currencyCode }}</td></ng-container>
      <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r">{{ statusLabel(r.status) }}</td></ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let r">
          @if (r.status === 1 || r.status === 2) {
            <button mat-button color="primary" (click)="approve(r.id)">Approve</button>
          }
          @if (r.status === 3) {
            <button mat-button color="accent" (click)="post(r.id)">Post</button>
          }
          @if (r.status !== 5 && !r.isReconciled) {
            <button mat-button color="warn" (click)="voidTx(r.id)">Void</button>
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
export default class CashTransactionListComponent implements OnInit {
  private readonly service = inject(CashBankService);
  private readonly fb = inject(FormBuilder);

  readonly accounts = signal<BankAccountDto[]>([]);
  readonly transactions = signal<CashTransactionDto[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly columns = ['voucherNumber', 'transactionDate', 'bankAccountName', 'payeeOrPayer', 'amount', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    voucherNumber: ['', Validators.required],
    bankAccountId: ['', Validators.required],
    transactionDate: [new Date().toISOString().slice(0, 10), Validators.required],
    transactionType: [2 as CashTransactionType, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    currencyCode: ['ETB', Validators.required],
    exchangeRate: [1, [Validators.required, Validators.min(0.0001)]],
    payeeOrPayer: ['', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit(): void {
    this.service.listAccounts({ isActive: true }).subscribe({ next: (a) => this.accounts.set(a) });
    this.load();
  }

  load(): void {
    this.service.listTransactions().subscribe({ next: (rows) => this.transactions.set(rows) });
  }

  statusLabel(status: CashTransactionStatus): string {
    return ({ 1: 'Draft', 2: 'Pending', 3: 'Approved', 4: 'Posted', 5: 'Voided' } as Record<number, string>)[status] ?? 'Unknown';
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    this.service.createTransaction({ ...val, transactionDate: new Date(val.transactionDate).toISOString() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  approve(id: string): void {
    this.service.approveTransaction(id).subscribe({ next: () => this.load() });
  }

  post(id: string): void {
    this.service.postTransaction(id).subscribe({ next: () => this.load() });
  }

  voidTx(id: string): void {
    this.service.voidTransaction(id).subscribe({ next: () => this.load() });
  }
}
