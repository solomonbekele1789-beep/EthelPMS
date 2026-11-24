import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CashBankService } from '../../services/cash-bank.service';
import { BankAccountDto, BankAccountType } from '../../models/cash-bank.model';

@Component({
  selector: 'cash-bank-account-list',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <h2>Bank &amp; Cash Accounts</h2>
      <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Cancel' : 'Add Bank Account' }}
      </button>
    </div>

    @if (showForm()) {
      <form [formGroup]="form" (ngSubmit)="submit()" class="inline-form">
        <mat-form-field appearance="outline"><mat-label>Code</mat-label><input matInput formControlName="accountCode" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Account Name</mat-label><input matInput formControlName="accountName" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Bank Name</mat-label><input matInput formControlName="bankName" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Account Number</mat-label><input matInput formControlName="accountNumber" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Currency</mat-label><input matInput formControlName="currencyCode" maxlength="3" /></mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="accountType">
            <mat-option [value]="1">Checking</mat-option>
            <mat-option [value]="2">Savings</mat-option>
            <mat-option [value]="3">Petty Cash</mat-option>
            <mat-option [value]="4">Mobile Money</mat-option>
            <mat-option [value]="5">Foreign Currency</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Opening Balance</mat-label><input matInput type="number" formControlName="openingBalance" /></mat-form-field>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">Save Account</button>
      </form>
    }

    <table mat-table [dataSource]="accounts()" class="full-width">
      <ng-container matColumnDef="accountCode"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r">{{ r.accountCode }}</td></ng-container>
      <ng-container matColumnDef="accountName"><th mat-header-cell *matHeaderCellDef>Account</th><td mat-cell *matCellDef="let r">{{ r.accountName }}</td></ng-container>
      <ng-container matColumnDef="bankName"><th mat-header-cell *matHeaderCellDef>Bank</th><td mat-cell *matCellDef="let r">{{ r.bankName }}</td></ng-container>
      <ng-container matColumnDef="accountNumber"><th mat-header-cell *matHeaderCellDef>Number</th><td mat-cell *matCellDef="let r">{{ r.accountNumber }}</td></ng-container>
      <ng-container matColumnDef="currencyCode"><th mat-header-cell *matHeaderCellDef>Currency</th><td mat-cell *matCellDef="let r">{{ r.currencyCode }}</td></ng-container>
      <ng-container matColumnDef="currentBalance"><th mat-header-cell *matHeaderCellDef>Current Balance</th><td mat-cell *matCellDef="let r">{{ r.currentBalance | number: '1.2-2' }}</td></ng-container>
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
export default class BankAccountListComponent implements OnInit {
  private readonly service = inject(CashBankService);
  private readonly fb = inject(FormBuilder);

  readonly accounts = signal<BankAccountDto[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly columns = ['accountCode', 'accountName', 'bankName', 'accountNumber', 'currencyCode', 'currentBalance'];

  readonly form = this.fb.nonNullable.group({
    accountCode: ['', Validators.required],
    accountName: ['', Validators.required],
    bankName: ['', Validators.required],
    accountNumber: ['', Validators.required],
    currencyCode: ['ETB', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    accountType: [1 as BankAccountType, Validators.required],
    openingBalance: [0, Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.listAccounts().subscribe({ next: (rows) => this.accounts.set(rows) });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.service.createAccount(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ currencyCode: 'ETB', accountType: 1, openingBalance: 0 });
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }
}
