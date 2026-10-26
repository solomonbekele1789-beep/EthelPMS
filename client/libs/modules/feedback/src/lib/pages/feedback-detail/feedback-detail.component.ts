import { Component, ChangeDetectionStrategy, inject, signal, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FeedbackActions } from '../../store/feedback.actions';
import { selectSelectedItem, selectFeedbackLoading } from '../../store/feedback.selectors';
import {
  FeedbackItemDto,
  AssignFeedbackRequest,
  EscalateFeedbackRequest,
  AddFeedbackResponseRequest,
} from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'ethel-feedback-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="item()?.referenceNumber ?? ('feedback.detail.title' | translate)">
      @if (item()) {
        <mat-chip [class.status-new]="item()!.status === 'New'"
                  [class.status-acknowledged]="item()!.status === 'Acknowledged'"
                  [class.status-under-review]="item()!.status === 'UnderReview'"
                  [class.status-escalated]="item()!.status === 'Escalated'"
                  [class.status-resolved]="item()!.status === 'Resolved'"
                  [class.status-closed]="item()!.status === 'Closed'">
          {{ item()!.status }}
        </mat-chip>
      }
    </app-page-header>

    @if (loading() && !item()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (item()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">

        <!-- Tab 1: Overview -->
        <mat-tab [label]="'feedback.detail.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.referenceNumber' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.referenceNumber }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.type' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-chip>{{ item()!.type }}</mat-chip>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.status' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-chip [class.status-new]="item()!.status === 'New'"
                            [class.status-acknowledged]="item()!.status === 'Acknowledged'"
                            [class.status-under-review]="item()!.status === 'UnderReview'"
                            [class.status-escalated]="item()!.status === 'Escalated'"
                            [class.status-resolved]="item()!.status === 'Resolved'"
                            [class.status-closed]="item()!.status === 'Closed'">
                    {{ item()!.status }}
                  </mat-chip>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.priority' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-chip [class.priority-low]="item()!.priority === 'Low'"
                            [class.priority-normal]="item()!.priority === 'Normal'"
                            [class.priority-high]="item()!.priority === 'High'"
                            [class.priority-critical]="item()!.priority === 'Critical'">
                    {{ item()!.priority }}
                  </mat-chip>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.channel' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.channel }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.createdAt' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.createdAt | date:'medium' }}</mat-card-content>
              </mat-card>
            </div>

            <!-- Description -->
            <mat-card class="description-card">
              <mat-card-header>
                <mat-card-title>{{ 'feedback.fields.description' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>{{ item()!.description }}</mat-card-content>
            </mat-card>

            <!-- Submitter Info -->
            <h3 class="section-title">{{ 'feedback.detail.submitter' | translate }}</h3>
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.submitterName' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.isAnonymous ? 'Anonymous' : (item()!.submitterName ?? '-') }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.submitterContact' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.submitterContact ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.isAnonymous' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.isAnonymous ? 'Yes' : 'No' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.isConfidential' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.isConfidential ? 'Yes' : 'No' }}</mat-card-content>
              </mat-card>

              @if (item()!.location) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ 'feedback.fields.location' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ item()!.location }}</mat-card-content>
                </mat-card>
              }

              @if (item()!.projectId) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ 'feedback.fields.projectId' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ item()!.projectId }}</mat-card-content>
                </mat-card>
              }
            </div>

            <!-- Assignment & SLA -->
            <h3 class="section-title">{{ 'feedback.detail.assignment' | translate }}</h3>
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.assignedTo' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.assignedToName ?? 'Unassigned' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.slaStatus' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <span [class.sla-on-track]="item()!.slaStatus === 'OnTrack'"
                        [class.sla-breached]="item()!.slaStatus === 'Breached'">
                    {{ item()!.slaStatus }}
                  </span>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.slaResponseDeadline' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.slaResponseDeadline | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'feedback.fields.slaResolutionDeadline' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ item()!.slaResolutionDeadline | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              @if (item()!.acknowledgedAt) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ 'feedback.fields.acknowledgedAt' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ item()!.acknowledgedAt | date:'medium' }}</mat-card-content>
                </mat-card>
              }

              @if (item()!.resolvedAt) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ 'feedback.fields.resolvedAt' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ item()!.resolvedAt | date:'medium' }}</mat-card-content>
                </mat-card>
              }
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons" *appHasPermission="'feedback.items.manage'">
              @if (item()!.status === 'New') {
                <button mat-flat-button color="primary" (click)="onAcknowledge()" [disabled]="actionLoading()">
                  <mat-icon>check</mat-icon>
                  {{ 'feedback.actions.acknowledge' | translate }}
                </button>
              }

              <button mat-stroked-button (click)="showAssignForm.set(!showAssignForm())">
                <mat-icon>person_add</mat-icon>
                {{ 'feedback.actions.assign' | translate }}
              </button>

              <button mat-stroked-button color="warn" (click)="showEscalateForm.set(!showEscalateForm())">
                <mat-icon>priority_high</mat-icon>
                {{ 'feedback.actions.escalate' | translate }}
              </button>

              @if (item()!.status !== 'Resolved' && item()!.status !== 'Closed') {
                <button mat-flat-button color="accent" (click)="onResolve()" [disabled]="actionLoading()">
                  <mat-icon>done_all</mat-icon>
                  {{ 'feedback.actions.resolve' | translate }}
                </button>
              }
            </div>

            <!-- Assign Inline Form -->
            @if (showAssignForm()) {
              <div class="inline-form">
                <h4>{{ 'feedback.actions.assign' | translate }}</h4>
                <form [formGroup]="assignForm" (ngSubmit)="onAssign()">
                  <div class="inline-form-fields">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'feedback.fields.assignedToUserId' | translate }}</mat-label>
                      <input matInput formControlName="assignedToUserId" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'feedback.fields.assignedToName' | translate }}</mat-label>
                      <input matInput formControlName="assignedToName" />
                    </mat-form-field>
                  </div>
                  <div class="inline-form-actions">
                    <button mat-button type="button" (click)="showAssignForm.set(false)">{{ 'common.cancel' | translate }}</button>
                    <button mat-flat-button color="primary" type="submit" [disabled]="assignForm.invalid || actionLoading()">
                      {{ 'common.save' | translate }}
                    </button>
                  </div>
                </form>
              </div>
            }

            <!-- Escalate Inline Form -->
            @if (showEscalateForm()) {
              <div class="inline-form">
                <h4>{{ 'feedback.actions.escalate' | translate }}</h4>
                <form [formGroup]="escalateForm" (ngSubmit)="onEscalate()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'feedback.fields.reason' | translate }}</mat-label>
                    <textarea matInput formControlName="reason" rows="3"></textarea>
                  </mat-form-field>
                  <div class="inline-form-actions">
                    <button mat-button type="button" (click)="showEscalateForm.set(false)">{{ 'common.cancel' | translate }}</button>
                    <button mat-flat-button color="warn" type="submit" [disabled]="escalateForm.invalid || actionLoading()">
                      {{ 'feedback.actions.escalate' | translate }}
                    </button>
                  </div>
                </form>
              </div>
            }

            <button mat-button (click)="goBack()" class="back-btn">
              {{ 'common.back' | translate }}
            </button>
          </div>
        </mat-tab>

        <!-- Tab 2: Responses -->
        <mat-tab [label]="'feedback.detail.responses' | translate">
          <div class="tab-content">
            @if (item()!.responses && item()!.responses.length > 0) {
              <div class="responses-list">
                @for (response of item()!.responses; track response.id) {
                  <mat-card class="response-card">
                    <mat-card-header>
                      <mat-card-title>{{ response.responderName }}</mat-card-title>
                      <mat-card-subtitle>{{ response.createdAt | date:'medium' }}</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <p>{{ response.content }}</p>
                      @if (response.isInternal) {
                        <mat-chip class="internal-chip">Internal</mat-chip>
                      }
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            } @else {
              <app-empty-state
                icon="forum"
                title="No responses"
                message="No responses have been added yet.">
              </app-empty-state>
            }

            <!-- Add Response Form -->
            <div class="response-form" *appHasPermission="'feedback.items.respond'">
              <h4>{{ 'feedback.responses.add' | translate }}</h4>
              <form [formGroup]="responseForm" (ngSubmit)="onAddResponse()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'feedback.fields.content' | translate }}</mat-label>
                  <textarea matInput formControlName="content" rows="3"></textarea>
                </mat-form-field>
                <mat-checkbox formControlName="isInternal">
                  {{ 'feedback.fields.isInternal' | translate }}
                </mat-checkbox>
                <div class="inline-form-actions">
                  <button mat-flat-button color="primary" type="submit"
                          [disabled]="responseForm.invalid || responseSubmitting()">
                    @if (responseSubmitting()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
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
    .description-card { margin-bottom: 1.5rem; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }
    .inline-form {
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .inline-form h4 { margin: 0 0 1rem; }
    .inline-form-fields { display: flex; gap: 1rem; flex-wrap: wrap; }
    .inline-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .full-width { width: 100%; }
    .back-btn { margin-top: 1rem; }
    .status-new { --mdc-chip-elevated-container-color: #bbdefb; }
    .status-acknowledged { --mdc-chip-elevated-container-color: #b2dfdb; }
    .status-under-review { --mdc-chip-elevated-container-color: #ffe0b2; }
    .status-escalated { --mdc-chip-elevated-container-color: #ffcdd2; }
    .status-resolved { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-closed { --mdc-chip-elevated-container-color: #e0e0e0; }
    .priority-low { --mdc-chip-elevated-container-color: #e0e0e0; }
    .priority-normal { --mdc-chip-elevated-container-color: #bbdefb; }
    .priority-high { --mdc-chip-elevated-container-color: #ffe0b2; }
    .priority-critical { --mdc-chip-elevated-container-color: #ffcdd2; }
    .sla-on-track { color: #388e3c; font-weight: 500; }
    .sla-breached { color: #d32f2f; font-weight: 500; }
    .internal-chip { --mdc-chip-elevated-container-color: #e8eaf6; font-size: 0.8rem; }
    .responses-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .response-card { margin-bottom: 0; }
    .response-form { margin-top: 2rem; }
    .response-form .full-width { width: 100%; }
    .response-form mat-checkbox { margin-bottom: 0.5rem; display: block; }
  `,
})
export default class FeedbackDetailComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly feedbackService = inject(FeedbackService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly item = this.store.selectSignal(selectSelectedItem);
  readonly loading = this.store.selectSignal(selectFeedbackLoading);

  readonly activeTab = signal(0);
  readonly actionLoading = signal(false);
  readonly responseSubmitting = signal(false);
  readonly showAssignForm = signal(false);
  readonly showEscalateForm = signal(false);

  readonly assignForm = this.fb.nonNullable.group({
    assignedToUserId: ['', [Validators.required]],
    assignedToName: ['', [Validators.required]],
  });

  readonly escalateForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required]],
  });

  readonly responseForm = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
    isInternal: [false],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(FeedbackActions.loadFeedbackItem({ id }));
      }
    });
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  onAcknowledge(): void {
    this.actionLoading.set(true);
    this.feedbackService.acknowledgeFeedback(this.id()).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.notification.success('Feedback acknowledged');
        this.store.dispatch(FeedbackActions.loadFeedbackItem({ id: this.id() }));
      },
      error: () => {
        this.actionLoading.set(false);
        this.notification.error('Failed to acknowledge feedback');
      },
    });
  }

  onAssign(): void {
    if (this.assignForm.invalid) return;
    this.actionLoading.set(true);
    const value = this.assignForm.getRawValue();
    const request: AssignFeedbackRequest = {
      feedbackItemId: this.id(),
      assignedToUserId: value.assignedToUserId,
      assignedToName: value.assignedToName,
    };
    this.feedbackService.assignFeedback(this.id(), request).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.showAssignForm.set(false);
        this.assignForm.reset();
        this.notification.success('Feedback assigned');
        this.store.dispatch(FeedbackActions.loadFeedbackItem({ id: this.id() }));
      },
      error: () => {
        this.actionLoading.set(false);
        this.notification.error('Failed to assign feedback');
      },
    });
  }

  onEscalate(): void {
    if (this.escalateForm.invalid) return;
    this.actionLoading.set(true);
    const value = this.escalateForm.getRawValue();
    const request: EscalateFeedbackRequest = {
      feedbackItemId: this.id(),
      reason: value.reason,
    };
    this.feedbackService.escalateFeedback(this.id(), request).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.showEscalateForm.set(false);
        this.escalateForm.reset();
        this.notification.success('Feedback escalated');
        this.store.dispatch(FeedbackActions.loadFeedbackItem({ id: this.id() }));
      },
      error: () => {
        this.actionLoading.set(false);
        this.notification.error('Failed to escalate feedback');
      },
    });
  }

  onResolve(): void {
    this.actionLoading.set(true);
    this.feedbackService.resolveFeedback(this.id()).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.notification.success('Feedback resolved');
        this.store.dispatch(FeedbackActions.loadFeedbackItem({ id: this.id() }));
      },
      error: () => {
        this.actionLoading.set(false);
        this.notification.error('Failed to resolve feedback');
      },
    });
  }

  onAddResponse(): void {
    if (this.responseForm.invalid) return;
    this.responseSubmitting.set(true);
    const value = this.responseForm.getRawValue();
    const request: AddFeedbackResponseRequest = {
      feedbackItemId: this.id(),
      content: value.content,
      isInternal: value.isInternal,
    };
    this.feedbackService.addResponse(this.id(), request).subscribe({
      next: () => {
        this.responseForm.reset();
        this.responseSubmitting.set(false);
        this.notification.success('Response added successfully');
        this.store.dispatch(FeedbackActions.loadFeedbackItem({ id: this.id() }));
      },
      error: () => {
        this.responseSubmitting.set(false);
        this.notification.error('Failed to add response');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/feedback']);
  }
}
