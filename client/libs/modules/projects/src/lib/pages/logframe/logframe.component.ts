import { Component, input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngrx/store';

import { NotificationService, ConfirmDialogComponent } from '@ethelpms/shared/ui';
import { LogframeDto, LogframeOutcomeDto, LogframeOutputDto, LogframeActivityDto } from '../../models/logframe.model';
import { IndicatorDto } from '../../models/results-framework.model';
import { ResultsFrameworkService } from '../../services/results-framework.service';
import { ProjectActions } from '../../store/project.actions';
import { OutcomeDialogComponent, OutcomeDialogData } from '../../components/outcome-dialog/outcome-dialog.component';
import { OutputDialogComponent, OutputDialogData } from '../../components/output-dialog/output-dialog.component';
import { ActivityDialogComponent, ActivityDialogData } from '../../components/activity-dialog/activity-dialog.component';
import { IndicatorDialogComponent, IndicatorDialogData } from '../../components/indicator-dialog/indicator-dialog.component';

@Component({
  selector: 'ethel-logframe',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
  ],
  template: `
    <div class="logframe-container">
      <!-- Top Action Toolbar -->
      <div class="logframe-header">
        <div class="header-left">
          <div class="header-title-row">
            <mat-icon class="title-icon">account_tree</mat-icon>
            <h3>{{ 'projects.logframe.title' | translate }}</h3>
          </div>
          <div class="hierarchy-breadcrumb">
            <span class="hierarchy-pill outcome-pill"><mat-icon>flag</mat-icon> Outcome</span>
            <span class="arrow">&rarr;</span>
            <span class="hierarchy-pill output-pill"><mat-icon>inventory_2</mat-icon> Output</span>
            <span class="arrow">&rarr;</span>
            <span class="hierarchy-pill activity-pill"><mat-icon>task</mat-icon> Activity</span>
            <span class="arrow">&amp;</span>
            <span class="hierarchy-pill indicator-pill"><mat-icon>insights</mat-icon> Indicators</span>
          </div>
        </div>

        <button mat-flat-button color="primary" class="add-outcome-btn" (click)="openCreateOutcomeDialog()">
          <mat-icon>add</mat-icon>
          Add Outcome
        </button>
      </div>

      <!-- Empty State -->
      @if (!logframe() || logframe()!.outcomes.length === 0) {
        <div class="empty-logframe-card">
          <div class="empty-icon-wrapper">
            <mat-icon>account_tree</mat-icon>
          </div>
          <h4>No Outcomes Defined Yet</h4>
          <p class="empty-desc">
            The Results Framework defines your project's logic hierarchy. Start by defining your project's high-level
            strategic <strong>Outcomes</strong>, then attach <strong>Outputs</strong>, <strong>Activities</strong>, and
            <strong>Performance Indicators</strong> under them.
          </p>
          <button mat-flat-button color="primary" (click)="openCreateOutcomeDialog()">
            <mat-icon>add</mat-icon>
            Create First Outcome
          </button>
        </div>
      } @else {
        <!-- Level 1: Outcomes List -->
        <div class="outcomes-list">
          @for (outcome of logframe()!.outcomes; track outcome.id) {
            <mat-expansion-panel class="outcome-panel" [expanded]="true">
              <mat-expansion-panel-header>
                <div class="panel-header-layout">
                  <div class="header-main-info">
                    <mat-icon class="level-icon outcome-icon">flag</mat-icon>
                    <span class="badge badge-outcome">OUTCOME</span>
                    <strong class="item-code">{{ outcome.code }}</strong>
                    <span class="item-desc">{{ outcome.description }}</span>
                  </div>

                  <div class="header-actions" (click)="$event.stopPropagation()">
                    <button
                      mat-stroked-button
                      class="btn-subaction action-output"
                      (click)="openCreateOutputDialog(outcome)"
                      matTooltip="Add Output under this Outcome"
                    >
                      <mat-icon>inventory_2</mat-icon>
                      + Add Output
                    </button>
                    <button
                      mat-stroked-button
                      class="btn-subaction action-indicator"
                      (click)="openCreateOutcomeIndicatorDialog(outcome)"
                      matTooltip="Add Indicator to this Outcome"
                    >
                      <mat-icon>insights</mat-icon>
                      + Indicator
                    </button>
                    <button
                      mat-icon-button
                      class="action-icon-btn"
                      (click)="openEditOutcomeDialog(outcome)"
                      matTooltip="Edit Outcome"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      class="action-icon-btn warn"
                      (click)="deleteOutcome(outcome)"
                      matTooltip="Delete Outcome"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-expansion-panel-header>

              <div class="panel-body">
                <!-- Outcome Metrics & Assumptions -->
                <div class="meta-stats-row">
                  @if (outcome.baselineValue != null) {
                    <div class="meta-stat">
                      <span class="meta-label">Baseline:</span>
                      <span class="meta-val">{{ outcome.baselineValue | number:'1.0-2' }}</span>
                    </div>
                  }
                  @if (outcome.targetValue != null) {
                    <div class="meta-stat">
                      <span class="meta-label">Target:</span>
                      <span class="meta-val highlight">{{ outcome.targetValue | number:'1.0-2' }}</span>
                    </div>
                  }
                  @if (outcome.assumptions) {
                    <div class="meta-stat full-width">
                      <span class="meta-label">Assumptions & Risks:</span>
                      <span class="meta-val assumptions-text">{{ outcome.assumptions }}</span>
                    </div>
                  }
                </div>

                <!-- Outcome Indicators -->
                @if (outcome.indicators.length > 0) {
                  <div class="indicators-section">
                    <span class="section-tag"><mat-icon>insights</mat-icon> Outcome Indicators:</span>
                    <div class="indicator-chips-container">
                      @for (indicator of outcome.indicators; track indicator.id) {
                        <div class="custom-indicator-chip">
                          <mat-icon class="chip-icon">insights</mat-icon>
                          <div class="chip-text">
                            <strong>{{ indicator.code }}:</strong> {{ indicator.name }}
                            @if (indicator.targetValue != null) {
                              <span class="chip-target">(Target: {{ indicator.targetValue | number:'1.0-2' }})</span>
                            }
                          </div>
                          <button
                            mat-icon-button
                            class="chip-action-btn"
                            (click)="openEditIndicatorDialog(indicator)"
                            matTooltip="Edit Indicator"
                          >
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button
                            mat-icon-button
                            class="chip-action-btn warn"
                            (click)="deleteIndicator(indicator)"
                            matTooltip="Delete Indicator"
                          >
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Level 2: Outputs -->
                <div class="child-section-container">
                  <div class="child-section-header">
                    <div class="child-section-title">
                      <mat-icon class="output-icon">inventory_2</mat-icon>
                      <span>Outputs under {{ outcome.code }}</span>
                      <span class="count-badge">{{ outcome.outputs.length }}</span>
                    </div>
                    <button
                      mat-button
                      color="primary"
                      class="btn-inline-add"
                      (click)="openCreateOutputDialog(outcome)"
                    >
                      <mat-icon>add</mat-icon> Add Output
                    </button>
                  </div>

                  @if (outcome.outputs.length === 0) {
                    <div class="empty-nested-box">
                      <mat-icon>inventory_2</mat-icon>
                      <p>No outputs yet. Click <strong>+ Add Output</strong> to record deliverables under {{ outcome.code }}.</p>
                    </div>
                  } @else {
                    @for (output of outcome.outputs; track output.id) {
                      <mat-expansion-panel class="output-panel" [expanded]="true">
                        <mat-expansion-panel-header>
                          <div class="panel-header-layout">
                            <div class="header-main-info">
                              <mat-icon class="level-icon output-icon">inventory_2</mat-icon>
                              <span class="badge badge-output">OUTPUT</span>
                              <strong class="item-code">{{ output.code }}</strong>
                              <span class="item-desc">{{ output.description }}</span>
                            </div>

                            <div class="header-actions" (click)="$event.stopPropagation()">
                              <button
                                mat-stroked-button
                                class="btn-subaction action-activity"
                                (click)="openCreateActivityDialog(output)"
                                matTooltip="Add Activity under this Output"
                              >
                                <mat-icon>task</mat-icon>
                                + Add Activity
                              </button>
                              <button
                                mat-stroked-button
                                class="btn-subaction action-indicator"
                                (click)="openCreateOutputIndicatorDialog(output)"
                                matTooltip="Add Indicator to this Output"
                              >
                                <mat-icon>insights</mat-icon>
                                + Indicator
                              </button>
                              <button
                                mat-icon-button
                                class="action-icon-btn"
                                (click)="openEditOutputDialog(output)"
                                matTooltip="Edit Output"
                              >
                                <mat-icon>edit</mat-icon>
                              </button>
                              <button
                                mat-icon-button
                                class="action-icon-btn warn"
                                (click)="deleteOutput(output)"
                                matTooltip="Delete Output"
                              >
                                <mat-icon>delete_outline</mat-icon>
                              </button>
                            </div>
                          </div>
                        </mat-expansion-panel-header>

                        <div class="panel-body output-body">
                          <!-- Output Metrics & Assumptions -->
                          <div class="meta-stats-row">
                            @if (output.baselineValue != null) {
                              <div class="meta-stat">
                                <span class="meta-label">Baseline:</span>
                                <span class="meta-val">{{ output.baselineValue | number:'1.0-2' }}</span>
                              </div>
                            }
                            @if (output.targetValue != null) {
                              <div class="meta-stat">
                                <span class="meta-label">Target:</span>
                                <span class="meta-val highlight">{{ output.targetValue | number:'1.0-2' }}</span>
                              </div>
                            }
                            @if (output.assumptions) {
                              <div class="meta-stat full-width">
                                <span class="meta-label">Assumptions:</span>
                                <span class="meta-val assumptions-text">{{ output.assumptions }}</span>
                              </div>
                            }
                          </div>

                          <!-- Output Indicators -->
                          @if (output.indicators.length > 0) {
                            <div class="indicators-section">
                              <span class="section-tag"><mat-icon>insights</mat-icon> Output Indicators:</span>
                              <div class="indicator-chips-container">
                                @for (indicator of output.indicators; track indicator.id) {
                                  <div class="custom-indicator-chip">
                                    <mat-icon class="chip-icon">insights</mat-icon>
                                    <div class="chip-text">
                                      <strong>{{ indicator.code }}:</strong> {{ indicator.name }}
                                      @if (indicator.targetValue != null) {
                                        <span class="chip-target">(Target: {{ indicator.targetValue | number:'1.0-2' }})</span>
                                      }
                                    </div>
                                    <button
                                      mat-icon-button
                                      class="chip-action-btn"
                                      (click)="openEditIndicatorDialog(indicator)"
                                      matTooltip="Edit Indicator"
                                    >
                                      <mat-icon>edit</mat-icon>
                                    </button>
                                    <button
                                      mat-icon-button
                                      class="chip-action-btn warn"
                                      (click)="deleteIndicator(indicator)"
                                      matTooltip="Delete Indicator"
                                    >
                                      <mat-icon>close</mat-icon>
                                    </button>
                                  </div>
                                }
                              </div>
                            </div>
                          }

                          <!-- Level 3: Activities -->
                          <div class="child-section-container">
                            <div class="child-section-header">
                              <div class="child-section-title">
                                <mat-icon class="activity-icon">task</mat-icon>
                                <span>Activities under {{ output.code }}</span>
                                <span class="count-badge">{{ output.activities.length }}</span>
                              </div>
                              <button
                                mat-button
                                color="primary"
                                class="btn-inline-add"
                                (click)="openCreateActivityDialog(output)"
                              >
                                <mat-icon>add</mat-icon> Add Activity
                              </button>
                            </div>

                            @if (output.activities.length === 0) {
                              <div class="empty-nested-box">
                                <mat-icon>task</mat-icon>
                                <p>No activities yet. Click <strong>+ Add Activity</strong> to define actionable tasks under {{ output.code }}.</p>
                              </div>
                            } @else {
                              <div class="activities-grid">
                                @for (activity of output.activities; track activity.id) {
                                  <div class="activity-card">
                                    <div class="activity-card-header">
                                      <div class="activity-header-left">
                                        <mat-icon class="activity-icon">task</mat-icon>
                                        <span class="badge badge-activity">ACTIVITY</span>
                                        <strong class="item-code">{{ activity.code }}</strong>
                                        <span class="activity-name">{{ activity.name }}</span>
                                      </div>
                                      <div class="activity-actions">
                                        <button
                                          mat-icon-button
                                          class="action-icon-btn"
                                          (click)="openEditActivityDialog(output, activity)"
                                          matTooltip="Edit Activity"
                                        >
                                          <mat-icon>edit</mat-icon>
                                        </button>
                                        <button
                                          mat-icon-button
                                          class="action-icon-btn warn"
                                          (click)="deleteActivity(output, activity)"
                                          matTooltip="Delete Activity"
                                        >
                                          <mat-icon>delete_outline</mat-icon>
                                        </button>
                                      </div>
                                    </div>

                                    @if (activity.description) {
                                      <p class="activity-desc">{{ activity.description }}</p>
                                    }

                                    <div class="activity-meta-pills">
                                      @if (activity.budgetAllocated != null) {
                                        <div class="meta-pill budget">
                                          <mat-icon>payments</mat-icon>
                                          <span>Budget: {{ activity.budgetAllocated | currency:'USD':'symbol':'1.0-0' }}</span>
                                        </div>
                                      }
                                      @if (activity.lifetimeTarget != null) {
                                        <div class="meta-pill target">
                                          <mat-icon>adjust</mat-icon>
                                          <span>Target: {{ activity.lifetimeTarget | number }} {{ activity.unit || '' }}</span>
                                        </div>
                                      }
                                      @if (activity.unit && activity.lifetimeTarget == null) {
                                        <div class="meta-pill unit">
                                          <mat-icon>straighten</mat-icon>
                                          <span>Unit: {{ activity.unit }}</span>
                                        </div>
                                      }
                                    </div>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      </mat-expansion-panel>
                    }
                  }
                </div>
              </div>
            </mat-expansion-panel>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .logframe-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    /* Top Action Toolbar */
    .logframe-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: var(--card-bg, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--border-color, #e0e0e0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .header-title-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .title-icon {
      color: #1976d2;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-title-row h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #212121);
    }

    .hierarchy-breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
      font-size: 0.75rem;
    }

    .hierarchy-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.55rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.72rem;
    }

    .hierarchy-pill mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .outcome-pill { background: #e3f2fd; color: #1565c0; }
    .output-pill { background: #e8f5e9; color: #2e7d32; }
    .activity-pill { background: #fff3e0; color: #e65100; }
    .indicator-pill { background: #f3e5f5; color: #7b1fa2; }
    .arrow { color: #9e9e9e; font-weight: bold; }

    .add-outcome-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    /* Empty state */
    .empty-logframe-card {
      text-align: center;
      padding: 3.5rem 2rem;
      background: var(--card-bg, #ffffff);
      border-radius: 8px;
      border: 1px dashed var(--border-color, #bdbdbd);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .empty-icon-wrapper mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #1976d2;
    }

    .empty-logframe-card h4 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #212121);
    }

    .empty-desc {
      max-width: 580px;
      color: var(--text-secondary, #666);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    /* Outcomes list */
    .outcomes-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .outcome-panel {
      border: 1px solid #bbdefb !important;
      border-radius: 8px !important;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
    }

    .outcome-panel ::ng-deep .mat-expansion-panel-header {
      background: #f5f9ff;
      padding: 0.75rem 1.25rem;
      height: auto !important;
      min-height: 56px;
    }

    .panel-header-layout {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-right: 0.5rem;
      gap: 1rem;
    }

    .header-main-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex: 1;
      min-width: 0;
    }

    .level-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .outcome-icon { color: #1565c0; }
    .output-icon { color: #2e7d32; }
    .activity-icon { color: #e65100; }

    .badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .badge-outcome { background: #1565c0; color: #fff; }
    .badge-output { background: #2e7d32; color: #fff; }
    .badge-activity { background: #e65100; color: #fff; }

    .item-code {
      font-weight: 700;
      color: var(--text-primary, #212121);
      flex-shrink: 0;
    }

    .item-desc {
      color: var(--text-primary, #424242);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .btn-subaction {
      height: 32px;
      line-height: 32px;
      padding: 0 0.65rem;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn-subaction mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .action-output {
      color: #2e7d32;
      border-color: #a5d6a7;
      background: #ffffff;
    }
    .action-output:hover { background: #e8f5e9; }

    .action-activity {
      color: #e65100;
      border-color: #ffcc80;
      background: #ffffff;
    }
    .action-activity:hover { background: #fff3e0; }

    .action-indicator {
      color: #7b1fa2;
      border-color: #ce93d8;
      background: #ffffff;
    }
    .action-indicator:hover { background: #f3e5f5; }

    .action-icon-btn {
      width: 32px;
      height: 32px;
      line-height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #757575;
    }
    .action-icon-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .action-icon-btn:hover { color: #1976d2; }
    .action-icon-btn.warn:hover { color: #d32f2f; }

    .panel-body {
      padding: 1rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Meta stats */
    .meta-stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 2rem;
      background: #fafafa;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: 1px solid #eeeeee;
    }

    .meta-stat {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
    }

    .meta-stat.full-width {
      width: 100%;
    }

    .meta-label {
      font-weight: 600;
      color: var(--text-secondary, #666);
    }

    .meta-val {
      color: var(--text-primary, #333);
    }

    .meta-val.highlight {
      font-weight: 700;
      color: #1565c0;
    }

    .assumptions-text {
      font-style: italic;
      color: #555;
    }

    /* Indicators chips */
    .indicators-section {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .section-tag {
      font-size: 0.78rem;
      font-weight: 600;
      color: #7b1fa2;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      text-transform: uppercase;
    }

    .section-tag mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .indicator-chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .custom-indicator-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.4rem 0.25rem 0.65rem;
      border-radius: 16px;
      background: #f3e5f5;
      border: 1px solid #e1bee7;
      color: #4a148c;
      font-size: 0.8125rem;
    }

    .chip-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #7b1fa2;
    }

    .chip-target {
      color: #6a1b9a;
      font-weight: 500;
      margin-left: 0.25rem;
    }

    .chip-action-btn {
      width: 24px;
      height: 24px;
      line-height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #7b1fa2;
    }
    .chip-action-btn mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .chip-action-btn.warn:hover { color: #c2185b; }

    /* Nested Child Section Container */
    .child-section-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.5rem;
      padding-left: 1rem;
      border-left: 3px solid #e0e0e0;
    }

    .child-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .child-section-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary, #333);
    }

    .count-badge {
      background: #eeeeee;
      color: #424242;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 10px;
    }

    .btn-inline-add {
      font-size: 0.78rem;
      height: 28px;
      line-height: 28px;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }

    .empty-nested-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #fafafa;
      border: 1px dashed #e0e0e0;
      border-radius: 6px;
      color: #757575;
      font-size: 0.8125rem;
    }
    .empty-nested-box mat-icon { font-size: 18px; width: 18px; height: 18px; color: #9e9e9e; }
    .empty-nested-box p { margin: 0; }

    /* Output Panel */
    .output-panel {
      border: 1px solid #c8e6c9 !important;
      border-radius: 6px !important;
      margin-bottom: 0.5rem;
    }

    .output-panel ::ng-deep .mat-expansion-panel-header {
      background: #f7fbf7;
      padding: 0.6rem 1rem;
      height: auto !important;
      min-height: 48px;
    }

    .output-body {
      padding: 0.75rem 0.5rem;
    }

    /* Activities Grid */
    .activities-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .activity-card {
      background: #ffffff;
      border: 1px solid #ffe0b2;
      border-left: 4px solid #f57c00;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      transition: box-shadow 0.2s;
    }

    .activity-card:hover {
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .activity-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .activity-header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      min-width: 0;
    }

    .activity-name {
      font-weight: 500;
      color: var(--text-primary, #333);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-actions {
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .activity-desc {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--text-secondary, #666);
      line-height: 1.4;
    }

    .activity-meta-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.55rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .meta-pill mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .meta-pill.budget { background: #e8f5e9; color: #2e7d32; }
    .meta-pill.target { background: #e3f2fd; color: #1565c0; }
    .meta-pill.unit { background: #f5f5f5; color: #616161; }
  `,
})
export default class LogframeComponent {
  readonly logframe = input<LogframeDto | null>(null);
  readonly projectId = input<string>('');

