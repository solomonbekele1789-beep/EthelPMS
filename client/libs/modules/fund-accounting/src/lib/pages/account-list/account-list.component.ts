import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FundAccountingActions } from '../../store/fund-accounting.actions';
import {
  selectAccounts,
  selectCategories,
  selectFundAccountingLoading,
} from '../../store/fund-accounting.selectors';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';
import {
  AccountType,
  AccountCategoryDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../../models/account.model';

@Component({
  selector: 'ethel-account-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'finance.accounts.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'fundacct.accounts.create'" (click)="showCreateForm.set(!showCreateForm())">
        <mat-icon>add</mat-icon>
        {{ 'finance.accounts.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="type-filter">
          <mat-label>{{ 'finance.fields.accountType' | translate }}</mat-label>
          <mat-select [value]="typeFilter()" (selectionChange)="onTypeFilter($event.value)">
            <mat-option [value]="undefined">{{ 'common.all' | translate }}</mat-option>
            @for (type of accountTypes; track type) {
              <mat-option [value]="type">{{ type }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <app-search-input placeholder="Search accounts..." (search)="onSearch($event)"></app-search-input>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="accounts()"
        [loading]="loading()"
        emptyTitle="No accounts found"
        emptyMessage="Get started by adding your first chart of account."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #typeTpl let-row>
      <mat-chip>{{ row.accountType }}</mat-chip>
    </ng-template>

    <ng-template #activeTpl let-row>
      <mat-chip [highlighted]="row.isActive" [class.active-chip]="row.isActive" [class.inactive-chip]="!row.isActive">
        {{ row.isActive ? ('common.active' | translate) : ('common.inactive' | translate) }}
      </mat-chip>
    </ng-template>

    <!-- Create Account Form -->
    @if (showCreateForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'finance.accounts.create' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.accountCode' | translate }}</mat-label>
                <input matInput formControlName="accountCode" />
                @if (createForm.controls.accountCode.hasError('required')) {
                  <mat-error>Account code is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.accountName' | translate }}</mat-label>
                <input matInput formControlName="accountName" />
                @if (createForm.controls.accountName.hasError('required')) {
                  <mat-error>Account name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.accountType' | translate }}</mat-label>
                <mat-select formControlName="accountType">
                  @for (type of accountTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
                @if (createForm.controls.accountType.hasError('required')) {
                  <mat-error>Account type is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.category' | translate }}</mat-label>
                <mat-select formControlName="accountCategoryId">
                  @for (cat of flatCategories(); track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
                @if (createForm.controls.accountCategoryId.hasError('required')) {
                  <mat-error>Category is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'finance.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showCreateForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid">
                {{ 'common.create' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <!-- Edit Account Form -->
    @if (showEditForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'common.edit' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="editForm" (ngSubmit)="onEditSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.accountName' | translate }}</mat-label>
                <input matInput formControlName="accountName" />
                @if (editForm.controls.accountName.hasError('required')) {
                  <mat-error>Account name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showEditForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid">
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; }
    .type-filter { width: 200px; }
    .inline-form-card { margin-top: 1.5rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .active-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
    .inactive-chip { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class AccountListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly accountsService = inject(ChartOfAccountsService);
  private readonly notification = inject(NotificationService);

  readonly accounts = this.store.selectSignal(selectAccounts);
  readonly categories = this.store.selectSignal(selectCategories);
  readonly loading = this.store.selectSignal(selectFundAccountingLoading);

  readonly search = signal('');
  readonly typeFilter = signal<AccountType | undefined>(undefined);
  readonly showCreateForm = signal(false);
  readonly showEditForm = signal(false);
  readonly editingAccountId = signal<string | null>(null);

  readonly accountTypes: AccountType[] = ['Asset', 'Liability', 'NetAssets', 'Revenue', 'Expense'];

  readonly typeTpl = viewChild<TemplateRef<unknown>>('typeTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');

  readonly flatCategories = computed(() => {
    const flatten = (cats: AccountCategoryDto[]): AccountCategoryDto[] =>
      cats.reduce<AccountCategoryDto[]>((acc, cat) => [...acc, cat, ...flatten(cat.subCategories)], []);
    return flatten(this.categories());
  });

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'accountCode', label: 'Account Code', sortable: true },
    { key: 'accountName', label: 'Account Name', sortable: true },
    { key: 'accountType', label: 'Type', template: this.typeTpl() },
    { key: 'categoryName', label: 'Category' },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
  ]);

  readonly createForm = this.fb.nonNullable.group({
    accountCode: ['', [Validators.required]],
    accountName: ['', [Validators.required]],
    accountType: ['' as AccountType | '', [Validators.required]],
    accountCategoryId: ['', [Validators.required]],
    description: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    accountName: ['', [Validators.required]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadAccounts();
    this.store.dispatch(FundAccountingActions.loadCategories());
  }

  loadAccounts(): void {
    this.store.dispatch(
      FundAccountingActions.loadAccounts({
        accountType: this.typeFilter(),
        search: this.search() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.loadAccounts();
  }

  onTypeFilter(type: AccountType | undefined): void {
    this.typeFilter.set(type);
    this.loadAccounts();
  }

  onRowClick(row: any): void {
    this.editingAccountId.set(row.id);
    this.editForm.patchValue({
      accountName: row.accountName,
      description: row.description ?? '',
    });
    this.showEditForm.set(true);
    this.showCreateForm.set(false);
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateAccountRequest = {
      accountCode: value.accountCode,
      accountName: value.accountName,
      accountType: value.accountType as AccountType,
      accountCategoryId: value.accountCategoryId,
      description: value.description || undefined,
    };
    this.accountsService.createAccount(request).subscribe({
      next: () => {
        this.notification.success('Account created successfully');
        this.showCreateForm.set(false);
        this.createForm.reset();
        this.loadAccounts();
      },
      error: () => this.notification.error('Failed to create account'),
    });
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || !this.editingAccountId()) return;
    const value = this.editForm.getRawValue();
    const request: UpdateAccountRequest = {
      id: this.editingAccountId()!,
      accountName: value.accountName,
      description: value.description || undefined,
    };
    this.accountsService.updateAccount(this.editingAccountId()!, request).subscribe({
      next: () => {
        this.notification.success('Account updated successfully');
        this.showEditForm.set(false);
        this.editingAccountId.set(null);
        this.loadAccounts();
      },
      error: () => this.notification.error('Failed to update account'),
    });
  }
}
