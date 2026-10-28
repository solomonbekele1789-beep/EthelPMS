import { Component, inject, OnInit, signal, computed, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PlanActions } from '../../store/plan.actions';
import { selectSelectedPlan, selectPlanningLoading } from '../../store/plan.selectors';

@Component({
  selector: 'ethel-plan-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="plan()?.title ?? ('planning.detail.title' | translate)">
      @if (plan()) {
        <app-status-badge [status]="plan()!.approvalStatus" [label]="plan()!.approvalStatus"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !plan()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (plan()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'planning.detail.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.level' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.level }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.title' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.title }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.fiscalYear' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.fiscalYear ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.quarter' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.quarter ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.month' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.month ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.plannedStartDate' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.plannedStartDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.plannedEndDate' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.plannedEndDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.plannedBudget' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.plannedBudget | currency:'USD':'symbol':'1.0-0' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.actualBudget' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.actualBudget | currency:'USD':'symbol':'1.0-0' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.beneficiaries' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div>Male: {{ plan()!.beneficiariesMale | number }}</div>
                  <div>Female: {{ plan()!.beneficiariesFemale | number }}</div>
                  <div>Total: {{ plan()!.totalBeneficiaries | number }}</div>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.status' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="plan()!.approvalStatus" [label]="plan()!.approvalStatus"></app-status-badge>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.progress' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.progressPercentage | number:'1.0-1' }}%</mat-card-content>
              </mat-card>
            </div>

            @if (plan()!.description) {
              <mat-card class="narrative-card">
                <mat-card-header>
                  <mat-card-title>{{ 'planning.fields.description' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.description }}</mat-card-content>
              </mat-card>
            }

            <div class="action-buttons">
              @if (plan()!.approvalStatus === 'Draft') {
                <button mat-flat-button color="primary" *appHasPermission="'planning.annual.update'" (click)="onSubmit()">
                  <mat-icon>send</mat-icon>
                  {{ 'planning.actions.submit' | translate }}
                </button>
              }
              @if (plan()!.approvalStatus === 'Submitted') {
                <button mat-flat-button color="primary" *appHasPermission="'planning.annual.approve'" (click)="onApprove()">
                  <mat-icon>check_circle</mat-icon>
                  {{ 'planning.actions.approve' | translate }}
                </button>
                <button mat-stroked-button color="warn" *appHasPermission="'planning.annual.approve'" (click)="onReject()">
                  <mat-icon>cancel</mat-icon>
                  {{ 'planning.actions.reject' | translate }}
                </button>
              }
              <button mat-button (click)="goBack()">
                {{ 'common.back' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Activities Tab -->
        <mat-tab [label]="'planning.detail.activities' | translate">
          <div class="tab-content">
            @if (plan()!.planActivities && plan()!.planActivities.length > 0) {
              <mat-list>
                @for (activity of plan()!.planActivities; track activity.activityId) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>task</mat-icon>
                    <span matListItemTitle>Activity: {{ activity.activityId }}</span>
                    <span matListItemLine>
                      Outcome: {{ activity.outcomeId ?? '-' }} |
                      Output: {{ activity.outputId ?? '-' }} |
                      Budget: {{ activity.plannedBudget | currency:'USD':'symbol':'1.0-0' }} |
                      Responsible: {{ activity.responsibleUserId ?? '-' }}
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <app-empty-state
                icon="task"
                title="No activities"
                message="No activities have been added to this plan yet.">
              </app-empty-state>
            }

            <div class="add-section" *appHasPermission="'planning.annual.update'">
              <button mat-flat-button color="primary" (click)="onAddActivity()">
                <mat-icon>add</mat-icon>
                {{ 'planning.detail.addActivity' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Indicator Allocations Tab -->
        <mat-tab [label]="'planning.detail.indicators' | translate">
          <div class="tab-content">
            @if (plan()!.indicatorAllocations && plan()!.indicatorAllocations.length > 0) {
              <mat-list>
                @for (alloc of plan()!.indicatorAllocations; track alloc.indicatorId) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>assessment</mat-icon>
                    <span matListItemTitle>Indicator: {{ alloc.indicatorId }}</span>
                    <span matListItemLine>
                      Target: {{ alloc.targetValue | number }} |
                      Actual: {{ alloc.actualValue | number }}
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <app-empty-state
                icon="assessment"
                title="No indicator allocations"
                message="No indicator allocations have been assigned to this plan yet.">
              </app-empty-state>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    :host { display: block; }
    .tab-content { padding: 1.5rem 0; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .narrative-card { margin-bottom: 1rem; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .add-section {
      margin-top: 1.5rem;
    }
  `,
})
export default class PlanDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly plan = this.store.selectSignal(selectSelectedPlan);
  readonly loading = this.store.selectSignal(selectPlanningLoading);

  readonly activeTab = signal(0);

  ngOnInit(): void {
    this.store.dispatch(PlanActions.loadPlan({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  onSubmit(): void {
    this.store.dispatch(PlanActions.submitPlan({ id: this.id() }));
  }

  onApprove(): void {
    this.store.dispatch(PlanActions.approvePlan({ id: this.id() }));
  }

  onReject(): void {
    this.store.dispatch(
      PlanActions.rejectPlan({
        id: this.id(),
        request: { planEntryId: this.id(), reason: '' },
      })
    );
  }

  onAddActivity(): void {
    // Could open a dialog or navigate to add activity form
  }

  goBack(): void {
    this.router.navigate(['/planning']);
  }
}
