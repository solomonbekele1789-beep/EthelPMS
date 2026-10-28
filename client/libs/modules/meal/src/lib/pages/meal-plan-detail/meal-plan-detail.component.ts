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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DatePipe, DecimalPipe } from '@angular/common';
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
import { selectSelectedMealPlan, selectMealLoading } from '../../store/meal.selectors';
import {
  MealPlanDto,
  MealIndicatorDto,
  IndicatorMeasurementDto,
  IndicatorLevel,
  CollectionFrequency,
  AddMealIndicatorRequest,
  RecordMeasurementRequest,
} from '../../models/meal-plan.model';
import { MealPlanService } from '../../services/meal-plan.service';

interface SectionInfo {
  number: number;
  field: string;
  completenessField: string;
  labelKey: string;
}

@Component({
  selector: 'ethel-meal-plan-detail',
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
    MatProgressBarModule,
    MatDialogModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="plan()?.title ?? ('meal.plans.title' | translate)">
      @if (plan()) {
        <app-status-badge [status]="plan()!.status" [label]="'meal.planStatus.' + plan()!.status | translate"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !plan()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (plan()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">

        <!-- Tab 1: Overview -->
        <mat-tab [label]="'meal.plans.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.fields.title' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.title }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.fields.description' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.description ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.fields.status' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="plan()!.status" [label]="'meal.planStatus.' + plan()!.status | translate"></app-status-badge>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.fields.projectId' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.projectId }}</mat-card-content>
              </mat-card>
            </div>

            <!-- Overall Completeness -->
            <h3 class="section-title">{{ 'meal.plans.overall' | translate }}</h3>
            <div class="overall-completeness">
              <mat-progress-bar mode="determinate" [value]="plan()!.overallCompleteness"></mat-progress-bar>
              <span class="completeness-label">{{ plan()!.overallCompleteness | number:'1.0-0' }}%</span>
            </div>

            <!-- Section Completeness Grid -->
            <h3 class="section-title">{{ 'meal.plans.sections' | translate }}</h3>
            <div class="sections-grid">
              @for (section of sections; track section.number) {
                <div class="section-score">
                  <span class="section-name">{{ section.labelKey | translate }}</span>
                  <div class="section-bar">
                    <mat-progress-bar mode="determinate" [value]="getSectionCompleteness(section)"></mat-progress-bar>
                    <span class="section-pct">{{ getSectionCompleteness(section) | number:'1.0-0' }}%</span>
                  </div>
                </div>
              }
            </div>

            @if (plan()!.status === 'Rejected' && plan()!.rejectionReason) {
              <div class="rejection-banner">
                <mat-icon>warning</mat-icon>
                <div>
                  <strong>{{ 'meal.history.rejectionReason' | translate }}:</strong>
                  <p>{{ plan()!.rejectionReason }}</p>
                </div>
              </div>
            }

            <!-- Workflow Buttons -->
            <div class="action-buttons">
              @if (plan()!.status === 'Draft') {
                <button mat-flat-button color="primary" *appHasPermission="'meal.plans.update'" (click)="onSubmitPlan()">
                  <mat-icon>send</mat-icon>
                  {{ 'meal.actions.submit' | translate }}
                </button>
              }
              @if (plan()!.status === 'Submitted') {
                <button mat-flat-button color="primary" *appHasPermission="'meal.plans.update'" (click)="onApprovePlan()">
                  <mat-icon>check_circle</mat-icon>
                  {{ 'meal.actions.approve' | translate }}
                </button>
                <button mat-stroked-button color="warn" *appHasPermission="'meal.plans.update'" (click)="onRejectPlan()">
                  <mat-icon>cancel</mat-icon>
                  {{ 'meal.actions.reject' | translate }}
                </button>
              }
              <button mat-button (click)="goBack()">
                {{ 'common.back' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Sections (8-section wizard) -->
        <mat-tab [label]="'meal.plans.sections' | translate">
          <div class="tab-content">
            <mat-accordion>
              @for (section of sections; track section.number) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{ section.number }}. {{ section.labelKey | translate }}</mat-panel-title>
                    <mat-panel-description>
                      {{ 'meal.fields.completeness' | translate }}: {{ getSectionCompleteness(section) | number:'1.0-0' }}%
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  @if (getSectionContent(section)) {
                    <pre class="section-content">{{ getSectionContent(section) }}</pre>
                  } @else {
                    <p class="no-content">No content yet.</p>
                  }

                  @if (editingSection() === section.number) {
                    <div class="section-edit-form">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ section.labelKey | translate }}</mat-label>
                        <textarea matInput [formControl]="sectionContentControl" rows="8"></textarea>
                      </mat-form-field>
                      <div class="form-actions">
                        <button mat-button type="button" (click)="cancelSectionEdit()">
                          {{ 'common.cancel' | translate }}
                        </button>
                        <button mat-flat-button color="primary" [disabled]="sectionSaving()" (click)="saveSection(section.number)">
                          @if (sectionSaving()) {
                            <mat-spinner diameter="20"></mat-spinner>
                          } @else {
                            {{ 'common.save' | translate }}
                          }
                        </button>
                      </div>
                    </div>
                  } @else {
                    <button mat-stroked-button (click)="startSectionEdit(section)">
                      <mat-icon>edit</mat-icon>
                      {{ 'common.edit' | translate }}
                    </button>
                  }
                </mat-expansion-panel>
              }
            </mat-accordion>
          </div>
        </mat-tab>

        <!-- Tab 3: Indicators -->
        <mat-tab [label]="'meal.indicators.title' | translate">
          <div class="tab-content">
            @if (plan()!.indicators && plan()!.indicators.length > 0) {
              <table class="indicators-table">
                <thead>
                  <tr>
                    <th>{{ 'meal.indicators.name' | translate }}</th>
                    <th>{{ 'meal.indicators.level' | translate }}</th>
                    <th>{{ 'meal.indicators.baseline' | translate }}</th>
                    <th>{{ 'meal.indicators.target' | translate }}</th>
                    <th>{{ 'meal.indicators.frequency' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (indicator of plan()!.indicators; track indicator.id) {
                    <tr class="clickable-row" (click)="onSelectIndicator(indicator)">
                      <td>{{ indicator.name }}</td>
                      <td>{{ indicator.level }}</td>
                      <td>{{ indicator.baselineValue ?? '-' }}</td>
                      <td>{{ indicator.targetValue ?? '-' }}</td>
                      <td>{{ indicator.collectionFrequency }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <app-empty-state
                icon="trending_up"
                title="No indicators"
                message="Add indicators to track progress for this MEAL plan.">
              </app-empty-state>
            }

            <!-- Selected Indicator Measurements -->
            @if (selectedIndicator()) {
              <div class="measurements-section">
                <h3 class="section-title">{{ 'meal.measurements.title' | translate }} - {{ selectedIndicator()!.name }}</h3>

                @if (measurements().length > 0) {
                  <table class="measurements-table">
                    <thead>
                      <tr>
                        <th>{{ 'meal.measurements.period' | translate }}</th>
                        <th>{{ 'meal.measurements.value' | translate }}</th>
                        <th>{{ 'meal.measurements.male' | translate }}</th>
                        <th>{{ 'meal.measurements.female' | translate }}</th>
                        <th>{{ 'meal.measurements.date' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (m of measurements(); track m.id) {
                        <tr>
                          <td>{{ m.period }}</td>
                          <td>{{ m.value }}</td>
                          <td>{{ m.disaggregatedMale ?? '-' }}</td>
                          <td>{{ m.disaggregatedFemale ?? '-' }}</td>
                          <td>{{ m.measurementDate | date:'mediumDate' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                } @else {
                  <p class="no-content">No measurements recorded yet.</p>
                }

                <!-- Record Measurement Form -->
                @if (showMeasurementForm()) {
                  <div class="inline-form">
                    <h4>{{ 'meal.measurements.record' | translate }}</h4>
                    <form [formGroup]="measurementForm" (ngSubmit)="onRecordMeasurement()">
                      <div class="form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'meal.measurements.period' | translate }}</mat-label>
                          <input matInput formControlName="period" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'meal.measurements.value' | translate }}</mat-label>
                          <input matInput formControlName="value" type="number" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'meal.measurements.date' | translate }}</mat-label>
                          <input matInput formControlName="measurementDate" type="date" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'meal.measurements.male' | translate }}</mat-label>
                          <input matInput formControlName="male" type="number" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'meal.measurements.female' | translate }}</mat-label>
                          <input matInput formControlName="female" type="number" />
                        </mat-form-field>
                      </div>
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Notes</mat-label>
                        <textarea matInput formControlName="notes" rows="2"></textarea>
                      </mat-form-field>
                      <div class="form-actions">
                        <button mat-button type="button" (click)="showMeasurementForm.set(false)">
                          {{ 'common.cancel' | translate }}
                        </button>
                        <button mat-flat-button color="primary" type="submit"
                          [disabled]="measurementForm.invalid || measurementSaving()">
                          @if (measurementSaving()) {
                            <mat-spinner diameter="20"></mat-spinner>
                          } @else {
                            {{ 'common.save' | translate }}
                          }
                        </button>
                      </div>
                    </form>
                  </div>
                } @else {
                  <button mat-stroked-button (click)="showMeasurementForm.set(true)">
                    <mat-icon>add</mat-icon>
                    {{ 'meal.measurements.record' | translate }}
                  </button>
                }
              </div>
            }

            <!-- Add Indicator Form -->
            @if (showIndicatorForm()) {
              <div class="inline-form">
                <h4>{{ 'meal.indicators.add' | translate }}</h4>
                <form [formGroup]="indicatorForm" (ngSubmit)="onAddIndicator()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'meal.indicators.name' | translate }}</mat-label>
                      <input matInput formControlName="name" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'meal.indicators.level' | translate }}</mat-label>
                      <mat-select formControlName="level">
                        @for (level of indicatorLevels; track level) {
                          <mat-option [value]="level">{{ level }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'meal.indicators.frequency' | translate }}</mat-label>
                      <mat-select formControlName="collectionFrequency">
                        @for (freq of frequencies; track freq) {
                          <mat-option [value]="freq">{{ freq }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Indicator ID (optional)</mat-label>
                      <input matInput formControlName="indicatorId" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'meal.indicators.baseline' | translate }}</mat-label>
                      <input matInput formControlName="baselineValue" type="number" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'meal.indicators.target' | translate }}</mat-label>
                      <input matInput formControlName="targetValue" type="number" />
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-button type="button" (click)="showIndicatorForm.set(false)">
                      {{ 'common.cancel' | translate }}
                    </button>
                    <button mat-flat-button color="primary" type="submit"
                      [disabled]="indicatorForm.invalid || indicatorSaving()">
                      @if (indicatorSaving()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        {{ 'common.add' | translate }}
                      }
                    </button>
                  </div>
                </form>
              </div>
            } @else {
              <button mat-stroked-button class="add-indicator-btn" (click)="showIndicatorForm.set(true)">
                <mat-icon>add</mat-icon>
                {{ 'meal.indicators.add' | translate }}
              </button>
            }
          </div>
        </mat-tab>

        <!-- Tab 4: History -->
        <mat-tab [label]="'meal.history.title' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.history.submittedBy' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.submittedBy ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.history.submittedAt' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.submittedAt ? (plan()!.submittedAt! | date:'medium') : '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.history.approvedBy' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.approvedBy ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'meal.history.approvedAt' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ plan()!.approvedAt ? (plan()!.approvedAt! | date:'medium') : '-' }}</mat-card-content>
              </mat-card>

              @if (plan()!.rejectionReason) {
                <mat-card class="full-width-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'meal.history.rejectionReason' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ plan()!.rejectionReason }}</mat-card-content>
                </mat-card>
              }
            </div>
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
    .overall-completeness {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .overall-completeness mat-progress-bar { flex: 1; }
    .completeness-label { font-weight: 500; min-width: 40px; }
    .sections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .section-score {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .section-name { font-weight: 500; font-size: 0.875rem; }
    .section-bar { display: flex; align-items: center; gap: 0.5rem; }
    .section-bar mat-progress-bar { flex: 1; }
    .section-pct { font-size: 0.8rem; min-width: 35px; }
    .rejection-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      border-radius: 4px;
      margin: 1rem 0;
    }
    .rejection-banner mat-icon { color: #ff9800; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .section-content {
      white-space: pre-wrap;
      font-family: inherit;
      margin: 0.5rem 0 1rem;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 4px;
    }
    .no-content {
      color: rgba(0, 0, 0, 0.54);
      font-style: italic;
      margin: 0.5rem 0 1rem;
    }
    .section-edit-form { margin-top: 1rem; }
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
    .indicators-table,
    .measurements-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    .indicators-table th,
    .indicators-table td,
    .measurements-table th,
    .measurements-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .indicators-table th,
    .measurements-table th { font-weight: 500; }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: rgba(0, 0, 0, 0.04); }
    .measurements-section {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .inline-form {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .add-indicator-btn { margin-top: 1rem; }
    .full-width-card { grid-column: 1 / -1; }
  `,
})
export default class MealPlanDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly mealPlanService = inject(MealPlanService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly plan = this.store.selectSignal(selectSelectedMealPlan);
  readonly loading = this.store.selectSignal(selectMealLoading);

  readonly activeTab = signal(0);
  readonly editingSection = signal<number | null>(null);
  readonly sectionSaving = signal(false);
  readonly showIndicatorForm = signal(false);
  readonly indicatorSaving = signal(false);
  readonly selectedIndicator = signal<MealIndicatorDto | null>(null);
  readonly measurements = signal<IndicatorMeasurementDto[]>([]);
  readonly showMeasurementForm = signal(false);
  readonly measurementSaving = signal(false);
  readonly rejectionReason = signal('');

  readonly indicatorLevels: IndicatorLevel[] = ['Goal', 'Outcome', 'Output'];
  readonly frequencies: CollectionFrequency[] = [
    'Monthly', 'Quarterly', 'SemiAnnually', 'Annually', 'Baseline', 'Endline', 'AdHoc',
  ];

  readonly sections: SectionInfo[] = [
    { number: 1, field: 'resultsAndIndicators', completenessField: 'completenessResultsIndicators', labelKey: 'meal.plans.section1' },
    { number: 2, field: 'dataQuality', completenessField: 'completenessDataQuality', labelKey: 'meal.plans.section2' },
    { number: 3, field: 'indicatorProgressPlans', completenessField: 'completenessProgressPlans', labelKey: 'meal.plans.section3' },
    { number: 4, field: 'learningPlan', completenessField: 'completenessLearningPlan', labelKey: 'meal.plans.section4' },
    { number: 5, field: 'melActivities', completenessField: 'completenessMelActivities', labelKey: 'meal.plans.section5' },
    { number: 6, field: 'melBudget', completenessField: 'completenessMelBudget', labelKey: 'meal.plans.section6' },
    { number: 7, field: 'reportingPlan', completenessField: 'completenessReportingPlan', labelKey: 'meal.plans.section7' },
    { number: 8, field: 'communicationPlan', completenessField: 'completenessCommunicationPlan', labelKey: 'meal.plans.section8' },
  ];

  readonly sectionContentControl = this.fb.control('');

  readonly indicatorForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    level: ['' as string, [Validators.required]],
    collectionFrequency: ['' as string, [Validators.required]],
    indicatorId: [''],
    baselineValue: [null as number | null],
    targetValue: [null as number | null],
  });

  readonly measurementForm = this.fb.nonNullable.group({
    period: ['', [Validators.required]],
    value: [0, [Validators.required]],
    measurementDate: ['', [Validators.required]],
    notes: [''],
    male: [null as number | null],
    female: [null as number | null],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(MealActions.loadPlan({ id }));
      }
    });
  }

  ngOnInit(): void {
    // Initial load handled by effect reacting to id changes
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  getSectionCompleteness(section: SectionInfo): number {
    const p = this.plan();
    if (!p) return 0;
    return (p as any)[section.completenessField] ?? 0;
  }

  getSectionContent(section: SectionInfo): string | undefined {
    const p = this.plan();
    if (!p) return undefined;
    return (p as any)[section.field];
  }

  startSectionEdit(section: SectionInfo): void {
    this.editingSection.set(section.number);
    this.sectionContentControl.setValue(this.getSectionContent(section) ?? '');
  }

  cancelSectionEdit(): void {
    this.editingSection.set(null);
    this.sectionContentControl.setValue('');
  }

  saveSection(sectionNumber: number): void {
    this.sectionSaving.set(true);
    this.mealPlanService
      .updateSection(this.id(), sectionNumber, this.sectionContentControl.value || undefined)
      .subscribe({
        next: () => {
          this.sectionSaving.set(false);
          this.editingSection.set(null);
          this.notification.success('Section saved successfully');
          this.store.dispatch(MealActions.loadPlan({ id: this.id() }));
        },
        error: () => {
          this.sectionSaving.set(false);
          this.notification.error('Failed to save section');
        },
      });
  }

  onSelectIndicator(indicator: MealIndicatorDto): void {
    this.selectedIndicator.set(indicator);
    this.showMeasurementForm.set(false);
    this.loadMeasurements(indicator.id);
  }

  loadMeasurements(indicatorId: string): void {
    this.mealPlanService.listMeasurements(indicatorId).subscribe({
      next: (data) => this.measurements.set(data),
      error: () => this.notification.error('Failed to load measurements'),
    });
  }

  onAddIndicator(): void {
    if (this.indicatorForm.invalid) return;
    this.indicatorSaving.set(true);
    const value = this.indicatorForm.getRawValue();
    const request: AddMealIndicatorRequest = {
      mealPlanId: this.id(),
      name: value.name,
      level: value.level as IndicatorLevel,
      collectionFrequency: value.collectionFrequency as CollectionFrequency,
      indicatorId: value.indicatorId || undefined,
      baselineValue: value.baselineValue ?? undefined,
      targetValue: value.targetValue ?? undefined,
    };
    this.mealPlanService.addIndicator(this.id(), request).subscribe({
      next: () => {
        this.indicatorSaving.set(false);
        this.showIndicatorForm.set(false);
        this.indicatorForm.reset();
        this.notification.success('Indicator added successfully');
        this.store.dispatch(MealActions.loadPlan({ id: this.id() }));
      },
      error: () => {
        this.indicatorSaving.set(false);
        this.notification.error('Failed to add indicator');
      },
    });
  }

  onRecordMeasurement(): void {
    if (this.measurementForm.invalid || !this.selectedIndicator()) return;
    this.measurementSaving.set(true);
    const value = this.measurementForm.getRawValue();
    const request: RecordMeasurementRequest = {
      mealIndicatorId: this.selectedIndicator()!.id,
      period: value.period,
      value: value.value,
      measurementDate: value.measurementDate,
      notes: value.notes || undefined,
      male: value.male ?? undefined,
      female: value.female ?? undefined,
    };
    this.mealPlanService.recordMeasurement(this.selectedIndicator()!.id, request).subscribe({
      next: () => {
        this.measurementSaving.set(false);
        this.showMeasurementForm.set(false);
        this.measurementForm.reset();
        this.notification.success('Measurement recorded successfully');
        this.loadMeasurements(this.selectedIndicator()!.id);
      },
      error: () => {
        this.measurementSaving.set(false);
        this.notification.error('Failed to record measurement');
      },
    });
  }

  onSubmitPlan(): void {
    this.store.dispatch(MealActions.submitPlan({ id: this.id() }));
  }

  onApprovePlan(): void {
    this.store.dispatch(MealActions.approvePlan({ id: this.id() }));
  }

  onRejectPlan(): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      this.store.dispatch(
        MealActions.rejectPlan({
          id: this.id(),
          request: { mealPlanId: this.id(), reason },
        })
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/meal']);
  }
}
