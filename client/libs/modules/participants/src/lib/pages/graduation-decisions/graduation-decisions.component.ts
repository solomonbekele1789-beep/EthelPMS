import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
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
import { ParticipantsActions } from '../../store/participants.actions';
import { selectDecisions, selectParticipantsLoading } from '../../store/participants.selectors';
import { GraduationTrackingService } from '../../services/graduation-tracking.service';
import { GraduationDecisionDto, GraduationDecisionStatus, RejectGraduationRequest, CreateGraduationDecisionRequest } from '../../models/graduation.model';

@Component({
  selector: 'ethel-graduation-decisions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
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
    <app-page-header [title]="'participants.graduation.decisions' | translate">
      <button mat-button (click)="onBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'participants.graduation.pipeline' | translate }}
      </button>
    </app-page-header>

    <div class="page-container">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>{{ 'participants.fields.projectId' | translate }}</mat-label>
        <input matInput [value]="projectIdFilter()" (input)="onProjectIdFilter($event)" />
      </mat-form-field>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (decisions().length > 0) {
        <div class="decision-list">
          @for (decision of decisions(); track decision.id) {
            <mat-card class="decision-card">
              <mat-card-header>
                <mat-card-title>{{ decision.participantId }}</mat-card-title>
                <mat-card-subtitle>{{ decision.projectId }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="decision-details">
                  <div class="detail-item">
                    <span class="label">{{ 'common.status' | translate }}:</span>
                    <span class="status-chip" [class]="'status-' + decision.status.toLowerCase()">
                      {{ decision.status }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="label">{{ 'participants.graduation.fields.requiredMet' | translate }}:</span>
                    <span>{{ decision.requiredMetPercentage | number:'1.0-1' }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">{{ 'participants.graduation.fields.readyToGraduate' | translate }}:</span>
                    <mat-icon>{{ decision.isReadyToGraduate ? 'check_circle' : 'cancel' }}</mat-icon>
                  </div>
                  @if (decision.decisionDate) {
                    <div class="detail-item">
                      <span class="label">{{ 'participants.graduation.fields.decisionDate' | translate }}:</span>
                      <span>{{ decision.decisionDate | date:'mediumDate' }}</span>
                    </div>
                  }
                  @if (decision.notes) {
                    <div class="detail-item">
                      <span class="label">{{ 'participants.fields.notes' | translate }}:</span>
                      <span>{{ decision.notes }}</span>
                    </div>
                  }
                  @if (decision.rejectionReason) {
                    <div class="detail-item">
                      <span class="label">{{ 'participants.graduation.fields.rejectionReason' | translate }}:</span>
                      <span>{{ decision.rejectionReason }}</span>
                    </div>
                  }
                </div>

                @if (decision.status === 'Pending') {
                  <div class="decision-actions">
                    <button mat-flat-button color="primary" *appHasPermission="'graduation.tracking.approve'"
                      (click)="onApprove(decision.id)">
                      <mat-icon>check_circle</mat-icon>
                      {{ 'common.approve' | translate }}
                    </button>
                    <button mat-stroked-button color="warn" *appHasPermission="'graduation.tracking.approve'"
                      (click)="onStartReject(decision.id)">
                      <mat-icon>cancel</mat-icon>
                      {{ 'common.reject' | translate }}
                    </button>
                  </div>

                  @if (rejectingDecisionId() === decision.id) {
                    <div class="reject-form">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ 'participants.graduation.fields.rejectionReason' | translate }}</mat-label>
                        <input matInput [(ngModel)]="rejectReason" />
                      </mat-form-field>
                      <div class="form-actions">
                        <button mat-button (click)="rejectingDecisionId.set(null)">{{ 'common.cancel' | translate }}</button>
                        <button mat-flat-button color="warn" (click)="onReject(decision.id)" [disabled]="!rejectReason">
                          {{ 'participants.graduation.confirmReject' | translate }}
                        </button>
                      </div>
                    </div>
                  }
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <app-empty-state icon="gavel" title="No decisions" message="No graduation decisions found."></app-empty-state>
      }

      <div class="add-section" *appHasPermission="'graduation.tracking.manage'">
        <button mat-flat-button color="primary" (click)="showCreateForm.set(!showCreateForm())">
          <mat-icon>add</mat-icon>
          {{ 'participants.graduation.createDecision' | translate }}
        </button>
      </div>

      @if (showCreateForm()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'participants.graduation.createDecision' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="createForm" (ngSubmit)="onCreateDecision()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.fields.participantId' | translate }}</mat-label>
                  <input matInput formControlName="participantId" />
                  @if (createForm.controls.participantId.hasError('required')) {
                    <mat-error>Participant ID is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.fields.projectId' | translate }}</mat-label>
                  <input matInput formControlName="projectId" />
                  @if (createForm.controls.projectId.hasError('required')) {
                    <mat-error>Project ID is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'participants.fields.notes' | translate }}</mat-label>
                  <textarea matInput formControlName="notes" rows="2"></textarea>
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="showCreateForm.set(false)">{{ 'common.cancel' | translate }}</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid">{{ 'common.create' | translate }}</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .page-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-field { max-width: 300px; }
    .decision-list { display: flex; flex-direction: column; gap: 1rem; }
    .decision-card { }
    .decision-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .detail-item .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }
    .status-chip {
      padding: 0.125rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .decision-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }
    .reject-form { margin-top: 1rem; }
    .full-width { width: 100%; grid-column: 1 / -1; }
    .inline-form-card { margin-top: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .add-section { margin-top: 1rem; }
    mat-icon { vertical-align: middle; }
  `,
})
export default class GraduationDecisionsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly trackingService = inject(GraduationTrackingService);
  private readonly notification = inject(NotificationService);

  readonly decisions = this.store.selectSignal(selectDecisions);
  readonly loading = this.store.selectSignal(selectParticipantsLoading);

  readonly projectIdFilter = signal('');
  readonly showCreateForm = signal(false);
  readonly rejectingDecisionId = signal<string | null>(null);
  rejectReason = '';

  readonly createForm = this.fb.nonNullable.group({
    participantId: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadDecisions();
  }

  loadDecisions(): void {
    this.store.dispatch(
      ParticipantsActions.loadDecisions({
        projectId: this.projectIdFilter() || undefined,
      })
    );
  }

  onProjectIdFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectIdFilter.set(value);
    this.loadDecisions();
  }

  onApprove(id: string): void {
    this.store.dispatch(ParticipantsActions.approveDecision({ id }));
  }

  onStartReject(id: string): void {
    this.rejectingDecisionId.set(id);
    this.rejectReason = '';
  }

  onReject(id: string): void {
    const request: RejectGraduationRequest = {
      decisionId: id,
      reason: this.rejectReason,
    };
    this.store.dispatch(ParticipantsActions.rejectDecision({ id, request }));
    this.rejectingDecisionId.set(null);
  }

  onCreateDecision(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateGraduationDecisionRequest = {
      participantId: value.participantId,
      projectId: value.projectId,
      notes: value.notes || undefined,
    };
    this.trackingService.createDecision(request).subscribe({
      next: () => {
        this.notification.success('Decision created successfully');
        this.showCreateForm.set(false);
        this.createForm.reset();
        this.loadDecisions();
      },
      error: () => this.notification.error('Failed to create decision'),
    });
  }

  onBack(): void {
    this.router.navigate(['/participants/graduation/pipeline']);
  }
}
