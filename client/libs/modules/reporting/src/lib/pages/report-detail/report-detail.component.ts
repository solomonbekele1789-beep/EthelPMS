import { Component, inject, OnInit, signal, input, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { MatSelectModule } from '@angular/material/select';
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
import { ProjectService, ProjectDto } from '@ethelpms/modules/projects';
import { ReportActions } from '../../store/report.actions';
import {
  selectSelectedReport,
  selectReportingLoading,
  selectApprovalHistory,
} from '../../store/report.selectors';
import {
  ReportCommentDto,
  AddReportCommentRequest,
  SectionType,
  CreateReportSectionRequest,
  AddReportDataEntryRequest,
} from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'ethel-report-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
      @if (report()!.status === 'Rejected' && report()!.rejectionReason) {
        <div class="rejection-banner">
          <mat-icon color="warn">error</mat-icon>
          <div class="rejection-content">
            <strong>Rejection Reason:</strong>
            <p>{{ report()!.rejectionReason }}</p>
          </div>
        </div>
      }

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
                <mat-card-content>{{ report()!.periodStart | date:'mediumDate' }} – {{ report()!.periodEnd | date:'mediumDate' }}</mat-card-content>
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
                <mat-card-content>{{ report()!.quarter ? ('Q' + report()!.quarter) : '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'reporting.fields.projectId' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (project(); as proj) {
                    <a [routerLink]="['/projects', proj.id]" class="project-link">
                      [{{ proj.code }}] {{ proj.name }}
                    </a>
                  } @else {
                    <span class="font-mono text-muted">{{ report()!.projectId }}</span>
                  }
                </mat-card-content>
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
              @if (!report()!.executiveSummary && !report()!.challenges && !report()!.lessonsLearned && !report()!.recommendations) {
                <p class="text-muted">No narrative sections recorded yet.</p>
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
              <span>Approval Progress: Level {{ report()!.currentApprovalLevel }} of {{ report()!.requiredApprovalLevels }}</span>
            </div>

            <!-- Workflow Buttons -->
            <div class="action-buttons">
              @if (report()!.status === 'Draft') {
                <button mat-flat-button color="primary" *appHasPermission="'reporting.reports.submit'" (click)="onSubmitReport()">
                  <mat-icon>send</mat-icon>
                  {{ 'reporting.actions.submit' | translate }}
                </button>
              }
              @if (report()!.status === 'Submitted' || report()!.status === 'UnderReview') {
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
                              <td><code>{{ entry.key }}</code></td>
                              <td>{{ entry.label ?? '-' }}</td>
                              <td>{{ entry.stringValue ?? (entry.numericValue | number) ?? '-' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }

                    <!-- Data Entry Form (for Draft reports) -->
                    @if (report()!.status === 'Draft') {
                      <div class="inline-entry-section">
                        @if (activeDataEntrySectionId() === section.id) {
                          <div class="add-entry-box">
                            <h5>Add Data Entry to "{{ section.title }}"</h5>
                            <form [formGroup]="dataEntryForm" (ngSubmit)="onAddDataEntry(section.id)">
                              <div class="entry-fields-row">
                                <mat-form-field appearance="outline">
                                  <mat-label>Key</mat-label>
                                  <input matInput formControlName="key" placeholder="e.g. attendance_total" />
                                </mat-form-field>

                                <mat-form-field appearance="outline">
                                  <mat-label>Label</mat-label>
                                  <input matInput formControlName="label" placeholder="e.g. Total Participants" />
                                </mat-form-field>

                                <mat-form-field appearance="outline">
                                  <mat-label>Text Value</mat-label>
                                  <input matInput formControlName="stringValue" placeholder="Optional text" />
                                </mat-form-field>

                                <mat-form-field appearance="outline">
                                  <mat-label>Numeric Value</mat-label>
                                  <input matInput formControlName="numericValue" type="number" placeholder="Optional number" />
                                </mat-form-field>
                              </div>
                              <div class="entry-actions">
                                <button mat-button type="button" (click)="toggleDataEntryForm(undefined)">Cancel</button>
                                <button mat-flat-button color="primary" type="submit" [disabled]="dataEntryForm.invalid || entrySubmitting()">
                                  Save Entry
                                </button>
                              </div>
                            </form>
                          </div>
                        } @else {
                          <button mat-stroked-button (click)="toggleDataEntryForm(section.id)">
                            <mat-icon>add</mat-icon>
                            Add Data Entry
                          </button>
                        }
                      </div>
                    }
                  </mat-expansion-panel>
                }
              </mat-accordion>
            } @else {
              <app-empty-state
                icon="article"
                title="No sections"
                message="No custom sections added to this report yet.">
              </app-empty-state>
            }

            <!-- Add Section Form (Available for Draft reports) -->
            @if (report()!.status === 'Draft') {
              <mat-card class="add-section-card">
                <mat-card-header>
                  <mat-card-title>Add Report Section</mat-card-title>
                  <mat-card-subtitle>Append a new narrative, financial, or indicator section</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="sectionForm" (ngSubmit)="onAddSection()">
                    <div class="section-form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Section Title</mat-label>
                        <input matInput formControlName="title" placeholder="e.g. Key Achievements & Outputs" />
                        @if (sectionForm.controls.title.hasError('required')) {
                          <mat-error>Title is required</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Section Type</mat-label>
                        <mat-select formControlName="sectionType">
                          @for (type of sectionTypes; track type) {
                            <mat-option [value]="type">{{ type }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Sort Order</mat-label>
                        <input matInput formControlName="sortOrder" type="number" min="0" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Content / Narrative</mat-label>
                        <textarea matInput formControlName="content" rows="3" placeholder="Enter narrative descriptions or notes..."></textarea>
                      </mat-form-field>
                    </div>

                    <div class="form-actions">
                      <button mat-flat-button color="primary" type="submit" [disabled]="sectionForm.invalid || sectionAdding()">
                        @if (sectionAdding()) {
                          <mat-spinner diameter="20"></mat-spinner>
                        } @else {
                          <mat-icon>add</mat-icon>
                          Add Section
                        }
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
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
                message="Be the first to add a comment or review feedback.">
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
                  <textarea matInput formControlName="content" rows="3" placeholder="Write feedback or review observations..."></textarea>
                </mat-form-field>
                @if (replyToId()) {
                  <p class="reply-indicator">
                    Replying to selected comment...
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
                    <th>Comments / Notes</th>
                    <th>Date</th>
                    <th>Reviewer</th>
                  </tr>
                </thead>
                <tbody>
                  @for (approval of approvalHistory(); track approval.id) {
                    <tr>
                      <td>Level {{ approval.approvalLevel }}</td>
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
    :host { display: block; padding-bottom: 2rem; }
    .tab-content { padding: 1.5rem 0; }
    .rejection-banner {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      color: #991b1b;
      p { margin: 0.25rem 0 0; }
    }
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
    .approval-info { margin: 1rem 0; font-weight: 500; color: #475569; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .negative { color: #d32f2f; }
    .positive { color: #388e3c; }
    .section-content { white-space: pre-wrap; margin-bottom: 1rem; }
    .data-entries-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.5rem;
      margin-bottom: 1rem;
    }
    .data-entries-table th,
    .data-entries-table td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .data-entries-table th { font-weight: 500; }
    .inline-entry-section { margin-top: 1rem; }
    .add-entry-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      h5 { margin: 0 0 0.75rem; font-weight: 600; color: #334155; }
    }
    .entry-fields-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    .entry-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .add-section-card {
      margin-top: 2rem;
      border-radius: 12px;
    }
    .section-form-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 0.75rem 1.5rem;
      margin-top: 1rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
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
    .project-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
      &:hover { text-decoration: underline; }
    }
    .font-mono { font-family: monospace; }
    .text-muted { color: #64748b; }
  `,
})
export default class ReportDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly projectService = inject(ProjectService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly report = this.store.selectSignal(selectSelectedReport);
  readonly loading = this.store.selectSignal(selectReportingLoading);
  readonly approvalHistory = this.store.selectSignal(selectApprovalHistory);

  readonly project = signal<ProjectDto | null>(null);
  readonly activeTab = signal(0);
  readonly replyToId = signal<string | undefined>(undefined);
  readonly commentSubmitting = signal(false);
  readonly sectionAdding = signal(false);
  readonly entrySubmitting = signal(false);
  readonly activeDataEntrySectionId = signal<string | undefined>(undefined);

  readonly sectionTypes: SectionType[] = ['Narrative', 'Financial', 'Indicator', 'Beneficiary', 'Risk', 'Challenge', 'Custom'];

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
  });

  readonly sectionForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    sectionType: ['Narrative' as SectionType, [Validators.required]],
    sortOrder: [0, [Validators.required]],
    content: [''],
  });

  readonly dataEntryForm = this.fb.nonNullable.group({
    key: ['', [Validators.required]],
    label: [''],
    stringValue: [''],
    numericValue: [null as number | null],
    sortOrder: [0],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(ReportActions.loadReport({ id }));
      }
    });

    effect(() => {
      const currentReport = this.report();
      if (currentReport?.projectId) {
        this.projectService.getProject(currentReport.projectId).subscribe({
          next: (p) => this.project.set(p),
          error: () => this.project.set(null),
        });
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
    const comments = window.prompt('Enter approval comments / notes (optional):');
    if (comments === null) return; // User cancelled
    this.store.dispatch(
      ReportActions.approveReport({
        id: this.id(),
        request: {
          reportId: this.id(),
          approvalLevel: report.currentApprovalLevel + 1,
          comments: comments.trim(),
        },
      })
    );
  }

  onReject(): void {
    const report = this.report();
    if (!report) return;
    const reason = window.prompt('Please enter the reason for rejection:');
    if (reason === null) return; // User cancelled
    if (!reason.trim()) {
      this.notification.error('Rejection reason cannot be empty.');
      return;
    }
    this.store.dispatch(
      ReportActions.rejectReport({
        id: this.id(),
        request: {
          reportId: this.id(),
          approvalLevel: report.currentApprovalLevel,
          reason: reason.trim(),
        },
      })
    );
  }

  onAddSection(): void {
    if (this.sectionForm.invalid) return;
    this.sectionAdding.set(true);
    const value = this.sectionForm.getRawValue();
    const req: CreateReportSectionRequest = {
      reportId: this.id(),
      title: value.title,
      sectionType: value.sectionType,
      sortOrder: value.sortOrder,
      content: value.content || undefined,
    };
    this.reportService.addSection(this.id(), req).subscribe({
      next: () => {
        this.sectionAdding.set(false);
        this.sectionForm.reset({ title: '', sectionType: 'Narrative', sortOrder: 0, content: '' });
        this.notification.success('Section added successfully');
        this.store.dispatch(ReportActions.loadReport({ id: this.id() }));
      },
      error: () => {
        this.sectionAdding.set(false);
        this.notification.error('Failed to add section');
      },
    });
  }

  toggleDataEntryForm(sectionId: string | undefined): void {
    this.activeDataEntrySectionId.set(sectionId);
    this.dataEntryForm.reset({ key: '', label: '', stringValue: '', numericValue: null, sortOrder: 0 });
  }

  onAddDataEntry(sectionId: string): void {
    if (this.dataEntryForm.invalid) return;
    this.entrySubmitting.set(true);
    const value = this.dataEntryForm.getRawValue();
    const req: AddReportDataEntryRequest = {
      reportSectionId: sectionId,
      key: value.key,
      label: value.label || undefined,
      stringValue: value.stringValue || undefined,
      numericValue: value.numericValue !== null ? Number(value.numericValue) : undefined,
      sortOrder: value.sortOrder,
    };
    this.reportService.addDataEntry(sectionId, req).subscribe({
      next: () => {
        this.entrySubmitting.set(false);
        this.toggleDataEntryForm(undefined);
        this.notification.success('Data entry added successfully');
        this.store.dispatch(ReportActions.loadReport({ id: this.id() }));
      },
      error: () => {
        this.entrySubmitting.set(false);
        this.notification.error('Failed to add data entry');
      },
    });
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
