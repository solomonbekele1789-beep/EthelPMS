import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FundAccountingActions } from '../../store/fund-accounting.actions';
import { selectFundAccountingLoading } from '../../store/fund-accounting.selectors';
import { CreateBudgetRequest } from '../../models/budget.model';

@Component({
  selector: 'ethel-budget-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'finance.budgets.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'finance.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'finance.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project ID is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'finance.fields.fiscalYear' | translate }}</mat-label>
            <input matInput type="number" formControlName="fiscalYear" />
            @if (form.controls.fiscalYear.hasError('required')) {
              <mat-error>Fiscal year is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'finance.fields.currency' | translate }}</mat-label>
            <input matInput formControlName="currencyCode" placeholder="e.g. USD, ETB" />
            @if (form.controls.currencyCode.hasError('required')) {
              <mat-error>Currency code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'finance.fields.exchangeRate' | translate }}</mat-label>
            <input matInput type="number" formControlName="exchangeRate" />
            @if (form.controls.exchangeRate.hasError('required')) {
              <mat-error>Exchange rate is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'fundacct.budgets.create'">
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
    .form-container { max-width: 800px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class BudgetCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectFundAccountingLoading);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    fiscalYear: [new Date().getFullYear(), [Validators.required]],
    currencyCode: ['', [Validators.required]],
    exchangeRate: [1, [Validators.required, Validators.min(0.0001)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateBudgetRequest = {
      title: value.title,
      projectId: value.projectId,
      fiscalYear: value.fiscalYear,
      currencyCode: value.currencyCode,
      exchangeRate: value.exchangeRate,
    };
    this.store.dispatch(FundAccountingActions.createBudget({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/finance/budgets']);
  }
}
