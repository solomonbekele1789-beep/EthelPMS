export type BudgetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Revised';

export interface BudgetDto {
  id: string;
  title: string;
  projectId: string;
  fiscalYear: number;
  status: BudgetStatus;
  currencyCode: string;
  exchangeRate: number;
  totalAmount: number;
  version: number;
  lines: BudgetLineDto[];
}

export interface BudgetLineDto {
  id: string;
  accountId: string;
  accountName: string;
  description: string;
  q1Amount: number;
  q2Amount: number;
  q3Amount: number;
  q4Amount: number;
  annualAmount: number;
  actualAmount: number;
  variance: number;
  utilizationRate: number;
}

export interface CreateBudgetRequest {
  title: string;
  projectId: string;
  fiscalYear: number;
  currencyCode: string;
  exchangeRate: number;
}

export interface AddBudgetLineRequest {
  budgetId: string;
  accountId: string;
  description: string;
  q1Amount: number;
  q2Amount: number;
  q3Amount: number;
  q4Amount: number;
}
