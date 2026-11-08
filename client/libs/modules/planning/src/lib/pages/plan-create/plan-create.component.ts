import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { PlanActions } from '../../store/plan.actions';
import { selectPlanningLoading } from '../../store/plan.selectors';
import { CreatePlanEntryRequest, PlanLevel, PlanEntryListItemDto } from '../../models/plan.model';
import { PlanService } from '../../services/plan.service';
import { ProjectService, ProjectListItemDto } from '@ethelpms/modules/projects';

@Component({
  selector: 'ethel-plan-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="'planning.create.title' | translate">
      <button mat-stroked-button (click)="onCancel()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- SECTION 1: PROJECT SELECTION & CONTEXT -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">assignment</mat-icon>
            <mat-card-title>1. Target Project</mat-card-title>
            <mat-card-subtitle>Select the project for this operational workplan</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'planning.fields.projectId' | translate }}</mat-label>
                <mat-select formControlName="projectId" (selectionChange)="onProjectChange($event.value)">
                  @for (project of projects(); track project.id) {
                    <mat-option [value]="project.id">
                      [{{ project.code }}] {{ project.name }}
                    </mat-option>
                  }
                </mat-select>
                @if (loadingProjects()) {
                  <mat-hint>Loading active projects...</mat-hint>
                }
                @if (form.controls.projectId.hasError('required')) {
                  <mat-error>Please select a project</mat-error>
                }
              </mat-form-field>
            </div>

            @if (selectedProject(); as proj) {
              <div class="project-info-banner">
                <div class="info-item">
                  <span class="info-label">Project Code:</span>
                  <span class="info-value font-mono">{{ proj.code }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Project Timeline:</span>
                  <span class="info-value">{{ proj.startDate | date:'mediumDate' }} – {{ proj.endDate | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Total Project Budget:</span>
                  <span class="info-value font-bold text-success">{{ proj.totalBudget | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Direct Beneficiaries:</span>
                  <span class="info-value">{{ proj.totalDirectBeneficiaries | number }}</span>
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- SECTION 2: HIERARCHY LEVEL & PARENT PLAN -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">account_tree</mat-icon>
            <mat-card-title>2. Plan Hierarchy & Parent</mat-card-title>
            <mat-card-subtitle>Configure the operational level and cascading parent</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'planning.fields.level' | translate }}</mat-label>
                <mat-select formControlName="level" (selectionChange)="onLevelChange($event.value)">
                  @for (level of planLevels; track level) {
                    <mat-option [value]="level">{{ level }}</mat-option>
                  }
                </mat-select>
                @if (form.controls.level.hasError('required')) {
                  <mat-error>Level is required</mat-error>
                }
                <mat-hint>{{ levelDescription() }}</mat-hint>
              </mat-form-field>

              @if (form.controls.level.value === 'Annual') {
                <div class="parent-info-pill">
                  <mat-icon>info</mat-icon>
                  <div>
                    <strong>Top-Level Root Plan</strong>
                    <p>Annual plans sit at the highest level of the operational hierarchy with no parent.</p>
                  </div>
                </div>
              } @else {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'planning.fields.parentId' | translate }} ({{ expectedParentLevel() }} Parent)</mat-label>
                  <mat-select formControlName="parentId" (selectionChange)="onParentChange($event.value)">
                    <mat-option [value]="null">-- Select {{ expectedParentLevel() }} Plan --</mat-option>
                    @for (parent of availableParentPlans(); track parent.id) {
                      <mat-option [value]="parent.id">
                        [{{ parent.level }}] {{ parent.title }} ({{ parent.plannedBudget | currency:'USD':'symbol':'1.0-0' }})
                      </mat-option>
                    }
                  </mat-select>
                  @if (loadingPlans()) {
                    <mat-hint>Loading project plans...</mat-hint>
                  } @else if (availableParentPlans().length === 0 && form.controls.projectId.value) {
                    <mat-hint class="text-warn">No {{ expectedParentLevel() }} plans exist yet for this project. Create an {{ expectedParentLevel() }} plan first.</mat-hint>
                  }
                </mat-form-field>
              }
            </div>

            @if (selectedParentPlan(); as parent) {
              <div class="parent-info-banner">
                <div class="banner-title">
                  <mat-icon>link</mat-icon>
                  Parent Plan: <strong>{{ parent.title }}</strong> ({{ parent.level }})
                </div>
                <div class="banner-details">
                  <span>Allowed Window: <strong>{{ parent.plannedStartDate | date:'mediumDate' }}</strong> to <strong>{{ parent.plannedEndDate | date:'mediumDate' }}</strong></span>
                  <span>Parent Budget Ceiling: <strong>{{ parent.plannedBudget | currency:'USD':'symbol':'1.0-0' }}</strong></span>
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- SECTION 3: PERIOD DESIGNATORS & TIMELINE -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">date_range</mat-icon>
            <mat-card-title>3. Period Designator & Schedule</mat-card-title>
            <mat-card-subtitle>Set the time-bound period and execution dates</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <!-- Fiscal Year: Shown for Annual, Quarterly, Monthly, Weekly -->
              @if (form.controls.level.value !== 'Daily') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'planning.fields.fiscalYear' | translate }}</mat-label>
                  <mat-select formControlName="fiscalYear" (selectionChange)="onPeriodChange()">
                    @for (year of fiscalYears; track year) {
                      <mat-option [value]="year">{{ year }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }

              <!-- Quarter: Shown only for Quarterly -->
              @if (form.controls.level.value === 'Quarterly') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'planning.fields.quarter' | translate }}</mat-label>
                  <mat-select formControlName="quarter" (selectionChange)="onPeriodChange()">
                    @for (q of quarters; track q.value) {
                      <mat-option [value]="q.value">{{ q.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }

              <!-- Month: Shown only for Monthly -->
              @if (form.controls.level.value === 'Monthly') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'planning.fields.month' | translate }}</mat-label>
                  <mat-select formControlName="month" (selectionChange)="onPeriodChange()">
                    @for (m of months; track m.value) {
                      <mat-option [value]="m.value">{{ m.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }

              <!-- Week Number: Shown only for Weekly -->
              @if (form.controls.level.value === 'Weekly') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'planning.fields.weekNumber' | translate }} (1 - 52)</mat-label>
                  <input matInput type="number" formControlName="weekNumber" min="1" max="52" (input)="onPeriodChange()" />
                </mat-form-field>
              }

              <!-- Day Date: Shown only for Daily -->
              @if (form.controls.level.value === 'Daily') {
                <mat-form-field appearance="outline">
                  <mat-label>Plan Day</mat-label>
                  <input matInput [matDatepicker]="dayPicker" formControlName="dayDate" (dateChange)="onDayDateChange($event.value)" />
                  <mat-datepicker-toggle matIconSuffix [for]="dayPicker"></mat-datepicker-toggle>
                  <mat-datepicker #dayPicker></mat-datepicker>
                </mat-form-field>
              }

              <!-- Planned Start Date -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'planning.fields.plannedStartDate' | translate }}</mat-label>
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="plannedStartDate"
                  [min]="minAllowedDate()"
                  [max]="maxAllowedDate()" />
                <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                @if (form.controls.plannedStartDate.hasError('required')) {
                  <mat-error>Start date is required</mat-error>
                }
              </mat-form-field>

              <!-- Planned End Date -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'planning.fields.plannedEndDate' | translate }}</mat-label>
                <input
                  matInput
                  [matDatepicker]="endPicker"
                  formControlName="plannedEndDate"
                  [min]="form.controls.plannedStartDate.value || minAllowedDate()"
                  [max]="maxAllowedDate()" />
                <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                @if (form.controls.plannedEndDate.hasError('required')) {
                  <mat-error>End date is required</mat-error>
                }
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- SECTION 4: GENERAL DETAILS & BUDGET -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">edit_note</mat-icon>
            <mat-card-title>4. Plan Details & Budget</mat-card-title>
            <mat-card-subtitle>Define the title, scope description, and planned budget</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'planning.fields.title' | translate }}</mat-label>
                <input matInput formControlName="title" placeholder="e.g. FY2026 Annual Operational Plan" />
                @if (form.controls.title.hasError('required')) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'planning.fields.description' | translate }}</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Provide background, objectives, and scope..."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'planning.fields.plannedBudget' | translate }} (USD)</mat-label>
                <input matInput formControlName="plannedBudget" type="number" min="0" step="100" />
                <span matTextPrefix>$&nbsp;</span>
                @if (form.controls.plannedBudget.hasError('required')) {
                  <mat-error>Budget is required</mat-error>
                } @else if (form.controls.plannedBudget.hasError('min')) {
                  <mat-error>Budget cannot be negative</mat-error>
                }
                @if (selectedParentPlan(); as parent) {
                  <mat-hint>Parent Plan Budget Ceiling: {{ parent.plannedBudget | currency:'USD':'symbol':'1.0-0' }}</mat-hint>
                } @else if (selectedProject(); as proj) {
                  <mat-hint>Overall Project Budget Ceiling: {{ proj.totalBudget | currency:'USD':'symbol':'1.0-0' }}</mat-hint>
                }
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- SECTION 5: BENEFICIARY TARGETS -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">groups</mat-icon>
            <mat-card-title>5. Beneficiary Targets</mat-card-title>
            <mat-card-subtitle>Disaggregate target direct participants for this planning period</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Target Male Beneficiaries</mat-label>
                <input matInput formControlName="beneficiariesMale" type="number" min="0" />
                <mat-icon matPrefix>man</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Target Female Beneficiaries</mat-label>
                <input matInput formControlName="beneficiariesFemale" type="number" min="0" />
                <mat-icon matPrefix>woman</mat-icon>
              </mat-form-field>
            </div>

            <div class="beneficiary-summary">
              <mat-icon color="primary">people</mat-icon>
              <span>Total Targeted Direct Beneficiaries:</span>
              <span class="total-badge">{{ totalBeneficiaries() | number }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- FORM ACTIONS -->
        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>check</mat-icon>
              {{ 'common.create' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; padding-bottom: 3rem; }
    .form-container { max-width: 900px; margin: 0 auto; }
    .form-section-card {
      margin-bottom: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem 1.5rem;
      margin-top: 1rem;
    }
    .full-width { grid-column: 1 / -1; }
    .project-info-banner {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.875rem 1rem;
      margin-top: 0.75rem;
    }
    .info-item { display: flex; flex-direction: column; gap: 0.2rem; }
    .info-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .info-value { font-size: 0.925rem; color: #1e293b; font-weight: 500; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-success { color: #16a34a; }
    .text-warn { color: #d97706; }
    .parent-info-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #1e40af;
      mat-icon { color: #2563eb; }
      p { margin: 0; font-size: 0.8rem; color: #3b82f6; }
      strong { font-size: 0.875rem; }
    }
    .parent-info-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-top: 0.75rem;
      .banner-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #166534;
        margin-bottom: 0.25rem;
        mat-icon { font-size: 18px; height: 18px; width: 18px; }
      }
      .banner-details {
        display: flex;
        gap: 2rem;
        font-size: 0.8rem;
        color: #15803d;
      }
    }
    .beneficiary-summary {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fdf4ff;
      border: 1px solid #f5d0fe;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-top: 0.75rem;
      font-size: 0.9rem;
      color: #86198f;
      .total-badge {
        font-weight: 700;
        font-size: 1.1rem;
        color: #a21caf;
        background: #fae8ff;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
      }
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class PlanCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly planService = inject(PlanService);

  readonly loading = this.store.selectSignal(selectPlanningLoading);

  readonly planLevels: PlanLevel[] = ['Annual', 'Quarterly', 'Monthly', 'Weekly', 'Daily'];
  readonly fiscalYears: number[] = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  readonly quarters = [
    { value: 1, label: 'Q1 (Jan 1 - Mar 31)' },
    { value: 2, label: 'Q2 (Apr 1 - Jun 30)' },
    { value: 3, label: 'Q3 (Jul 1 - Sep 30)' },
    { value: 4, label: 'Q4 (Oct 1 - Dec 31)' },
  ];
  readonly months = [
    { value: 1, label: '1 - January' },
    { value: 2, label: '2 - February' },
    { value: 3, label: '3 - March' },
    { value: 4, label: '4 - April' },
    { value: 5, label: '5 - May' },
    { value: 6, label: '6 - June' },
    { value: 7, label: '7 - July' },
    { value: 8, label: '8 - August' },
    { value: 9, label: '9 - September' },
    { value: 10, label: '10 - October' },
    { value: 11, label: '11 - November' },
    { value: 12, label: '12 - December' },
  ];

  readonly projects = signal<ProjectListItemDto[]>([]);
  readonly loadingProjects = signal<boolean>(false);
  readonly projectPlans = signal<PlanEntryListItemDto[]>([]);
  readonly loadingPlans = signal<boolean>(false);

  readonly form = this.fb.group({
    level: ['Annual' as PlanLevel, [Validators.required]],
    projectId: ['', [Validators.required]],
    parentId: [null as string | null],
    title: ['', [Validators.required]],
    description: [''],
    plannedStartDate: [null as Date | string | null, [Validators.required]],
    plannedEndDate: [null as Date | string | null, [Validators.required]],
    plannedBudget: [0, [Validators.required, Validators.min(0)]],
    fiscalYear: [new Date().getFullYear() as number | null],
    quarter: [null as number | null],
    month: [null as number | null],
    weekNumber: [null as number | null],
    dayDate: [null as Date | string | null],
    beneficiariesMale: [0, [Validators.min(0)]],
    beneficiariesFemale: [0, [Validators.min(0)]],
  });

  readonly selectedProject = computed(() => {
    const pid = this.form.controls.projectId.value;
    return this.projects().find(p => p.id === pid) ?? null;
  });

  readonly availableParentPlans = computed(() => {
    const level = this.form.controls.level.value;
    const plans = this.projectPlans();
    if (level === 'Quarterly') return plans.filter(p => p.level === 'Annual');
    if (level === 'Monthly') return plans.filter(p => p.level === 'Quarterly');
    if (level === 'Weekly') return plans.filter(p => p.level === 'Monthly');
    if (level === 'Daily') return plans.filter(p => p.level === 'Weekly');
    return [];
  });

  readonly selectedParentPlan = computed(() => {
    const parentId = this.form.controls.parentId.value;
    if (!parentId) return null;
    return this.projectPlans().find(p => p.id === parentId) ?? null;
  });

  readonly expectedParentLevel = computed(() => {
    const level = this.form.controls.level.value;
    if (level === 'Quarterly') return 'Annual';
    if (level === 'Monthly') return 'Quarterly';
    if (level === 'Weekly') return 'Monthly';
    if (level === 'Daily') return 'Weekly';
    return 'None';
  });

  readonly levelDescription = computed(() => {
    const level = this.form.controls.level.value;
    switch (level) {
      case 'Annual': return 'Overarching annual workplan covering the fiscal year.';
      case 'Quarterly': return 'Quarterly milestone cycle nested inside an Annual Plan.';
      case 'Monthly': return 'Monthly execution schedule nested inside a Quarter.';
      case 'Weekly': return 'Weekly sprint breakdown nested inside a Month.';
      case 'Daily': return 'Day-by-day action schedule nested inside a Week.';
      default: return '';
    }
  });

  readonly minAllowedDate = computed(() => {
    const parent = this.selectedParentPlan();
    if (parent) return new Date(parent.plannedStartDate);
    const proj = this.selectedProject();
    if (proj) return new Date(proj.startDate);
    return null;
  });

  readonly maxAllowedDate = computed(() => {
    const parent = this.selectedParentPlan();
    if (parent) return new Date(parent.plannedEndDate);
    const proj = this.selectedProject();
    if (proj) return new Date(proj.endDate);
    return null;
  });

  readonly totalBeneficiaries = computed(() => {
    const m = this.form.controls.beneficiariesMale.value ?? 0;
    const f = this.form.controls.beneficiariesFemale.value ?? 0;
    return (m || 0) + (f || 0);
  });

  ngOnInit(): void {
    this.loadProjects();

    const queryPid = this.route.snapshot.queryParamMap.get('projectId');
    if (queryPid) {
      this.form.patchValue({ projectId: queryPid });
      this.loadProjectPlans(queryPid);
    }
  }

  loadProjects(): void {
    this.loadingProjects.set(true);
    this.projectService.listProjects(1, 100).subscribe({
      next: (res) => {
        this.projects.set(res.items);
        this.loadingProjects.set(false);
        // If a project is already selected, suggest a default title
        this.suggestTitleAndDates();
      },
      error: () => this.loadingProjects.set(false),
    });
  }

  loadProjectPlans(projectId: string): void {
    if (!projectId) {
      this.projectPlans.set([]);
      return;
    }
    this.loadingPlans.set(true);
    this.planService.listPlans({ projectId, page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        this.projectPlans.set(res.items);
        this.loadingPlans.set(false);
      },
      error: () => this.loadingPlans.set(false),
    });
  }

  onProjectChange(projectId: string): void {
    this.form.patchValue({ parentId: null });
    this.loadProjectPlans(projectId);
    this.suggestTitleAndDates();
  }

  onLevelChange(level: PlanLevel): void {
    this.form.patchValue({
      parentId: null,
      quarter: null,
      month: null,
      weekNumber: null,
      dayDate: null,
    });
    this.suggestTitleAndDates();
  }

  onParentChange(parentId: string | null): void {
    if (parentId) {
      const parent = this.projectPlans().find(p => p.id === parentId);
      if (parent) {
        if (parent.fiscalYear && !this.form.controls.fiscalYear.value) {
          this.form.patchValue({ fiscalYear: parent.fiscalYear });
        }
      }
    }
    this.suggestTitleAndDates();
  }

  onPeriodChange(): void {
    this.suggestTitleAndDates();
  }

  onDayDateChange(date: Date | string | null): void {
    if (date) {
      const d = new Date(date);
      this.form.patchValue({
        plannedStartDate: d,
        plannedEndDate: d,
      });
      const dateStr = d.toISOString().split('T')[0];
      const proj = this.selectedProject();
      this.form.patchValue({
        title: `Daily Plan - ${dateStr}${proj ? ' (' + proj.code + ')' : ''}`,
      });
    }
  }

  private suggestTitleAndDates(): void {
    const level = this.form.controls.level.value;
    const year = this.form.controls.fiscalYear.value ?? new Date().getFullYear();
    const proj = this.selectedProject();
    const projSuffix = proj ? ` - ${proj.code}` : '';

    if (level === 'Annual') {
      this.form.patchValue({
        plannedStartDate: new Date(year, 0, 1),
        plannedEndDate: new Date(year, 11, 31),
        title: `FY${year} Annual Operational Plan${projSuffix}`,
      });
    } else if (level === 'Quarterly') {
      const q = this.form.controls.quarter.value ?? 1;
      const startMonth = (q - 1) * 3;
      const endMonth = startMonth + 2;
      const lastDay = new Date(year, endMonth + 1, 0).getDate();
      this.form.patchValue({
        plannedStartDate: new Date(year, startMonth, 1),
        plannedEndDate: new Date(year, endMonth, lastDay),
        title: `FY${year} Q${q} Workplan${projSuffix}`,
      });
    } else if (level === 'Monthly') {
      const m = this.form.controls.month.value ?? 1;
      const monthIdx = m - 1;
      const lastDay = new Date(year, monthIdx + 1, 0).getDate();
      const monthName = this.months.find(item => item.value === m)?.label.split(' - ')[1] ?? `Month ${m}`;
      this.form.patchValue({
        plannedStartDate: new Date(year, monthIdx, 1),
        plannedEndDate: new Date(year, monthIdx, lastDay),
        title: `${monthName} ${year} Plan${projSuffix}`,
      });
    } else if (level === 'Weekly') {
      const w = this.form.controls.weekNumber.value ?? 1;
      this.form.patchValue({
        title: `Week ${w}, ${year} Plan${projSuffix}`,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();

    const formatDate = (d: any): string => {
      if (!d) return '';
      const dt = new Date(d);
      return dt.toISOString();
    };

    const request: CreatePlanEntryRequest = {
      level: val.level as PlanLevel,
      projectId: val.projectId!,
      parentId: val.parentId || undefined,
      title: val.title!,
      description: val.description || undefined,
      plannedStartDate: formatDate(val.plannedStartDate),
      plannedEndDate: formatDate(val.plannedEndDate),
      plannedBudget: Number(val.plannedBudget) || 0,
      fiscalYear: val.fiscalYear ?? undefined,
      quarter: val.quarter ?? undefined,
      month: val.month ?? undefined,
      weekNumber: val.weekNumber ?? undefined,
      dayDate: val.dayDate ? formatDate(val.dayDate) : undefined,
      beneficiariesMale: Number(val.beneficiariesMale) || 0,
      beneficiariesFemale: Number(val.beneficiariesFemale) || 0,
    };

    this.store.dispatch(PlanActions.createPlan({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/planning']);
  }
}
