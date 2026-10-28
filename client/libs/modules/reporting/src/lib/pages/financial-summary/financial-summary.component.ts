import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { FinancialSummaryDto } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'ethel-financial-summary',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="'reporting.financialSummary.title' | translate">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <div class="search-form">
      <form [formGroup]="form" (ngSubmit)="onLoad()">
        <div class="search-row">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project ID is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.fiscalYear' | translate }}</mat-label>
            <input matInput formControlName="fiscalYear" type="number" />
          </mat-form-field>

          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'reporting.financialSummary.load' | translate }}
            }
          </button>
        </div>
      </form>
    </div>

    @if (summary()) {
      <div class="summary-grid">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ 'reporting.financialSummary.totalPlanned' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="summary-value">{{ summary()!.totalPlannedBudget | currency:'USD':'symbol':'1.0-0' }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ 'reporting.financialSummary.totalSpent' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="summary-value">{{ summary()!.totalActualSpent | currency:'USD':'symbol':'1.0-0' }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ 'reporting.financialSummary.variance' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="summary-value" [class.negative]="summary()!.variance < 0" [class.positive]="summary()!.variance >= 0">
              {{ summary()!.variance | currency:'USD':'symbol':'1.0-0' }}
            </span>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ 'reporting.financialSummary.utilizationRate' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="summary-value">{{ summary()!.budgetUtilizationRate | number:'1.0-1' }}%</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ 'reporting.financialSummary.ytdSpent' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="summary-value">{{ summary()!.cumulativeYtdSpent | currency:'USD':'symbol':'1.0-0' }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ 'reporting.financialSummary.burnRate' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="summary-value">{{ summary()!.burnRate | number:'1.0-1' }}%</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ 'reporting.financialSummary.reportCount' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="summary-value">{{ summary()!.reportCount }}</span>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .search-form { margin-bottom: 2rem; }
    .search-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .summary-card { text-align: center; }
    .summary-value {
      font-size: 1.5rem;
      font-weight: 600;
    }
    .negative { color: #d32f2f; }
    .positive { color: #388e3c; }
  `,
})
export default class FinancialSummaryComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly summary = signal<FinancialSummaryDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    projectId: ['', [Validators.required]],
    fiscalYear: [null as number | null],
  });

  onLoad(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const value = this.form.getRawValue();
    this.reportService.getFinancialSummary(value.projectId, value.fiscalYear ?? undefined).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load financial summary');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/reporting']);
  }
}
