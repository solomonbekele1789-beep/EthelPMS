import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FundAccountingActions } from '../../store/fund-accounting.actions';
import {
  selectSelectedBudget,
  selectAccounts,
  selectFundAccountingLoading,
} from '../../store/fund-accounting.selectors';
import { BudgetService } from '../../services/budget.service';
import { AddBudgetLineRequest, BudgetStatus } from '../../models/budget.model';

@Component({
  selector: 'ethel-budget-detail',
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
    MatTableModule,
    MatChipsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="budget()?.title ?? ('finance.budgets.detail' | translate)">
      @if (budget()) {
        <app-status-badge [status]="budget()!.status" [label]="budget()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !budget()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (budget()) {
      <!-- Budget Header Info -->
      <div class="detail-grid">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'finance.fields.projectId' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ budget()!.projectId }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'finance.fields.fiscalYear' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ budget()!.fiscalYear }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'finance.fields.currency' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ budget()!.currencyCode }} ({{ 'finance.fields.exchangeRate' | translate }}: {{ budget()!.exchangeRate }})</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'finance.fields.totalAmount' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ budget()!.totalAmount | number:'1.2-2' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'finance.fields.version' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ budget()!.version }}</mat-card-content>
        </mat-card>
      </div>

      <!-- Budget Lines Table -->
      <mat-card class="lines-card">
        <mat-card-header>
          <mat-card-title>{{ 'finance.budgets.lines' | translate }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (budget()!.lines.length === 0) {
            <p class="no-data">{{ 'finance.budgets.noLines' | translate }}</p>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="budget()!.lines" class="lines-table">
                <ng-container matColumnDef="accountName">
                  <th mat-header-cell *matHeaderCellDef>{{ 'finance.fields.account' | translate }}</th>
                  <td mat-cell *matCellDef="let line">{{ line.accountName }}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>{{ 'finance.fields.description' | translate }}</th>
                  <td mat-cell *matCellDef="let line">{{ line.description }}</td>
                </ng-container>

                <ng-container matColumnDef="q1Amount">
                  <th mat-header-cell *matHeaderCellDef>Q1</th>
                  <td mat-cell *matCellDef="let line">{{ line.q1Amount | number:'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="q2Amount">
                  <th mat-header-cell *matHeaderCellDef>Q2</th>
                  <td mat-cell *matCellDef="let line">{{ line.q2Amount | number:'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="q3Amount">
                  <th mat-header-cell *matHeaderCellDef>Q3</th>
                  <td mat-cell *matCellDef="let line">{{ line.q3Amount | number:'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="q4Amount">
                  <th mat-header-cell *matHeaderCellDef>Q4</th>
                  <td mat-cell *matCellDef="let line">{{ line.q4Amount | number:'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="annualAmount">
                  <th mat-header-cell *matHeaderCellDef>{{ 'finance.fields.annual' | translate }}</th>
                  <td mat-cell *matCellDef="let line"><strong>{{ line.annualAmount | number:'1.2-2' }}</strong></td>
                </ng-container>

                <ng-container matColumnDef="actualAmount">
                  <th mat-header-cell *matHeaderCellDef>{{ 'finance.fields.actual' | translate }}</th>
                  <td mat-cell *matCellDef="let line">{{ line.actualAmount | number:'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="variance">
                  <th mat-header-cell *matHeaderCellDef>{{ 'finance.fields.variance' | translate }}</th>
                  <td mat-cell *matCellDef="let line" [class.positive]="line.variance >= 0" [class.negative]="line.variance < 0">
                    {{ line.variance | number:'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="utilizationRate">
                  <th mat-header-cell *matHeaderCellDef>{{ 'finance.fields.utilization' | translate }}</th>
                  <td mat-cell *matCellDef="let line">{{ line.utilizationRate | number:'1.1-1' }}%</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Add Line Form -->
      @if (showAddLineForm()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'finance.budgets.addLine' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="addLineForm" (ngSubmit)="onAddLine()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'finance.fields.account' | translate }}</mat-label>
                  <mat-select formControlName="accountId">
                    @for (account of accounts(); track account.id) {
                      <mat-option [value]="account.id">{{ account.accountCode }} - {{ account.accountName }}</mat-option>
                    }
                  </mat-select>
                  @if (addLineForm.controls.accountId.hasError('required')) {
                    <mat-error>Account is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'finance.fields.description' | translate }}</mat-label>
                  <input matInput formControlName="description" />
                  @if (addLineForm.controls.description.hasError('required')) {
                    <mat-error>Description is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Q1 {{ 'finance.fields.amount' | translate }}</mat-label>
                  <input matInput type="number" formControlName="q1Amount" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Q2 {{ 'finance.fields.amount' | translate }}</mat-label>
                  <input matInput type="number" formControlName="q2Amount" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Q3 {{ 'finance.fields.amount' | translate }}</mat-label>
                  <input matInput type="number" formControlName="q3Amount" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Q4 {{ 'finance.fields.amount' | translate }}</mat-label>
                  <input matInput type="number" formControlName="q4Amount" />
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="showAddLineForm.set(false)">{{ 'common.cancel' | translate }}</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="addLineForm.invalid">
                  {{ 'finance.budgets.addLine' | translate }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- Action Buttons -->
      <div class="action-buttons">
        @if (budget()!.status === 'Draft' || budget()!.status === 'Revised') {
          <button mat-stroked-button *appHasPermission="'fundacct.budgets.update'" (click)="showAddLineForm.set(!showAddLineForm())">
            <mat-icon>add</mat-icon>
            {{ 'finance.budgets.addLine' | translate }}
          </button>
          <button mat-flat-button color="primary" *appHasPermission="'fundacct.budgets.update'" (click)="onSubmitBudget()">
            <mat-icon>send</mat-icon>
            {{ 'finance.budgets.submit' | translate }}
          </button>
        }
        @if (budget()!.status === 'Submitted') {
          <button mat-flat-button color="primary" *appHasPermission="'fundacct.budgets.approve'" (click)="onApproveBudget()">
            <mat-icon>check_circle</mat-icon>
            {{ 'finance.budgets.approve' | translate }}
          </button>
        }
        <button mat-button (click)="goBack()">
          {{ 'common.back' | translate }}
        </button>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .lines-card { margin-bottom: 1.5rem; }
    .table-container { overflow-x: auto; }
    .lines-table { width: 100%; }
    .no-data { color: rgba(0, 0, 0, 0.54); font-style: italic; }
    .positive { color: #2e7d32; }
    .negative { color: #c62828; }
    .inline-form-card { margin-bottom: 1.5rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class BudgetDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly budgetService = inject(BudgetService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly budget = this.store.selectSignal(selectSelectedBudget);
  readonly accounts = this.store.selectSignal(selectAccounts);
  readonly loading = this.store.selectSignal(selectFundAccountingLoading);

  readonly showAddLineForm = signal(false);

  readonly displayedColumns = [
    'accountName', 'description',
    'q1Amount', 'q2Amount', 'q3Amount', 'q4Amount',
    'annualAmount', 'actualAmount', 'variance', 'utilizationRate',
  ];

  readonly addLineForm = this.fb.nonNullable.group({
    accountId: ['', [Validators.required]],
    description: ['', [Validators.required]],
    q1Amount: [0],
    q2Amount: [0],
    q3Amount: [0],
    q4Amount: [0],
  });

  ngOnInit(): void {
    this.store.dispatch(FundAccountingActions.loadBudget({ id: this.id() }));
    this.store.dispatch(FundAccountingActions.loadAccounts({}));
  }

  onAddLine(): void {
    if (this.addLineForm.invalid) return;
    const value = this.addLineForm.getRawValue();
    const request: AddBudgetLineRequest = {
      budgetId: this.id(),
      accountId: value.accountId,
      description: value.description,
      q1Amount: value.q1Amount,
      q2Amount: value.q2Amount,
      q3Amount: value.q3Amount,
      q4Amount: value.q4Amount,
    };
    this.budgetService.addBudgetLine(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Budget line added successfully');
        this.showAddLineForm.set(false);
        this.addLineForm.reset();
        this.store.dispatch(FundAccountingActions.loadBudget({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to add budget line'),
    });
  }

  onSubmitBudget(): void {
    if (!confirm('Are you sure you want to submit this budget for approval?')) return;
    this.budgetService.submitBudget(this.id()).subscribe({
      next: () => {
        this.notification.success('Budget submitted successfully');
        this.store.dispatch(FundAccountingActions.loadBudget({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to submit budget'),
    });
  }

  onApproveBudget(): void {
    if (!confirm('Are you sure you want to approve this budget?')) return;
    this.budgetService.approveBudget(this.id()).subscribe({
      next: () => {
        this.notification.success('Budget approved successfully');
        this.store.dispatch(FundAccountingActions.loadBudget({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to approve budget'),
    });
  }

  goBack(): void {
    this.router.navigate(['/finance/budgets']);
  }
}