  private readonly dialog = inject(MatDialog);
  private readonly rfService = inject(ResultsFrameworkService);
  private readonly notificationService = inject(NotificationService);
  private readonly store = inject(Store);

  private getEffectiveProjectId(): string {
    return this.projectId() || this.logframe()?.projectId || '';
  }

  private refresh(): void {
    const id = this.getEffectiveProjectId();
    if (id) {
      this.store.dispatch(ProjectActions.loadLogframe({ projectId: id }));
    }
  }

  // --- Outcome Actions ---

  openCreateOutcomeDialog(): void {
    const pId = this.getEffectiveProjectId();
    if (!pId) return;

    const ref = this.dialog.open(OutcomeDialogComponent, {
      width: '560px',
      data: { mode: 'create', projectId: pId } as OutcomeDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.createOutcome(pId, { ...result, projectId: pId }).subscribe({
          next: () => {
            this.notificationService.success('Outcome created successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to create outcome');
          },
        });
      }
    });
  }

  openEditOutcomeDialog(outcome: LogframeOutcomeDto): void {
    const pId = this.getEffectiveProjectId();
    if (!pId) return;

    const ref = this.dialog.open(OutcomeDialogComponent, {
      width: '560px',
      data: {
        mode: 'edit',
        projectId: pId,
        outcome: {
          id: outcome.id,
          code: outcome.code,
          description: outcome.description,
          baselineValue: outcome.baselineValue,
          targetValue: outcome.targetValue,
          assumptions: outcome.assumptions,
        },
      } as OutcomeDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.updateOutcome(pId, outcome.id, {
          outcomeId: outcome.id,
          code: outcome.code,
          description: result.description,
          baselineValue: result.baselineValue,
          targetValue: result.targetValue,
          assumptions: result.assumptions,
        }).subscribe({
          next: () => {
            this.notificationService.success('Outcome updated successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to update outcome');
          },
        });
      }
    });
  }

  deleteOutcome(outcome: LogframeOutcomeDto): void {
    const pId = this.getEffectiveProjectId();
    if (!pId) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Outcome',
        message: `Are you sure you want to delete outcome "${outcome.code}: ${outcome.description}"? This cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.rfService.deleteOutcome(pId, outcome.id).subscribe({
          next: () => {
            this.notificationService.success(`Outcome ${outcome.code} deleted`);
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to delete outcome');
          },
        });
      }
    });
  }

  // --- Output Actions ---

  openCreateOutputDialog(outcome: LogframeOutcomeDto): void {
    const ref = this.dialog.open(OutputDialogComponent, {
      width: '560px',
      data: {
        mode: 'create',
        outcomeId: outcome.id,
        outcomeCode: outcome.code,
      } as OutputDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.createOutput(outcome.id, { ...result, outcomeId: outcome.id }).subscribe({
          next: () => {
            this.notificationService.success('Output added successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to create output');
          },
        });
      }
    });
  }

  openEditOutputDialog(output: LogframeOutputDto): void {
    const ref = this.dialog.open(OutputDialogComponent, {
      width: '560px',
      data: {
        mode: 'edit',
        outcomeId: '',
        output: {
          id: output.id,
          code: output.code,
          description: output.description,
          baselineValue: output.baselineValue,
          targetValue: output.targetValue,
          assumptions: output.assumptions,
        },
      } as OutputDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.updateOutput('', output.id, {
          outputId: output.id,
          code: output.code,
          description: result.description,
          baselineValue: result.baselineValue,
          targetValue: result.targetValue,
          assumptions: result.assumptions,
        }).subscribe({
          next: () => {
            this.notificationService.success('Output updated successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to update output');
          },
        });
      }
    });
  }

  deleteOutput(output: LogframeOutputDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Output',
        message: `Are you sure you want to delete output "${output.code}: ${output.description}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.rfService.deleteOutput('', output.id).subscribe({
          next: () => {
            this.notificationService.success(`Output ${output.code} deleted`);
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to delete output');
          },
        });
      }
    });
  }

  // --- Activity Actions ---

  openCreateActivityDialog(output: LogframeOutputDto): void {
    const ref = this.dialog.open(ActivityDialogComponent, {
      width: '560px',
      data: {
        mode: 'create',
        outputId: output.id,
        outputCode: output.code,
      } as ActivityDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.createActivity(output.id, { ...result, outputId: output.id }).subscribe({
          next: () => {
            this.notificationService.success('Activity added successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to create activity');
          },
        });
      }
    });
  }

  openEditActivityDialog(output: LogframeOutputDto, activity: LogframeActivityDto): void {
    const ref = this.dialog.open(ActivityDialogComponent, {
      width: '560px',
      data: {
        mode: 'edit',
        outputId: output.id,
        outputCode: output.code,
        activity: {
          id: activity.id,
          code: activity.code,
          name: activity.name,
          description: activity.description,
          unit: activity.unit,
          lifetimeTarget: activity.lifetimeTarget,
          budgetAllocated: activity.budgetAllocated,
        },
      } as ActivityDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.updateActivity(output.id, activity.id, {
          activityId: activity.id,
          code: activity.code,
          name: result.name,
          description: result.description,
          unit: result.unit,
          lifetimeTarget: result.lifetimeTarget,
          budgetAllocated: result.budgetAllocated,
        }).subscribe({
          next: () => {
            this.notificationService.success('Activity updated successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to update activity');
          },
        });
      }
    });
  }

  deleteActivity(output: LogframeOutputDto, activity: LogframeActivityDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Activity',
        message: `Are you sure you want to delete activity "${activity.code}: ${activity.name}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.rfService.deleteActivity(output.id, activity.id).subscribe({
          next: () => {
            this.notificationService.success(`Activity ${activity.code} deleted`);
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to delete activity');
          },
        });
      }
    });
  }

  // --- Indicator Actions ---

  openCreateOutcomeIndicatorDialog(outcome: LogframeOutcomeDto): void {
    const pId = this.getEffectiveProjectId();
    if (!pId) return;

    const ref = this.dialog.open(IndicatorDialogComponent, {
      width: '560px',
      data: {
        mode: 'create',
        projectId: pId,
        outcomeId: outcome.id,
        parentLabel: `Outcome ${outcome.code}`,
      } as IndicatorDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.createIndicator(pId, {
          ...result,
          projectId: pId,
          outcomeId: outcome.id,
        }).subscribe({
          next: () => {
            this.notificationService.success('Indicator added successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to add indicator');
          },
        });
      }
    });
  }

  openCreateOutputIndicatorDialog(output: LogframeOutputDto): void {
    const pId = this.getEffectiveProjectId();
    if (!pId) return;

    const ref = this.dialog.open(IndicatorDialogComponent, {
      width: '560px',
      data: {
        mode: 'create',
        projectId: pId,
        outputId: output.id,
        parentLabel: `Output ${output.code}`,
      } as IndicatorDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.createIndicator(pId, {
          ...result,
          projectId: pId,
          outputId: output.id,
        }).subscribe({
          next: () => {
            this.notificationService.success('Indicator added successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to add indicator');
          },
        });
      }
    });
  }

  openEditIndicatorDialog(indicator: IndicatorDto): void {
    const pId = this.getEffectiveProjectId();
    if (!pId) return;

    const ref = this.dialog.open(IndicatorDialogComponent, {
      width: '560px',
      data: {
        mode: 'edit',
        projectId: pId,
        indicator: {
          id: indicator.id,
          code: indicator.code,
          name: indicator.name,
          description: indicator.description,
          baselineValue: indicator.baselineValue,
          targetValue: indicator.targetValue,
          dataSource: indicator.dataSource,
          collectionFrequency: indicator.collectionFrequency,
        },
      } as IndicatorDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.rfService.updateIndicator(pId, indicator.id, {
          indicatorId: indicator.id,
          code: indicator.code,
          name: result.name,
          description: result.description,
          baselineValue: result.baselineValue,
          targetValue: result.targetValue,
          dataSource: result.dataSource,
          collectionFrequency: result.collectionFrequency,
        }).subscribe({
          next: () => {
            this.notificationService.success('Indicator updated successfully');
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to update indicator');
          },
        });
      }
    });
  }

  deleteIndicator(indicator: IndicatorDto): void {
    const pId = this.getEffectiveProjectId();
    if (!pId) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Indicator',
        message: `Are you sure you want to delete indicator "${indicator.code}: ${indicator.name}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.rfService.deleteIndicator(pId, indicator.id).subscribe({
          next: () => {
            this.notificationService.success(`Indicator ${indicator.code} deleted`);
            this.refresh();
          },
          error: (err) => {
            this.notificationService.error(err?.error?.message || 'Failed to delete indicator');
          },
        });
      }
    });
  }
}
