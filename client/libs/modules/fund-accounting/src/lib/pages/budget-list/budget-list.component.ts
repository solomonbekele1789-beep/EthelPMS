import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FundAccountingActions } from '../../store/fund-accounting.actions';
import { selectSelectedBudget, selectFundAccountingLoading } from '../../store/fund-accounting.selectors';

@Component({
  selector: 'ethel-budget-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    PageHeaderComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'finance.budgets.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'fundacct.budgets.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'finance.budgets.create' | translate }}
      </button>
    </app-page-header>

    <div class="budget-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ 'finance.budgets.lookupTitle' | translate }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="lookup-description">{{ 'finance.budgets.lookupDescription' | translate }}</p>
          <div class="lookup-row">
            <mat-form-field appearance="outline" class="lookup-input">
              <mat-label>{{ 'finance.fields.budgetId' | translate }}</mat-label>
              <input matInput [(ngModel)]="budgetId" placeholder="Enter budget ID..." />
            </mat-form-field>
            <button mat-flat-button color="primary" [disabled]="!budgetId" (click)="onLookup()">
              <mat-icon>search</mat-icon>
              {{ 'finance.budgets.lookup' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (!selectedBudget() && !loading()) {
        <app-empty-state
          title="No budget loaded"
          message="Create a new budget or look up an existing one by ID.">
        </app-empty-state>
      }

      @if (selectedBudget()) {
        <mat-card class="budget-summary" (click)="onViewBudget(selectedBudget()!.id)">
          <mat-card-header>
            <mat-card-title>{{ selectedBudget()!.title }}</mat-card-title>
            <mat-card-subtitle>
              {{ 'finance.fields.fiscalYear' | translate }}: {{ selectedBudget()!.fiscalYear }}
              | {{ 'common.status' | translate }}: {{ selectedBudget()!.status }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="budget-meta">
              <span><strong>{{ 'finance.fields.projectId' | translate }}:</strong> {{ selectedBudget()!.projectId }}</span>
              <span><strong>{{ 'finance.fields.currency' | translate }}:</strong> {{ selectedBudget()!.currencyCode }}</span>
              <span><strong>{{ 'finance.fields.totalAmount' | translate }}:</strong> {{ selectedBudget()!.totalAmount }}</span>
              <span><strong>{{ 'finance.fields.version' | translate }}:</strong> {{ selectedBudget()!.version }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">
              <mat-icon>visibility</mat-icon>
              {{ 'finance.budgets.viewDetail' | translate }}
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .budget-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .lookup-description { color: rgba(0, 0, 0, 0.6); margin-bottom: 1rem; }
    .lookup-row { display: flex; align-items: center; gap: 1rem; }
    .lookup-input { flex: 1; max-width: 400px; }
    .budget-summary { cursor: pointer; }
    .budget-summary:hover { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12); }
    .budget-meta { display: flex; flex-wrap: wrap; gap: 1.5rem; }
  `,
})
export default class BudgetListComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly selectedBudget = this.store.selectSignal(selectSelectedBudget);
  readonly loading = this.store.selectSignal(selectFundAccountingLoading);

  budgetId = '';

  onCreate(): void {
    this.router.navigate(['/finance/budgets/create']);
  }

  onLookup(): void {
    if (!this.budgetId.trim()) return;
    this.store.dispatch(FundAccountingActions.loadBudget({ id: this.budgetId.trim() }));
  }

  onViewBudget(id: string): void {
    this.router.navigate(['/finance/budgets', id]);
  }
}
