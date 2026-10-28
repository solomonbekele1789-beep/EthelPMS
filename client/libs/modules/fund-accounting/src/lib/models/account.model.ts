export type AccountType = 'Asset' | 'Liability' | 'NetAssets' | 'Revenue' | 'Expense';

export interface ChartOfAccountDto {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategoryId: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
  isSystemAccount: boolean;
}

export interface AccountCategoryDto {
  id: string;
  code: string;
  name: string;
  parentCategoryId?: string;
  accountType: AccountType;
  sortOrder: number;
  isActive: boolean;
  subCategories: AccountCategoryDto[];
}

export interface CreateAccountRequest {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategoryId: string;
  description?: string;
}

export interface UpdateAccountRequest {
  id: string;
  accountName: string;
  description?: string;
}
