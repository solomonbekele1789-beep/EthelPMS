import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { ProjectService, ProjectListItemDto } from '@ethelpms/modules/projects';
import { FinancialSummaryDto } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'ethel-financial-summary',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DecimalPipe,
    DatePipe,
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
          <mat-form-field appearance="outline" class="project-select-field">
            <mat-label>{{ 'reporting.fields.projectId' | translate }}</mat-label>
            <mat-select formControlName="projectId" (selectionChange)="onLoad()">
              @for (project of projects(); track project.id) {
                <mat-option [value]="project.id">
                  [{{ project.code }}] {{ project.name }}
                </mat-option>
              }
            </mat-select>
            @if (loadingProjects()) {
              <mat-hint>Loading projects...</mat-hint>
            }
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project selection is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="year-field">
            <mat-label>{{ 'reporting.fields.fiscalYear' | translate }}</mat-label>
            <input matInput formControlName="fiscalYear" type="number" placeholder="All Years" />
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

      @if (selectedProject(); as proj) {
        <div class="project-info-banner">
          <div class="info-item">
            <span class="info-label">Project Code</span>
            <span class="info-value font-mono">{{ proj.code }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Project Name</span>
            <span class="info-value">{{ proj.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Timeline</span>
            <span class="info-value">{{ proj.startDate | date:'mediumDate' }} – {{ proj.endDate | date:'mediumDate' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Overall Project Budget</span>
            <span class="info-value font-bold text-success">{{ proj.totalBudget | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
        </div>
      }
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
    .project-select-field { min-width: 320px; flex: 1; }
    .year-field { width: 140px; }
    .project-info-banner {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.875rem 1rem;
      margin-top: 1rem;
    }
    .info-item { display: flex; flex-direction: column; gap: 0.2rem; }
    .info-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .info-value { font-size: 0.925rem; color: #1e293b; font-weight: 500; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-success { color: #16a34a; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
export default class FinancialSummaryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly projectService = inject(ProjectService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly loadingProjects = signal(false);
  readonly projects = signal<ProjectListItemDto[]>([]);
  readonly summary = signal<FinancialSummaryDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    projectId: ['', [Validators.required]],
    fiscalYear: [null as number | null],
  });

  readonly selectedProject = computed(() => {
    const pid = this.form.controls.projectId.value;
    return this.projects().find(p => p.id === pid) ?? null;
  });

  ngOnInit(): void {
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
          this.onLoad();
        } else if (res.items.length > 0) {
          this.form.patchValue({ projectId: res.items[0].id });
          this.onLoad();
        }
      },
      error: () => this.loadingProjects.set(false),
    });
  }

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
