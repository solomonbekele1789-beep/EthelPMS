import { Component, inject, OnInit, signal, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ReportActions } from '../../store/report.actions';
import {
  selectSelectedReport,
  selectReportingLoading,
  selectApprovalHistory,
} from '../../store/report.selectors';
import { ReportCommentDto, AddReportCommentRequest } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'ethel-report-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    NgTemplateOutlet,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="report()?.title ?? ('reporting.detail.title' | translate)">
      @if (report()) {
        <app-status-badge [status]="report()!.status" [label]="'reporting.status.' + report()!.status | translate"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !report()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (report()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">

        <!-- Tab 1: Overview -->
        <mat-tab [label]="'reporting.detail.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.title' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.title }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.reportType' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ 'reporting.reportType.' + report()!.reportType | translate }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.status' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="report()!.status" [label]="'reporting.status.' + report()!.status | translate"></app-status-badge>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.period' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.periodStart | date:'mediumDate' }} - {{ report()!.periodEnd | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.fiscalYear' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.fiscalYear ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.quarter' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.quarter ?? '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.projectId' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.projectId }}</mat-card-content>
              </mat-card>
            </div>

            <!-- Budget Section -->
            <h3 class="section-title">{{ 'reporting.detail.budget' | translate }}</h3>
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.plannedBudget' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.plannedBudget | currency:'USD':'symbol':'1.0-0' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.actualSpent' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.actualSpent | currency:'USD':'symbol':'1.0-0' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.variance' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content [class.negative]="report()!.variance < 0" [class.positive]="report()!.variance >= 0">
                  {{ report()!.variance | currency:'USD':'symbol':'1.0-0' }}
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.utilizationRate' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.budgetUtilizationRate | number:'1.0-1' }}%</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.cumulativeYtd' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ report()!.cumulativeYtdSpent | currency:'USD':'symbol':'1.0-0' }}</mat-card-content>
              </mat-card>
            </div>

            <!-- Narrative Section -->
            <h3 class="section-title">{{ 'reporting.detail.narrative' | translate }}</h3>
            <div class="narrative-section">
              @if (report()!.executiveSummary) {
                <mat-card class="narrative-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'reporting.fields.executiveSummary' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.executiveSummary }}</mat-card-content>
                </mat-card>
              }
              @if (report()!.challenges) {
                <mat-card class="narrative-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'reporting.fields.challenges' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.challenges }}</mat-card-content>
                </mat-card>
              }
              @if (report()!.lessonsLearned) {
                <mat-card class="narrative-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'reporting.fields.lessonsLearned' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.lessonsLearned }}</mat-card-content>
                </mat-card>
              }
              @if (report()!.recommendations) {
                <mat-card class="narrative-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'reporting.fields.recommendations' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.recommendations }}</mat-card-content>
                </mat-card>
              }
            </div>

            <!-- Incident Section (only for Incident reports) -->
            @if (report()!.reportType === 'Incident') {
              <h3 class="section-title">{{ 'reporting.detail.incident' | translate }}</h3>
              <div class="detail-grid">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Incident Date</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.incidentDate | date:'mediumDate' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Location</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.incidentLocation ?? '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Incident Type</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.incidentType ?? '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>People Involved</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.peopleInvolved ?? '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Injuries</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.injuriesDescription ?? '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Impact</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>{{ report()!.impactDescription ?? '-' }}</mat-card-content>
                </mat-card>
              </div>
            }

            <!-- Approval Level Info -->
            <div class="approval-info">
              <span>Approval Level: {{ report()!.currentApprovalLevel }} / {{ report()!.requiredApprovalLevels }}</span>
            </div>

            <!-- Workflow Buttons -->
            <div class="action-buttons">
              @if (report()!.status === 'Draft') {
                <button mat-flat-button color="primary" *appHasPermission="'reporting.reports.submit'" (click)="onSubmitReport()">
                  <mat-icon>send</mat-icon>
                  {{ 'reporting.actions.submit' | translate }}
                </button>
              }
              @if (report()!.status === 'Submitted') {
                <button mat-flat-button color="primary" *appHasPermission="'reporting.reports.approve'" (click)="onApprove()">
                  <mat-icon>check_circle</mat-icon>
                  {{ 'reporting.actions.approve' | translate }}
                </button>
                <button mat-stroked-button color="warn" *appHasPermission="'reporting.reports.approve'" (click)="onReject()">
                  <mat-icon>cancel</mat-icon>
                  {{ 'reporting.actions.reject' | translate }}
                </button>
              }
              <button mat-button (click)="goBack()">
                {{ 'common.back' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Sections -->
        <mat-tab [label]="'reporting.detail.sections' | translate">
          <div class="tab-content">
            @if (report()!.sections && report()!.sections.length > 0) {
              <mat-accordion>
                @for (section of report()!.sections; track section.id) {
                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>{{ section.title }}</mat-panel-title>
                      <mat-panel-description>
                        <app-status-badge [status]="section.sectionType" [label]="section.sectionType"></app-status-badge>
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    @if (section.content) {
                      <p class="section-content">{{ section.content }}</p>
                    }

                    @if (section.dataEntries && section.dataEntries.length > 0) {
                      <table class="data-entries-table">
                        <thead>
                          <tr>
                            <th>Key</th>
                            <th>Label</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (entry of section.dataEntries; track entry.id) {
                            <tr>
                              <td>{{ entry.key }}</td>
                              <td>{{ entry.label ?? '-' }}</td>
                              <td>{{ entry.stringValue ?? (entry.numericValue | number) ?? '-' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </mat-expansion-panel>
                }
              </mat-accordion>
            } @else {
              <app-empty-state
                icon="article"
                title="No sections"
                message="No sections have been added to this report yet.">
              </app-empty-state>
            }
          </div>
        </mat-tab>

        <!-- Tab 3: Comments -->
        <mat-tab [label]="'reporting.detail.comments' | translate">
          <div class="tab-content">
            @if (report()!.comments && report()!.comments.length > 0) {
              <div class="comments-list">
                @for (comment of report()!.comments; track comment.id) {
                  <ng-container *ngTemplateOutlet="commentTpl; context: { $implicit: comment, depth: 0 }"></ng-container>
                }
              </div>
            } @else {
              <app-empty-state
                icon="comment"
                title="No comments"
                message="Be the first to add a comment.">
              </app-empty-state>
            }

            <ng-template #commentTpl let-comment let-depth="depth">
              <div class="comment-item" [style.margin-left.rem]="depth * 1.5">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ comment.userId }}</mat-card-title>
                    <mat-card-subtitle>{{ comment.createdAt | date:'medium' }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>{{ comment.content }}</mat-card-content>
                  <mat-card-actions>
                    <button mat-button (click)="onReplyTo(comment.id)">
                      <mat-icon>reply</mat-icon>
                      {{ 'reporting.comments.reply' | translate }}
                    </button>
                  </mat-card-actions>
                </mat-card>

                @if (comment.replies && comment.replies.length > 0) {
                  @for (reply of comment.replies; track reply.id) {
                    <ng-container *ngTemplateOutlet="commentTpl; context: { $implicit: reply, depth: depth + 1 }"></ng-container>
                  }
                }
              </div>
            </ng-template>

            <!-- Add Comment Form -->
            <div class="comment-form">
              <h4>{{ 'reporting.comments.add' | translate }}</h4>
              <form [formGroup]="commentForm" (ngSubmit)="onAddComment()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Comment</mat-label>
                  <textarea matInput formControlName="content" rows="3"></textarea>
                </mat-form-field>
                @if (replyToId()) {
                  <p class="reply-indicator">
                    Replying to comment...
                    <button mat-button type="button" (click)="cancelReply()">Cancel</button>
                  </p>
                }
                <button mat-flat-button color="primary" type="submit" [disabled]="commentForm.invalid || commentSubmitting()">
                  @if (commentSubmitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ 'common.add' | translate }}
                  }
                </button>
              </form>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 4: Approval History -->
        <mat-tab [label]="'reporting.detail.approvalHistory' | translate">
          <div class="tab-content">
            @if (approvalHistory() && approvalHistory()!.length > 0) {
              <table class="approval-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Action</th>
                    <th>Comments</th>
                    <th>Date</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  @for (approval of approvalHistory(); track approval.id) {
                    <tr>
                      <td>{{ approval.approvalLevel }}</td>
                      <td>
                        <app-status-badge [status]="approval.action" [label]="approval.action"></app-status-badge>
                      </td>
                      <td>{{ approval.comments ?? '-' }}</td>
                      <td>{{ approval.actionDate | date:'medium' }}</td>
                      <td>{{ approval.userId }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <app-empty-state
                icon="history"
                title="No approval history"
                message="No approval actions have been recorded yet.">
              </app-empty-state>
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
    .narrative-section { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .narrative-card { margin-bottom: 0; }
    .approval-info { margin: 1rem 0; font-weight: 500; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .negative { color: #d32f2f; }
    .positive { color: #388e3c; }
    .section-content { white-space: pre-wrap; margin-bottom: 1rem; }
    .data-entries-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.5rem;
    }
    .data-entries-table th,
    .data-entries-table td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .data-entries-table th { font-weight: 500; }
    .comments-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .comment-item { margin-bottom: 0.5rem; }
    .comment-form { margin-top: 2rem; }
    .comment-form .full-width { width: 100%; }
    .reply-indicator { font-style: italic; color: rgba(0, 0, 0, 0.54); }
    .approval-table {
      width: 100%;
      border-collapse: collapse;
    }
    .approval-table th,
    .approval-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .approval-table th { font-weight: 500; }
  `,
})
export default class ReportDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly report = this.store.selectSignal(selectSelectedReport);
  readonly loading = this.store.selectSignal(selectReportingLoading);
  readonly approvalHistory = this.store.selectSignal(selectApprovalHistory);

  readonly activeTab = signal(0);
  readonly replyToId = signal<string | undefined>(undefined);
  readonly commentSubmitting = signal(false);

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(ReportActions.loadReport({ id }));
      }
    });
  }

  ngOnInit(): void {
    // Initial load handled by effect reacting to id changes
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 3) {
      this.store.dispatch(ReportActions.loadApprovalHistory({ id: this.id() }));
    }
  }

  onSubmitReport(): void {
    this.store.dispatch(ReportActions.submitReport({ id: this.id() }));
  }

  onApprove(): void {
    const report = this.report();
    if (!report) return;
    this.store.dispatch(
      ReportActions.approveReport({
        id: this.id(),
        request: {
          reportId: this.id(),
          approvalLevel: report.currentApprovalLevel + 1,
          comments: '',
        },
      })
    );
  }

  onReject(): void {
    const report = this.report();
    if (!report) return;
    this.store.dispatch(
      ReportActions.rejectReport({
        id: this.id(),
        request: {
          reportId: this.id(),
          approvalLevel: report.currentApprovalLevel,
          reason: '',
        },
      })
    );
  }

  onReplyTo(commentId: string): void {
    this.replyToId.set(commentId);
  }

  cancelReply(): void {
    this.replyToId.set(undefined);
  }

  onAddComment(): void {
    if (this.commentForm.invalid) return;
    this.commentSubmitting.set(true);
    const request: AddReportCommentRequest = {
      reportId: this.id(),
      content: this.commentForm.getRawValue().content,
      parentCommentId: this.replyToId() ?? undefined,
    };
    this.reportService.addComment(this.id(), request).subscribe({
      next: () => {
        this.commentForm.reset();
        this.replyToId.set(undefined);
        this.commentSubmitting.set(false);
        this.notification.success('Comment added successfully');
        this.store.dispatch(ReportActions.loadReport({ id: this.id() }));
      },
      error: () => {
        this.commentSubmitting.set(false);
        this.notification.error('Failed to add comment');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/reporting']);
  }
}
