import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ReportActions } from '../../store/report.actions';
import { selectReportTemplates, selectReportingLoading } from '../../store/report.selectors';
import { ReportType } from '../../models/report.model';
import { ReportTemplateDto } from '../../models/report-template.model';

@Component({
  selector: 'ethel-report-template-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'reporting.templates.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'reporting.reports.create'" (click)="onCreateTemplate()">
        <mat-icon>add</mat-icon>
        {{ 'reporting.templates.create' | translate }}
      </button>
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <div class="filter-chips">
      <mat-chip-set>
        <mat-chip
          [highlighted]="!typeFilter()"
          (click)="onTypeFilter(undefined)">
          {{ 'common.all' | translate }}
        </mat-chip>
        @for (type of reportTypes; track type) {
          <mat-chip
            [highlighted]="typeFilter() === type"
            (click)="onTypeFilter(type)">
            {{ 'reporting.reportType.' + type | translate }}
          </mat-chip>
        }
      </mat-chip-set>
    </div>

    @if (filteredTemplates().length > 0) {
      <div class="template-grid">
        @for (template of filteredTemplates(); track template.id) {
          <mat-card class="template-card" (click)="onTemplateClick(template)">
            <mat-card-header>
              <mat-card-title>{{ template.name }}</mat-card-title>
              <mat-card-subtitle>{{ 'reporting.reportType.' + template.reportType | translate }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (template.description) {
                <p class="template-description">{{ template.description }}</p>
              }
              <div class="template-meta">
                <div class="meta-item">
                  <span class="meta-label">{{ 'reporting.templates.approvalLevels' | translate }}:</span>
                  <span>{{ template.requiredApprovalLevels }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">{{ 'reporting.templates.deadlineDays' | translate }}:</span>
                  <span>{{ template.submissionDeadlineDays }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">{{ 'reporting.templates.active' | translate }}:</span>
                  <app-status-badge
                    [status]="template.isActive ? 'Active' : 'Inactive'"
                    [label]="template.isActive ? 'Active' : 'Inactive'">
                  </app-status-badge>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    } @else {
      <app-empty-state
        icon="description"
        title="No templates found"
        message="Create a report template to get started.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }
    .template-card { cursor: pointer; }
    .template-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    .template-description {
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 1rem;
    }
    .template-meta { display: flex; flex-direction: column; gap: 0.5rem; }
    .meta-item { display: flex; align-items: center; gap: 0.5rem; }
    .meta-label { font-weight: 500; }
  `,
})
export default class ReportTemplateListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly templates = this.store.selectSignal(selectReportTemplates);
  readonly loading = this.store.selectSignal(selectReportingLoading);

  readonly typeFilter = signal<ReportType | undefined>(undefined);

  readonly reportTypes: ReportType[] = ['Activity', 'Weekly', 'Monthly', 'Quarterly', 'BiAnnual', 'Annual', 'Incident'];

  readonly filteredTemplates = computed(() => {
    const templates = this.templates();
    const type = this.typeFilter();
    if (!type) return templates;
    return templates.filter(t => t.reportType === type);
  });

  ngOnInit(): void {
    this.store.dispatch(ReportActions.loadTemplates({}));
  }

  onTypeFilter(type: ReportType | undefined): void {
    this.typeFilter.set(type);
  }

  onTemplateClick(template: ReportTemplateDto): void {
    this.router.navigate(['/reporting/templates', template.id]);
  }

  onCreateTemplate(): void {
    this.router.navigate(['/reporting/templates', 'new']);
  }

  goBack(): void {
    this.router.navigate(['/reporting']);
  }
}
