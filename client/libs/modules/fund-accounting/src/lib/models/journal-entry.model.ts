export type JournalEntryStatus = 'Draft' | 'Posted' | 'Reversed';

export interface JournalEntryDto {
  id: string;
  referenceNumber: string;
  description: string;
  transactionDate: string;
  status: JournalEntryStatus;
  totalDebit: number;
  totalCredit: number;
  projectId?: string;
  fundCodeId?: string;
  memo?: string;
  lines: JournalLineDto[];
}

export interface JournalLineDto {
  id: string;
  accountId: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  fundCodeId?: string;
}

export interface JournalLineInput {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  fundCodeId?: string;
}

export interface CreateJournalEntryRequest {
  referenceNumber: string;
  description: string;
  transactionDate: string;
  projectId?: string;
  fundCodeId?: string;
  memo?: string;
  lines: JournalLineInput[];
}
