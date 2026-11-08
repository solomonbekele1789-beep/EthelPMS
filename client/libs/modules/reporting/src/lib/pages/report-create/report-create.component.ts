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
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProjectService, ProjectListItemDto } from '@ethelpms/modules/projects';
import { ReportActions } from '../../store/report.actions';
import { selectReportingLoading, selectReportTemplates } from '../../store/report.selectors';
import { CreateReportRequest, ReportType } from '../../models/report.model';

@Component({
  selector: 'ethel-report-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'reporting.create.title' | translate">
      <button mat-stroked-button (click)="onCancel()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <!-- SECTION 1: TARGET PROJECT -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">assignment</mat-icon>
            <mat-card-title>1. Target Project</mat-card-title>
            <mat-card-subtitle>Select the project this operational or incident report belongs to</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'reporting.fields.projectId' | translate }}</mat-label>
                <mat-select formControlName="projectId" (selectionChange)="onProjectSelected($event.value)">
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
                  <span class="info-label">Timeline:</span>
                  <span class="info-value">{{ proj.startDate | date:'mediumDate' }} – {{ proj.endDate | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Total Budget:</span>
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

        <!-- SECTION 2: REPORT TYPE & TEMPLATE -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">category</mat-icon>
            <mat-card-title>2. Report Classification & Template</mat-card-title>
            <mat-card-subtitle>Choose the reporting interval and optional standard template</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.fields.reportType' | translate }}</mat-label>
                <mat-select formControlName="reportType" (selectionChange)="onReportTypeChange($event.value)">
                  @for (type of reportTypes; track type) {
                    <mat-option [value]="type">{{ 'reporting.reportType.' + type | translate }}</mat-option>
                  }
                </mat-select>
                @if (form.controls.reportType.hasError('required')) {
                  <mat-error>Report type is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.fields.template' | translate }}</mat-label>
                <mat-select formControlName="reportTemplateId">
                  <mat-option [value]="''">-- None / Custom --</mat-option>
                  @for (template of filteredTemplates(); track template.id) {
                    <mat-option [value]="template.id">{{ template.name }}</mat-option>
                  }
                </mat-select>
                <mat-hint>Optional template structure</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'reporting.fields.title' | translate }}</mat-label>
                <input matInput formControlName="title" placeholder="e.g. FY2026 Q1 Progress Report" />
                @if (form.controls.title.hasError('required')) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- SECTION 3: REPORTING PERIOD & SCHEDULE -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">date_range</mat-icon>
            <mat-card-title>3. Period & Temporal Scope</mat-card-title>
            <mat-card-subtitle>Set the coverage dates and period identifiers</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.fields.periodStart' | translate }}</mat-label>
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="periodStart"
                  [min]="projectMinDate()"
                  [max]="projectMaxDate()" />
                <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                @if (form.controls.periodStart.hasError('required')) {
                  <mat-error>Period start is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.fields.periodEnd' | translate }}</mat-label>
                <input
                  matInput
                  [matDatepicker]="endPicker"
                  formControlName="periodEnd"
                  [min]="form.controls.periodStart.value || projectMinDate()"
                  [max]="projectMaxDate()" />
                <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                @if (form.controls.periodEnd.hasError('required')) {
                  <mat-error>Period end is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.fields.fiscalYear' | translate }}</mat-label>
                <input matInput formControlName="fiscalYear" type="number" (change)="onTemporalFieldChange()" />
              </mat-form-field>

              @if (form.controls.reportType.value === 'Quarterly' || form.controls.reportType.value === 'BiAnnual') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'reporting.fields.quarter' | translate }}</mat-label>
                  <mat-select formControlName="quarter" (selectionChange)="onTemporalFieldChange()">
                    <mat-option [value]="1">Quarter 1 (Jan - Mar)</mat-option>
                    <mat-option [value]="2">Quarter 2 (Apr - Jun)</mat-option>
                    <mat-option [value]="3">Quarter 3 (Jul - Sep)</mat-option>
                    <mat-option [value]="4">Quarter 4 (Oct - Dec)</mat-option>
                  </mat-select>
                  @if (form.controls.quarter.hasError('min') || form.controls.quarter.hasError('max')) {
                    <mat-error>Quarter must be between 1 and 4</mat-error>
                  }
                </mat-form-field>
              }

              @if (form.controls.reportType.value === 'Monthly') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'reporting.fields.month' | translate }}</mat-label>
                  <mat-select formControlName="month" (selectionChange)="onTemporalFieldChange()">
                    @for (m of months; track m.value) {
                      <mat-option [value]="m.value">{{ m.label }}</mat-option>
                    }
                  </mat-select>
                  @if (form.controls.month.hasError('min') || form.controls.month.hasError('max')) {
                    <mat-error>Month must be between 1 and 12</mat-error>
                  }
                </mat-form-field>
              }

              @if (form.controls.reportType.value === 'Weekly') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'reporting.fields.weekNumber' | translate }}</mat-label>
                  <input matInput formControlName="weekNumber" type="number" min="1" max="53" (change)="onTemporalFieldChange()" />
                  @if (form.controls.weekNumber.hasError('min') || form.controls.weekNumber.hasError('max')) {
                    <mat-error>Week must be between 1 and 53</mat-error>
                  }
                </mat-form-field>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- SECTION 4: BUDGET & FINANCIAL TARGET -->
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">attach_money</mat-icon>
            <mat-card-title>4. Planned Period Budget</mat-card-title>
            <mat-card-subtitle>Planned budget allocation for this reporting period (USD)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'reporting.fields.plannedBudget' | translate }} (USD)</mat-label>
                <input matInput formControlName="plannedBudget" type="number" min="0" step="100" />
                <span matTextPrefix>$&nbsp;</span>
                @if (form.controls.plannedBudget.hasError('required')) {
                  <mat-error>Planned budget is required</mat-error>
                } @else if (form.controls.plannedBudget.hasError('min')) {
                  <mat-error>Budget must be zero or greater</mat-error>
                }
                @if (selectedProject(); as proj) {
                  <mat-hint>Project Total Budget Ceiling: {{ proj.totalBudget | currency:'USD':'symbol':'1.0-0' }}</mat-hint>
                }
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'reporting.reports.create'">
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
    :host { display: block; padding-bottom: 3rem; }
    .form-container { max-width: 860px; margin: 0 auto; }
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class ReportCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  readonly loading = this.store.selectSignal(selectReportingLoading);
  readonly templates = this.store.selectSignal(selectReportTemplates);

  readonly reportTypes: ReportType[] = ['Activity', 'Weekly', 'Monthly', 'Quarterly', 'BiAnnual', 'Annual', 'Incident'];
  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly projects = signal<ProjectListItemDto[]>([]);
  readonly loadingProjects = signal<boolean>(false);

  readonly form = this.fb.group({
    title: ['', [Validators.required]],
    reportType: ['Quarterly' as ReportType, [Validators.required]],
    projectId: ['', [Validators.required]],
    reportTemplateId: [''],
    periodStart: [null as Date | string | null, [Validators.required]],
    periodEnd: [null as Date | string | null, [Validators.required]],
    fiscalYear: [new Date().getFullYear() as number | null],
    quarter: [1 as number | null, [Validators.min(1), Validators.max(4)]],
    month: [null as number | null, [Validators.min(1), Validators.max(12)]],
    weekNumber: [null as number | null, [Validators.min(1), Validators.max(53)]],
    plannedBudget: [0, [Validators.required, Validators.min(0)]],
  });

  readonly selectedProject = computed(() => {
    const pid = this.form.controls.projectId.value;
    return this.projects().find(p => p.id === pid) ?? null;
  });

  readonly projectMinDate = computed(() => {
    const p = this.selectedProject();
    return p?.startDate ? new Date(p.startDate) : null;
  });

  readonly projectMaxDate = computed(() => {
    const p = this.selectedProject();
    return p?.endDate ? new Date(p.endDate) : null;
  });

  readonly filteredTemplates = computed(() => {
    const currentType = this.form.controls.reportType.value;
    const all = this.templates();
    if (!currentType) return all;
    return all.filter(t => t.reportType === currentType);
  });

  ngOnInit(): void {
    this.store.dispatch(ReportActions.loadTemplates({}));
    this.loadProjects();
  }

  loadProjects(): void {
    this.loadingProjects.set(true);
    this.projectService.listProjects(1, 100).subscribe({
      next: (res) => {
        this.projects.set(res.items);
        this.loadingProjects.set(false);

        const queryPid = this.route.snapshot.queryParamMap.get('projectId');
        if (queryPid && res.items.some(p => p.id === queryPid)) {
          this.form.patchValue({ projectId: queryPid });
          this.onProjectSelected(queryPid);
        } else if (res.items.length > 0 && !this.form.controls.projectId.value) {
          const first = res.items[0];
          this.form.patchValue({ projectId: first.id });
          this.onProjectSelected(first.id);
        }
      },
      error: () => this.loadingProjects.set(false),
    });
  }

  onProjectSelected(projectId: string): void {
    this.autoGeneratePeriodAndTitle();
  }

  onReportTypeChange(type: ReportType): void {
    // Clear template selection if incompatible
    const currentTemplateId = this.form.controls.reportTemplateId.value;
    if (currentTemplateId) {
      const match = this.templates().find(t => t.id === currentTemplateId && t.reportType === type);
      if (!match) {
        this.form.patchValue({ reportTemplateId: '' });
      }
    }
    this.autoGeneratePeriodAndTitle();
  }

  onTemporalFieldChange(): void {
    this.autoGeneratePeriodAndTitle();
  }

  autoGeneratePeriodAndTitle(): void {
    const type = this.form.controls.reportType.value;
    const proj = this.selectedProject();
    const projCode = proj ? `[${proj.code}] ` : '';
    const now = new Date();
    const currentYear = this.form.controls.fiscalYear.value || now.getFullYear();

    let startDate: Date;
    let endDate: Date;
    let title = '';

    if (type === 'Annual') {
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
      title = `${projCode}FY${currentYear} Annual Progress Report`;
    } else if (type === 'BiAnnual') {
      const q = this.form.controls.quarter.value ?? 1;
      const isH1 = q <= 2;
      startDate = new Date(currentYear, isH1 ? 0 : 6, 1);
      endDate = new Date(currentYear, isH1 ? 5 : 11, isH1 ? 30 : 31);
      title = `${projCode}FY${currentYear} ${isH1 ? 'H1' : 'H2'} Bi-Annual Progress Report`;
    } else if (type === 'Quarterly') {
      const q = this.form.controls.quarter.value ?? 1;
      const startMonth = (q - 1) * 3;
      startDate = new Date(currentYear, startMonth, 1);
      endDate = new Date(currentYear, startMonth + 3, 0); // Last day of quarter
      title = `${projCode}FY${currentYear} Q${q} Progress Report`;
    } else if (type === 'Monthly') {
      const m = (this.form.controls.month.value ?? (now.getMonth() + 1)) - 1;
      startDate = new Date(currentYear, m, 1);
      endDate = new Date(currentYear, m + 1, 0); // Last day of month
      const monthName = this.months.find(item => item.value === m + 1)?.label ?? '';
      title = `${projCode}${monthName} ${currentYear} Monthly Report`;
    } else if (type === 'Weekly') {
      const week = this.form.controls.weekNumber.value ?? 1;
      // Approximate 7-day span from start of year
      startDate = new Date(currentYear, 0, 1 + (week - 1) * 7);
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      title = `${projCode}FY${currentYear} Week ${week} Report`;
    } else if (type === 'Incident') {
      startDate = new Date();
      endDate = new Date();
      title = `${projCode}Incident Report - ${new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd')}`;
    } else {
      // Activity or Custom
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      title = `${projCode}Activity Report`;
    }

    const currentTitle = this.form.controls.title.value;
    // Auto-update title if empty or previously auto-generated
    if (!currentTitle || currentTitle.includes('Report')) {
      this.form.patchValue({
        title,
        periodStart: startDate,
        periodEnd: endDate,
      });
    } else {
      this.form.patchValue({
        periodStart: startDate,
        periodEnd: endDate,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    const start = value.periodStart instanceof Date
      ? value.periodStart.toISOString().split('T')[0]
      : (value.periodStart ? new Date(value.periodStart).toISOString().split('T')[0] : '');

    const end = value.periodEnd instanceof Date
      ? value.periodEnd.toISOString().split('T')[0]
      : (value.periodEnd ? new Date(value.periodEnd).toISOString().split('T')[0] : '');

    const request: CreateReportRequest = {
      title: value.title || '',
      reportType: value.reportType as ReportType,
      projectId: value.projectId || '',
      periodStart: start,
      periodEnd: end,
      reportTemplateId: value.reportTemplateId || undefined,
      fiscalYear: value.fiscalYear ?? undefined,
      quarter: value.quarter ?? undefined,
      month: value.month ?? undefined,
      weekNumber: value.weekNumber ?? undefined,
      plannedBudget: value.plannedBudget ?? 0,
    };
    this.store.dispatch(ReportActions.createReport({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/reporting']);
  }
}
