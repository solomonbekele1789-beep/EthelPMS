import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectComplianceChecks, selectPartnershipsLoading } from '../../store/partnerships.selectors';
import { ComplianceService } from '../../services/compliance.service';
import { ComplianceStatus, CompleteComplianceCheckRequest, RequireFollowUpRequest } from '../../models/compliance.model';

@Component({
  selector: 'ethel-compliance-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'partnerships.compliance.title' | translate">
      <button mat-stroked-button (click)="onBackToPartners()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'partnerships.partners.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <app-data-table
        [columns]="columns()"
        [data]="complianceChecks()"
        [loading]="loading()"
        emptyTitle="No compliance checks found"
        emptyMessage="Compliance checks will appear here once scheduled.">
      </app-data-table>
    </div>

    <!-- Complete Dialog -->
    @if (completingId()) {
      <div class="inline-form-overlay">
        <div class="inline-form-card">
          <h3>{{ 'partnerships.compliance.complete' | translate }}</h3>
          <form [formGroup]="completeForm" (ngSubmit)="onSubmitComplete()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'partnerships.fields.score' | translate }}</mat-label>
              <input matInput formControlName="score" type="number" />
              @if (completeForm.controls.score.hasError('required')) {
                <mat-error>Score is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'partnerships.fields.findings' | translate }}</mat-label>
              <textarea matInput formControlName="findings" rows="3"></textarea>
              @if (completeForm.controls.findings.hasError('required')) {
                <mat-error>Findings are required</mat-error>
              }
            </mat-form-field>
            <div class="form-actions">
              <button mat-button type="button" (click)="completingId.set(null)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="completeForm.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.save' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Follow-Up Dialog -->
    @if (followUpId()) {
      <div class="inline-form-overlay">
        <div class="inline-form-card">
          <h3>{{ 'partnerships.compliance.followUp' | translate }}</h3>
          <form [formGroup]="followUpForm" (ngSubmit)="onSubmitFollowUp()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'partnerships.fields.followUpDate' | translate }}</mat-label>
              <input matInput formControlName="followUpDate" type="date" />
              @if (followUpForm.controls.followUpDate.hasError('required')) {
                <mat-error>Date is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'partnerships.fields.recommendations' | translate }}</mat-label>
              <textarea matInput formControlName="recommendations" rows="3"></textarea>
              @if (followUpForm.controls.recommendations.hasError('required')) {
                <mat-error>Recommendations are required</mat-error>
              }
            </mat-form-field>
            <div class="form-actions">
              <button mat-button type="button" (click)="followUpId.set(null)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="followUpForm.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.save' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.checkDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #actionsTpl let-row>
      @if (row.status === 'Scheduled' || row.status === 'InProgress') {
        <button mat-icon-button *appHasPermission="'partnerships.compliance.update'" (click)="onComplete(row.id); $event.stopPropagation()">
          <mat-icon>check_circle</mat-icon>
        </button>
      }
      @if (row.status === 'Completed') {
        <button mat-icon-button *appHasPermission="'partnerships.compliance.update'" (click)="onFollowUp(row.id); $event.stopPropagation()">
          <mat-icon>event</mat-icon>
        </button>
      }
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .inline-form-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .inline-form-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      min-width: 400px;
      max-width: 500px;
    }
    .inline-form-card h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .full-width { width: 100%; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `,
})
export default class ComplianceListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly complianceService = inject(ComplianceService);
  private readonly notification = inject(NotificationService);

  readonly complianceChecks = this.store.selectSignal(selectComplianceChecks);
  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  readonly completingId = signal<string | null>(null);
  readonly followUpId = signal<string | null>(null);
  readonly saving = signal(false);

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly completeForm = this.fb.nonNullable.group({
    score: ['', [Validators.required]],
    findings: ['', [Validators.required]],
  });

  readonly followUpForm = this.fb.nonNullable.group({
    followUpDate: ['', [Validators.required]],
    recommendations: ['', [Validators.required]],
  });

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'complianceType', label: 'Type', sortable: true },
    { key: 'checkDate', label: 'Check Date', template: this.dateTpl() },
    { key: 'score', label: 'Score' },
    { key: 'findings', label: 'Findings' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'actions', label: 'Actions', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(PartnershipsActions.loadComplianceChecks({}));
  }

  onComplete(id: string): void {
    this.completingId.set(id);
    this.completeForm.reset();
  }

  onSubmitComplete(): void {
    if (this.completeForm.invalid || !this.completingId()) return;
    const value = this.completeForm.getRawValue();
    const request: CompleteComplianceCheckRequest = {
      id: this.completingId()!,
      score: Number(value.score),
      findings: value.findings,
    };
    this.saving.set(true);
    this.complianceService.complete(this.completingId()!, request).subscribe({
      next: () => {
        this.notification.success('Compliance check completed');
        this.completingId.set(null);
        this.saving.set(false);
        this.store.dispatch(PartnershipsActions.loadComplianceChecks({}));
      },
      error: () => {
        this.notification.error('Failed to complete compliance check');
        this.saving.set(false);
      },
    });
  }

  onFollowUp(id: string): void {
    this.followUpId.set(id);
    this.followUpForm.reset();
  }

  onSubmitFollowUp(): void {
    if (this.followUpForm.invalid || !this.followUpId()) return;
    const value = this.followUpForm.getRawValue();
    const request: RequireFollowUpRequest = {
      id: this.followUpId()!,
      followUpDate: value.followUpDate,
      recommendations: value.recommendations,
    };
    this.saving.set(true);
    this.complianceService.requireFollowUp(this.followUpId()!, request).subscribe({
      next: () => {
        this.notification.success('Follow-up scheduled');
        this.followUpId.set(null);
        this.saving.set(false);
        this.store.dispatch(PartnershipsActions.loadComplianceChecks({}));
      },
      error: () => {
        this.notification.error('Failed to schedule follow-up');
        this.saving.set(false);
      },
    });
  }

  onBackToPartners(): void {
    this.router.navigate(['/partnerships/partners']);
  }
}
