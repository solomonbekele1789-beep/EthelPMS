export type BankAccountType = 1 | 2 | 3 | 4 | 5;
export type CashTransactionType = 1 | 2 | 3 | 4 | 5 | 6;
export type CashTransactionStatus = 1 | 2 | 3 | 4 | 5;
export type ReconciliationStatus = 1 | 2 | 3;

export interface BankAccountDto {
  id: string;
  accountCode: string;
  accountName: string;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  swiftCode?: string;
  currencyCode: string;
  accountType: BankAccountType;
  openingBalance: number;
  currentBalance: number;
  glAccountId?: string;
  fundCodeId?: string;
  officeId?: string;
  isActive: boolean;
}

export interface CreateBankAccountRequest {
  accountCode: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  currencyCode: string;
  accountType: BankAccountType;
  openingBalance: number;
  branchName?: string;
  swiftCode?: string;
}

export interface CashTransactionDto {
  id: string;
  voucherNumber: string;
  bankAccountId: string;
  bankAccountName: string;
  transactionDate: string;
  transactionType: CashTransactionType;
  amount: number;
  currencyCode: string;
  exchangeRate: number;
  payeeOrPayer: string;
  referenceNumber?: string;
  description: string;
  projectId?: string;
  fundCodeId?: string;
  paymentRequestId?: string;
  status: CashTransactionStatus;
  isReconciled: boolean;
  postedAt?: string;
}

export interface CreateCashTransactionRequest {
  voucherNumber: string;
  bankAccountId: string;
  transactionDate: string;
  transactionType: CashTransactionType;
  amount: number;
  currencyCode: string;
  exchangeRate: number;
  payeeOrPayer: string;
  description: string;
  referenceNumber?: string;
}

export interface PettyCashFundDto {
  id: string;
  code: string;
  name: string;
  custodianUserId: string;
  officeId?: string;
  bankAccountId: string;
  currencyCode: string;
  imprestLimit: number;
  currentBalance: number;
  replenishmentThreshold: number;
  needsReplenishment: boolean;
  isActive: boolean;
}

export interface CreatePettyCashFundRequest {
  code: string;
  name: string;
  custodianUserId: string;
  bankAccountId: string;
  currencyCode: string;
  imprestLimit: number;
  replenishmentThreshold: number;
}

export interface BankReconciliationDto {
  id: string;
  bankAccountId: string;
  bankAccountName: string;
  statementDate: string;
  periodStart: string;
  periodEnd: string;
  statementEndingBalance: number;
  bookEndingBalance: number;
  difference: number;
  status: ReconciliationStatus;
  notes?: string;
  completedAt?: string;
}

export interface StartBankReconciliationRequest {
  bankAccountId: string;
  statementDate: string;
  periodStart: string;
  periodEnd: string;
  statementEndingBalance: number;
  notes?: string;
}

export interface CurrencyBalanceDto {
  currencyCode: string;
  totalBalance: number;
  accountCount: number;
}

export interface CashBankSummaryDto {
  activeBankAccounts: number;
  activePettyCashFunds: number;
  pendingVouchers: number;
  unreconciledTransactions: number;
  balancesByCurrency: CurrencyBalanceDto[];
}
