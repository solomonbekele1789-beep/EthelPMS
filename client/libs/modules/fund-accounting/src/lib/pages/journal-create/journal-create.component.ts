import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FundAccountingActions } from '../../store/fund-accounting.actions';
import {
  selectAccounts,
  selectFundCodes,
  selectFundAccountingLoading,
} from '../../store/fund-accounting.selectors';
import {
  CreateJournalEntryRequest,
  JournalLineInput,
} from '../../models/journal-entry.model';

@Component({
  selector: 'ethel-journal-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'finance.journals.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Header Fields -->
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'finance.journals.header' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.referenceNumber' | translate }}</mat-label>
                <input matInput formControlName="referenceNumber" />
                @if (form.controls.referenceNumber.hasError('required')) {
                  <mat-error>Reference number is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.transactionDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="transactionDate" />
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                @if (form.controls.transactionDate.hasError('required')) {
                  <mat-error>Transaction date is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'finance.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
                @if (form.controls.description.hasError('required')) {
                  <mat-error>Description is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.projectId' | translate }}</mat-label>
                <input matInput formControlName="projectId" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.fundCode' | translate }}</mat-label>
                <mat-select formControlName="fundCodeId">
                  <mat-option [value]="''">-- None --</mat-option>
                  @for (fund of fundCodes(); track fund.id) {
                    <mat-option [value]="fund.id">{{ fund.code }} - {{ fund.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'finance.fields.memo' | translate }}</mat-label>
                <textarea matInput formControlName="memo" rows="2"></textarea>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Journal Lines -->
        <mat-card class="lines-card">
          <mat-card-header>
            <mat-card-title>{{ 'finance.journals.lines' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="lines-table">
              <div class="lines-header">
                <span class="col-account">{{ 'finance.fields.account' | translate }}</span>
                <span class="col-description">{{ 'finance.fields.description' | translate }}</span>
                <span class="col-debit">{{ 'finance.fields.debit' | translate }}</span>
                <span class="col-credit">{{ 'finance.fields.credit' | translate }}</span>
                <span class="col-fund">{{ 'finance.fields.fundCode' | translate }}</span>
                <span class="col-action"></span>
              </div>

              @for (line of linesArray.controls; track $index; let i = $index) {
                <div class="lines-row" [formGroup]="getLineGroup(i)">
                  <mat-form-field appearance="outline" class="col-account">
                    <mat-select formControlName="accountId">
                      @for (account of accounts(); track account.id) {
                        <mat-option [value]="account.id">{{ account.accountCode }} - {{ account.accountName }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="col-description">
                    <input matInput formControlName="description" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="col-debit">
                    <input matInput type="number" formControlName="debitAmount" min="0" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="col-credit">
                    <input matInput type="number" formControlName="creditAmount" min="0" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="col-fund">
                    <mat-select formControlName="fundCodeId">
                      <mat-option [value]="''">--</mat-option>
                      @for (fund of fundCodes(); track fund.id) {
                        <mat-option [value]="fund.id">{{ fund.code }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <button mat-icon-button color="warn" type="button" class="col-action" (click)="removeLine(i)" [disabled]="linesArray.length <= 2">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }

              <!-- Totals Row -->
              <div class="lines-totals">
                <span class="col-account"></span>
                <span class="col-description totals-label"><strong>{{ 'finance.fields.totals' | translate }}</strong></span>
                <span class="col-debit totals-amount" [class.balanced]="isBalanced()" [class.unbalanced]="!isBalanced()">
                  {{ totalDebit() | number:'1.2-2' }}
                </span>
                <span class="col-credit totals-amount" [class.balanced]="isBalanced()" [class.unbalanced]="!isBalanced()">
                  {{ totalCredit() | number:'1.2-2' }}
                </span>
                <span class="col-fund"></span>
                <span class="col-action"></span>
              </div>

              @if (!isBalanced()) {
                <div class="balance-warning">
                  <mat-icon>warning</mat-icon>
                  {{ 'finance.journals.unbalanced' | translate }}
                  ({{ 'finance.fields.difference' | translate }}: {{ difference() | number:'1.2-2' }})
                </div>
              }
            </div>

            <button mat-stroked-button type="button" (click)="addLine()" class="add-line-btn">
              <mat-icon>add</mat-icon>
              {{ 'finance.journals.addLine' | translate }}
            </button>
          </mat-card-content>
        </mat-card>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || !isBalanced() || loading()"
            *appHasPermission="'fundacct.journals.create'">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 1100px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .lines-card { margin-top: 1.5rem; }
    .lines-table { overflow-x: auto; }
    .lines-header {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 0;
      font-weight: 500;
      border-bottom: 2px solid rgba(0, 0, 0, 0.12);
    }
    .lines-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .lines-totals {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 0;
      border-top: 2px solid rgba(0, 0, 0, 0.12);
      align-items: center;
    }
    .col-account { flex: 2; min-width: 200px; }
    .col-description { flex: 2; min-width: 150px; }
    .col-debit { flex: 1; min-width: 120px; }
    .col-credit { flex: 1; min-width: 120px; }
    .col-fund { flex: 1; min-width: 100px; }
    .col-action { width: 48px; flex-shrink: 0; }
    .totals-label { text-align: right; }
    .totals-amount { font-weight: 600; font-size: 1.05rem; }
    .balanced { color: #2e7d32; }
    .unbalanced { color: #c62828; }
    .balance-warning {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #c62828;
      padding: 0.5rem 0;
    }
    .add-line-btn { margin-top: 1rem; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class JournalCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly accounts = this.store.selectSignal(selectAccounts);
  readonly fundCodes = this.store.selectSignal(selectFundCodes);
  readonly loading = this.store.selectSignal(selectFundAccountingLoading);

  readonly form = this.fb.nonNullable.group({
    referenceNumber: ['', [Validators.required]],
    description: ['', [Validators.required]],
    transactionDate: ['', [Validators.required]],
    projectId: [''],
    fundCodeId: [''],
    memo: [''],
    lines: this.fb.array<FormGroup>([]),
  });

  get linesArray(): FormArray<FormGroup> {
    return this.form.controls.lines as FormArray<FormGroup>;
  }

  private readonly linesValues = toSignal(
    this.form.controls.lines.valueChanges,
    { initialValue: [] as any[] }
  );

  readonly totalDebit = computed(() => {
    const lines = this.linesValues();
    return lines.reduce((sum: number, line: any) => sum + (Number(line?.debitAmount) || 0), 0);
  });

  readonly totalCredit = computed(() => {
    const lines = this.linesValues();
    return lines.reduce((sum: number, line: any) => sum + (Number(line?.creditAmount) || 0), 0);
  });

  readonly difference = computed(() => Math.abs(this.totalDebit() - this.totalCredit()));
  readonly isBalanced = computed(() => Math.abs(this.totalDebit() - this.totalCredit()) < 0.005 && this.totalDebit() > 0);

  ngOnInit(): void {
    this.store.dispatch(FundAccountingActions.loadAccounts({}));
    this.store.dispatch(FundAccountingActions.loadFundCodes({}));
    // Start with two empty lines
    this.addLine();
    this.addLine();
  }

  getLineGroup(index: number): FormGroup {
    return this.linesArray.at(index);
  }

  addLine(): void {
    const lineGroup = this.fb.nonNullable.group({
      accountId: ['', [Validators.required]],
      debitAmount: [0],
      creditAmount: [0],
      description: [''],
      fundCodeId: [''],
    });
    this.linesArray.push(lineGroup);
  }

  removeLine(index: number): void {
    if (this.linesArray.length > 2) {
      this.linesArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.isBalanced()) return;
    const value = this.form.getRawValue();

    const rawDate = value.transactionDate as string | Date;
    const transactionDate = rawDate instanceof Date
      ? rawDate.toISOString().split('T')[0]
      : rawDate;

    const lines: JournalLineInput[] = value.lines.map((line: any) => ({
      accountId: line.accountId,
      debitAmount: Number(line.debitAmount) || 0,
      creditAmount: Number(line.creditAmount) || 0,
      description: line.description || undefined,
      fundCodeId: line.fundCodeId || undefined,
    }));

    const request: CreateJournalEntryRequest = {
      referenceNumber: value.referenceNumber,
      description: value.description,
      transactionDate,
      projectId: value.projectId || undefined,
      fundCodeId: value.fundCodeId || undefined,
      memo: value.memo || undefined,
      lines,
    };

    this.store.dispatch(FundAccountingActions.createJournalEntry({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/finance/journals']);
  }
}
