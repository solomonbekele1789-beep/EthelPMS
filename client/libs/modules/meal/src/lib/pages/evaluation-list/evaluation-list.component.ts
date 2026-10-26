import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { MealActions } from '../../store/meal.actions';
import { selectEvaluations, selectMealLoading } from '../../store/meal.selectors';
import { EvaluationDto, EvaluationStatus, EvaluationType } from '../../models/evaluation.model';

@Component({
  selector: 'ethel-evaluation-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'meal.evaluations.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'meal.evaluations.create'" (click)="onCreateEvaluation()">
        <mat-icon>add</mat-icon>
        {{ 'meal.evaluations.create' | translate }}
      </button>
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-chips">
        <span class="filter-label">{{ 'meal.evaluations.status' | translate }}:</span>
        <mat-chip-set>
          <mat-chip
            [highlighted]="!statusFilter()"
            (click)="onStatusFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (status of statuses; track status) {
            <mat-chip
              [highlighted]="statusFilter() === status"
              (click)="onStatusFilter(status)">
              <app-status-badge [status]="status" [label]="'meal.evalStatus.' + status | translate"></app-status-badge>
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (filteredEvaluations().length === 0) {
        <app-empty-state
          icon="assessment"
          title="No evaluations found"
          message="Get started by creating your first evaluation.">
        </app-empty-state>
      } @else {
        <div class="card-grid">
          @for (evaluation of filteredEvaluations(); track evaluation.id) {
            <mat-card class="evaluation-card" (click)="onCardClick(evaluation)">
              <mat-card-header>
                <mat-card-title>{{ evaluation.title }}</mat-card-title>
                <mat-card-subtitle>
                  <app-status-badge [status]="evaluation.evaluationType" [label]="'meal.evalType.' + evaluation.evaluationType | translate"></app-status-badge>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="card-details">
                  <div class="card-field">
                    <span class="card-label">{{ 'meal.evaluations.status' | translate }}</span>
                    <app-status-badge [status]="evaluation.status" [label]="'meal.evalStatus.' + evaluation.status | translate"></app-status-badge>
                  </div>
                  <div class="card-field">
                    <span class="card-label">{{ 'meal.evaluations.dates' | translate }}</span>
                    <span>{{ evaluation.plannedStartDate | date:'mediumDate' }} - {{ evaluation.plannedEndDate | date:'mediumDate' }}</span>
                  </div>
                  @if (evaluation.budget) {
                    <div class="card-field">
                      <span class="card-label">{{ 'meal.evaluations.budget' | translate }}</span>
                      <span>{{ evaluation.budget | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                  }
                  @if (evaluation.primaryDacCriteria) {
                    <div class="card-field">
                      <span class="card-label">{{ 'meal.evaluations.dacCriteria' | translate }}</span>
                      <span>{{ 'meal.dacCriteria.' + evaluation.primaryDacCriteria | translate }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .filter-label { font-weight: 500; white-space: nowrap; }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }
    .evaluation-card { cursor: pointer; transition: box-shadow 0.2s; }
    .evaluation-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    .card-details { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
    .card-field { display: flex; justify-content: space-between; align-items: center; }
    .card-label { font-weight: 500; font-size: 0.875rem; color: rgba(0, 0, 0, 0.6); }
  `,
})
export default class EvaluationListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly evaluations = this.store.selectSignal(selectEvaluations);
  readonly loading = this.store.selectSignal(selectMealLoading);

  readonly statusFilter = signal<EvaluationStatus | undefined>(undefined);

  readonly statuses: EvaluationStatus[] = ['Planned', 'InProgress', 'Completed', 'Cancelled'];

  readonly filteredEvaluations = signal<EvaluationDto[]>([]);

  constructor() {
    // Use an effect to compute filtered evaluations reactively
    effect(() => {
      const evals = this.evaluations();
      const status = this.statusFilter();
      let filtered = evals;
      if (status) {
        filtered = filtered.filter(e => e.status === status);
      }
      this.filteredEvaluations.set(filtered);
    });
  }

  ngOnInit(): void {
    this.store.dispatch(MealActions.loadEvaluations({}));
  }

  onStatusFilter(status: EvaluationStatus | undefined): void {
    this.statusFilter.set(status);
  }

  onCardClick(evaluation: EvaluationDto): void {
    this.router.navigate(['/meal/evaluations', evaluation.id]);
  }

  onCreateEvaluation(): void {
    // Navigate to create — the create form is handled within the detail component or a separate route
    // For simplicity, we can prompt inline; however the spec expects navigation
    this.router.navigate(['/meal/evaluations/create']);
  }

  goBack(): void {
    this.router.navigate(['/meal']);
  }
}
