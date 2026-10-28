import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectSelectedReport, selectPartnershipsLoading } from '../../store/partnerships.selectors';
import { PartnerReportService } from '../../services/partner-report.service';
import { SubmitPartnerReportRequest, ReviewPartnerReportRequest, ReportStatus } from '../../models/partner-report.model';

@Component({
  selector: 'ethel-report-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="report()?.title ?? ('partnerships.reports.detail' | translate)">
      <button mat-stroked-button (click)="onBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'partnerships.reports.title' | translate }}
      </button>
    </app-page-header>

    @if (loading() && !report()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (report()) {
      <div class="detail-container">
        <div class="detail-grid">
          <mat-card>
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.reportType' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ report()!.reportType }}</mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.status' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>
              <app-status-badge [status]="report()!.status" [label]="report()!.status"></app-status-badge>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.reportingPeriodStart' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ report()!.reportingPeriodStart | date:'mediumDate' }}</mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.reportingPeriodEnd' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ report()!.reportingPeriodEnd | date:'mediumDate' }}</mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.submittedAt' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ report()!.submittedAt ? (report()!.submittedAt | date:'medium') : '-' }}</mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.reviewedAt' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ report()!.reviewedAt ? (report()!.reviewedAt | date:'medium') : '-' }}</mat-card-content>
          </mat-card>
        </div>

        @if (report()!.narrative) {
          <mat-card class="narrative-card">
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.narrative' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ report()!.narrative }}</mat-card-content>
          </mat-card>
        }

        @if (report()!.reviewComments) {
          <mat-card class="narrative-card">
            <mat-card-header><mat-card-title>{{ 'partnerships.fields.reviewComments' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>{{ report()!.reviewComments }}</mat-card-content>
          </mat-card>
        }

        <!-- Submit Action (Draft reports) -->
        @if (report()!.status === 'Draft') {
          <div class="action-section" *appHasPermission="'partnerships.reports.update'">
            <h3>{{ 'partnerships.reports.submit' | translate }}</h3>
            <form [formGroup]="submitForm" (ngSubmit)="onSubmit()" class="edit-form">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'partnerships.fields.narrative' | translate }}</mat-label>
                  <textarea matInput formControlName="narrative" rows="4"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'partnerships.fields.financialSummaryJson' | translate }}</mat-label>
                  <textarea matInput formControlName="financialSummaryJson" rows="4"></textarea>
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
                  @if (submitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ 'partnerships.actions.submit' | translate }}
                  }
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Review Action (Submitted reports) -->
        @if (report()!.status === 'Submitted' || report()!.status === 'UnderReview') {
          <div class="action-section" *appHasPermission="'partnerships.reports.update'">
            <h3>{{ 'partnerships.reports.review' | translate }}</h3>
            <form [formGroup]="reviewForm" (ngSubmit)="onReview()" class="edit-form">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'partnerships.fields.status' | translate }}</mat-label>
                  <mat-select formControlName="status">
                    @for (s of reviewStatuses; track s) {
                      <mat-option [value]="s">{{ s }}</mat-option>
                    }
                  </mat-select>
                  @if (reviewForm.controls.status.hasError('required')) {
                    <mat-error>Status is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'partnerships.fields.reviewComments' | translate }}</mat-label>
                  <textarea matInput formControlName="reviewComments" rows="3"></textarea>
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="reviewForm.invalid || reviewing()">
                  @if (reviewing()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ 'partnerships.actions.review' | translate }}
                  }
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    } @else {
      <app-empty-state
        icon="description"
        title="Report not found"
        message="The requested report could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
    .narrative-card { margin-bottom: 0; }
    .action-section {
      border-top: 1px solid rgba(0,0,0,.12);
      padding-top: 1.5rem;
    }
    .action-section h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .edit-form { margin-bottom: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `,
})
export default class ReportDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(PartnerReportService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly report = this.store.selectSignal(selectSelectedReport);
  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  readonly submitting = signal(false);
  readonly reviewing = signal(false);

  readonly reviewStatuses: ReportStatus[] = ['Approved', 'Rejected', 'RevisionRequested'];

  readonly submitForm = this.fb.nonNullable.group({
    narrative: [''],
    financialSummaryJson: [''],
  });

  readonly reviewForm = this.fb.nonNullable.group({
    status: ['', [Validators.required]],
    reviewComments: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(PartnershipsActions.loadReport({ id: this.id() }));
  }

  onSubmit(): void {
    const value = this.submitForm.getRawValue();
    const request: SubmitPartnerReportRequest = {
      id: this.id(),
      narrative: value.narrative || undefined,
      financialSummaryJson: value.financialSummaryJson || undefined,
    };
    this.submitting.set(true);
    this.reportService.submit(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Report submitted successfully');
        this.submitting.set(false);
        this.store.dispatch(PartnershipsActions.loadReport({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to submit report');
        this.submitting.set(false);
      },
    });
  }

  onReview(): void {
    if (this.reviewForm.invalid) return;
    const value = this.reviewForm.getRawValue();
    const request: ReviewPartnerReportRequest = {
      id: this.id(),
      status: value.status as ReportStatus,
      reviewComments: value.reviewComments || undefined,
    };
    this.reviewing.set(true);
    this.reportService.review(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Report reviewed successfully');
        this.reviewing.set(false);
        this.store.dispatch(PartnershipsActions.loadReport({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to review report');
        this.reviewing.set(false);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/partnerships/reports']);
  }
}
