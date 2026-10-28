import { Component, inject, OnInit, signal, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { MealActions } from '../../store/meal.actions';
import { selectSelectedEvaluation, selectMealLoading } from '../../store/meal.selectors';
import {
  EvaluationFindingDto,
  DacCriteria,
  AddFindingRequest,
  RespondToFindingRequest,
  VerifyFindingRequest,
} from '../../models/evaluation.model';
import { EvaluationService } from '../../services/evaluation.service';

@Component({
  selector: 'ethel-evaluation-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    SlicePipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="evaluation()?.title ?? ('meal.evaluations.title' | translate)">
      @if (evaluation()) {
        <app-status-badge [status]="evaluation()!.status" [label]="'meal.evalStatus.' + evaluation()!.status | translate"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !evaluation()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (evaluation()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">

        <!-- Tab 1: Overview -->
        <mat-tab [label]="'meal.evaluations.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.fields.title' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ evaluation()!.title }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.evaluations.type' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="evaluation()!.evaluationType" [label]="'meal.evalType.' + evaluation()!.evaluationType | translate"></app-status-badge>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.evaluations.status' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="evaluation()!.status" [label]="'meal.evalStatus.' + evaluation()!.status | translate"></app-status-badge>
                </mat-card-content>
              </mat-card>

              @if (evaluation()!.primaryDacCriteria) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ 'meal.evaluations.dacCriteria' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ 'meal.dacCriteria.' + evaluation()!.primaryDacCriteria | translate }}</mat-card-content>
                </mat-card>
              }

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.evaluations.dates' | translate }} (Planned)</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ evaluation()!.plannedStartDate | date:'mediumDate' }} - {{ evaluation()!.plannedEndDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              @if (evaluation()!.actualStartDate || evaluation()!.actualEndDate) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ 'meal.evaluations.dates' | translate }} (Actual)</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ evaluation()!.actualStartDate | date:'mediumDate' }} - {{ evaluation()!.actualEndDate | date:'mediumDate' }}</mat-card-content>
                </mat-card>
              }

              @if (evaluation()!.budget) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ 'meal.evaluations.budget' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ evaluation()!.budget | currency:'USD':'symbol':'1.0-0' }}</mat-card-content>
                </mat-card>
              }

              @if (evaluation()!.leadEvaluatorUserId) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Lead Evaluator</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ evaluation()!.leadEvaluatorUserId }}</mat-card-content>
                </mat-card>
              }

              @if (evaluation()!.externalEvaluator) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>External Evaluator</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ evaluation()!.externalEvaluator }}</mat-card-content>
                </mat-card>
              }
            </div>

            @if (evaluation()!.methodology) {
              <h3 class="section-title">{{ 'meal.evaluations.methodology' | translate }}</h3>
              <mat-card>
                <mat-card-content>{{ evaluation()!.methodology }}</mat-card-content>
              </mat-card>
            }

            @if (evaluation()!.scope) {
              <h3 class="section-title">{{ 'meal.evaluations.scope' | translate }}</h3>
              <mat-card>
                <mat-card-content>{{ evaluation()!.scope }}</mat-card-content>
              </mat-card>
            }

            @if (evaluation()!.keyQuestions) {
              <h3 class="section-title">{{ 'meal.evaluations.keyQuestions' | translate }}</h3>
              <mat-card>
                <mat-card-content class="pre-wrap">{{ evaluation()!.keyQuestions }}</mat-card-content>
              </mat-card>
            }

            <!-- Complete Button -->
            <div class="action-buttons">
              @if (evaluation()!.status === 'InProgress') {
                <button mat-flat-button color="primary" *appHasPermission="'meal.evaluations.create'" (click)="onComplete()">
                  <mat-icon>check_circle</mat-icon>
                  {{ 'meal.evaluations.complete' | translate }}
                </button>
              }
              <button mat-button (click)="goBack()">
                {{ 'common.back' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Findings -->
        <mat-tab [label]="'meal.findings.title' | translate">
          <div class="tab-content">
            @if (evaluation()!.findings && evaluation()!.findings.length > 0) {
              <mat-accordion>
                @for (finding of evaluation()!.findings; track finding.id) {
                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <span class="finding-order">#{{ finding.sortOrder }}</span>
                        {{ finding.finding | slice:0:60 }}{{ finding.finding.length > 60 ? '...' : '' }}
                      </mat-panel-title>
                      <mat-panel-description>
                        <app-status-badge [status]="finding.status" [label]="'meal.findingStatus.' + finding.status | translate"></app-status-badge>
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <div class="finding-detail">
                      <div class="finding-field">
                        <strong>{{ 'meal.findings.finding' | translate }}:</strong>
                        <p>{{ finding.finding }}</p>
                      </div>

                      @if (finding.dacCriteria) {
                        <div class="finding-field">
                          <strong>{{ 'meal.evaluations.dacCriteria' | translate }}:</strong>
                          <app-status-badge [status]="finding.dacCriteria" [label]="'meal.dacCriteria.' + finding.dacCriteria | translate"></app-status-badge>
                        </div>
                      }

                      @if (finding.recommendation) {
                        <div class="finding-field">
                          <strong>{{ 'meal.findings.recommendation' | translate }}:</strong>
                          <p>{{ finding.recommendation }}</p>
                        </div>
                      }

                      <!-- Management Response -->
                      @if (finding.managementResponse) {
                        <div class="response-section">
                          <h4>Management Response</h4>
                          <p>{{ finding.managementResponse }}</p>
                          @if (finding.responsibleUserId) {
                            <p class="meta-text">Responsible: {{ finding.responsibleUserId }}</p>
                          }
                          @if (finding.dueDate) {
                            <p class="meta-text">Due: {{ finding.dueDate | date:'mediumDate' }}</p>
                          }
                          @if (finding.responseDate) {
                            <p class="meta-text">Response Date: {{ finding.responseDate | date:'mediumDate' }}</p>
                          }
                        </div>
                      }

                      @if (finding.verifiedAt) {
                        <div class="response-section">
                          <h4>Verification</h4>
                          <p class="meta-text">Verified by: {{ finding.verifiedByUserId }} on {{ finding.verifiedAt | date:'medium' }}</p>
                          @if (finding.verificationNotes) {
                            <p>{{ finding.verificationNotes }}</p>
                          }
                        </div>
                      }

                      <!-- Respond to Finding -->
                      @if (respondingToFinding() === finding.id) {
                        <div class="inline-form">
                          <h4>{{ 'meal.findings.respond' | translate }}</h4>
                          <form [formGroup]="respondForm" (ngSubmit)="onRespondToFinding(finding.id)">
                            <mat-form-field appearance="outline" class="full-width">
                              <mat-label>{{ 'meal.findings.response' | translate }}</mat-label>
                              <textarea matInput formControlName="response" rows="3"></textarea>
                            </mat-form-field>
                            <div class="form-grid">
                              <mat-form-field appearance="outline">
                                <mat-label>Responsible User ID</mat-label>
                                <input matInput formControlName="responsibleUserId" />
                              </mat-form-field>
                              <mat-form-field appearance="outline">
                                <mat-label>Due Date</mat-label>
                                <input matInput formControlName="dueDate" type="date" />
                              </mat-form-field>
                            </div>
                            <div class="form-actions">
                              <button mat-button type="button" (click)="respondingToFinding.set(null)">
                                {{ 'common.cancel' | translate }}
                              </button>
                              <button mat-flat-button color="primary" type="submit" [disabled]="respondForm.invalid || respondSaving()">
                                @if (respondSaving()) {
                                  <mat-spinner diameter="20"></mat-spinner>
                                } @else {
                                  {{ 'common.save' | translate }}
                                }
                              </button>
                            </div>
                          </form>
                        </div>
                      } @else {
                        <div class="finding-actions">
                          @if (finding.status === 'Open') {
                            <button mat-stroked-button (click)="respondingToFinding.set(finding.id)">
                              <mat-icon>reply</mat-icon>
                              {{ 'meal.findings.respond' | translate }}
                            </button>
                          }
                          @if (finding.status === 'ResponseProvided') {
                            <button mat-stroked-button color="primary" (click)="onVerifyFinding(finding.id)">
                              <mat-icon>verified</mat-icon>
                              {{ 'meal.findings.verify' | translate }}
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </mat-expansion-panel>
                }
              </mat-accordion>
            } @else {
              <app-empty-state
                icon="find_in_page"
                title="No findings"
                message="Add findings from this evaluation.">
              </app-empty-state>
            }

            <!-- Add Finding Form -->
            @if (showFindingForm()) {
              <div class="inline-form">
                <h4>{{ 'meal.findings.add' | translate }}</h4>
                <form [formGroup]="findingForm" (ngSubmit)="onAddFinding()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'meal.findings.finding' | translate }}</mat-label>
                    <textarea matInput formControlName="finding" rows="3"></textarea>
                  </mat-form-field>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'meal.evaluations.dacCriteria' | translate }}</mat-label>
                      <mat-select formControlName="dacCriteria">
                        <mat-option [value]="''">-- None --</mat-option>
                        @for (criteria of dacCriteriaList; track criteria) {
                          <mat-option [value]="criteria">{{ 'meal.dacCriteria.' + criteria | translate }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Sort Order</mat-label>
                      <input matInput formControlName="sortOrder" type="number" />
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'meal.findings.recommendation' | translate }}</mat-label>
                    <textarea matInput formControlName="recommendation" rows="2"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-button type="button" (click)="showFindingForm.set(false)">
                      {{ 'common.cancel' | translate }}
                    </button>
                    <button mat-flat-button color="primary" type="submit" [disabled]="findingForm.invalid || findingSaving()">
                      @if (findingSaving()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        {{ 'common.add' | translate }}
                      }
                    </button>
                  </div>
                </form>
              </div>
            } @else {
              <button mat-stroked-button class="add-finding-btn" (click)="showFindingForm.set(true)">
                <mat-icon>add</mat-icon>
                {{ 'meal.findings.add' | translate }}
              </button>
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
    .section-title {
      margin: 1.5rem 0 0.75rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .pre-wrap { white-space: pre-wrap; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .finding-order {
      font-weight: 600;
      margin-right: 0.5rem;
      color: rgba(0, 0, 0, 0.6);
    }
    .finding-detail { display: flex; flex-direction: column; gap: 0.75rem; }
    .finding-field p { margin: 0.25rem 0 0; }
    .response-section {
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 4px;
      margin-top: 0.5rem;
    }
    .response-section h4 { margin: 0 0 0.5rem; }
    .meta-text { font-size: 0.875rem; color: rgba(0, 0, 0, 0.6); margin: 0.25rem 0; }
    .finding-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .inline-form {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .full-width { width: 100%; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .add-finding-btn { margin-top: 1rem; }
  `,
})
export default class EvaluationDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly evaluationService = inject(EvaluationService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly evaluation = this.store.selectSignal(selectSelectedEvaluation);
  readonly loading = this.store.selectSignal(selectMealLoading);

  readonly activeTab = signal(0);
  readonly showFindingForm = signal(false);
  readonly findingSaving = signal(false);
  readonly respondingToFinding = signal<string | null>(null);
  readonly respondSaving = signal(false);

  readonly dacCriteriaList: DacCriteria[] = [
    'Relevance', 'Coherence', 'Effectiveness', 'Efficiency', 'Impact', 'Sustainability',
  ];

  readonly findingForm = this.fb.nonNullable.group({
    finding: ['', [Validators.required]],
    dacCriteria: [''],
    recommendation: [''],
    sortOrder: [1, [Validators.required, Validators.min(1)]],
  });

  readonly respondForm = this.fb.nonNullable.group({
    response: ['', [Validators.required]],
    responsibleUserId: ['', [Validators.required]],
    dueDate: [''],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(MealActions.loadEvaluation({ id }));
      }
    });
  }

  ngOnInit(): void {
    // Initial load handled by effect reacting to id changes
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  onComplete(): void {
    const dateStr = prompt('Enter the actual end date (YYYY-MM-DD):');
    if (dateStr) {
      this.evaluationService
        .completeEvaluation(this.id(), { evaluationId: this.id(), actualEndDate: dateStr })
        .subscribe({
          next: () => {
            this.notification.success('Evaluation completed');
            this.store.dispatch(MealActions.loadEvaluation({ id: this.id() }));
          },
          error: () => this.notification.error('Failed to complete evaluation'),
        });
    }
  }

  onAddFinding(): void {
    if (this.findingForm.invalid) return;
    this.findingSaving.set(true);
    const value = this.findingForm.getRawValue();
    const request: AddFindingRequest = {
      evaluationId: this.id(),
      finding: value.finding,
      dacCriteria: (value.dacCriteria as DacCriteria) || undefined,
      recommendation: value.recommendation || undefined,
      sortOrder: value.sortOrder,
    };
    this.evaluationService.addFinding(this.id(), request).subscribe({
      next: () => {
        this.findingSaving.set(false);
        this.showFindingForm.set(false);
        this.findingForm.reset({ finding: '', dacCriteria: '', recommendation: '', sortOrder: 1 });
        this.notification.success('Finding added');
        this.store.dispatch(MealActions.loadEvaluation({ id: this.id() }));
      },
      error: () => {
        this.findingSaving.set(false);
        this.notification.error('Failed to add finding');
      },
    });
  }

  onRespondToFinding(findingId: string): void {
    if (this.respondForm.invalid) return;
    this.respondSaving.set(true);
    const value = this.respondForm.getRawValue();
    const request: RespondToFindingRequest = {
      findingId,
      response: value.response,
      responsibleUserId: value.responsibleUserId,
      dueDate: value.dueDate || undefined,
    };
    this.evaluationService.respondToFinding(findingId, request).subscribe({
      next: () => {
        this.respondSaving.set(false);
        this.respondingToFinding.set(null);
        this.respondForm.reset();
        this.notification.success('Response submitted');
        this.store.dispatch(MealActions.loadEvaluation({ id: this.id() }));
      },
      error: () => {
        this.respondSaving.set(false);
        this.notification.error('Failed to submit response');
      },
    });
  }

  onVerifyFinding(findingId: string): void {
    const notes = prompt('Verification notes (optional):');
    const request: VerifyFindingRequest = {
      findingId,
      notes: notes || undefined,
    };
    this.evaluationService.verifyFinding(findingId, request).subscribe({
      next: () => {
        this.notification.success('Finding verified');
        this.store.dispatch(MealActions.loadEvaluation({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to verify finding'),
    });
  }

  goBack(): void {
    this.router.navigate(['/meal/evaluations']);
  }
}
