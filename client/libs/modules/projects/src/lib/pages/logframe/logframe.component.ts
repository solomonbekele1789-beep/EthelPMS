import { Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LogframeDto } from '../../models/logframe.model';

@Component({
  selector: 'ethel-logframe',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    CurrencyPipe,
    TranslatePipe,
  ],
  template: `
    @if (logframe()) {
      <h3>{{ 'projects.logframe.title' | translate }}: {{ logframe()!.projectCode }} - {{ logframe()!.projectName }}</h3>

      <!-- Level 1: Outcomes -->
      @for (outcome of logframe()!.outcomes; track outcome.id) {
        <mat-expansion-panel class="outcome-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="level-icon outcome-icon">flag</mat-icon>
              <span class="level-label">{{ 'projects.logframe.outcomes' | translate }}:</span>
              <strong>{{ outcome.code }}</strong> - {{ outcome.description }}
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="panel-body">
            @if (outcome.assumptions) {
              <p class="assumptions"><em>Assumptions: {{ outcome.assumptions }}</em></p>
            }

            <!-- Outcome Indicators -->
            @if (outcome.indicators.length > 0) {
              <div class="indicators-section">
                <span class="indicator-label">{{ 'projects.logframe.indicators' | translate }}:</span>
                <mat-chip-set>
                  @for (indicator of outcome.indicators; track indicator.id) {
                    <mat-chip>
                      <mat-icon matChipAvatar>insights</mat-icon>
                      {{ indicator.code }}: {{ indicator.name }}
                    </mat-chip>
                  }
                </mat-chip-set>
              </div>
            }

            <!-- Level 2: Outputs -->
            @for (output of outcome.outputs; track output.id) {
              <mat-expansion-panel class="output-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon class="level-icon output-icon">inventory_2</mat-icon>
                    <span class="level-label">{{ 'projects.logframe.outputs' | translate }}:</span>
                    <strong>{{ output.code }}</strong> - {{ output.description }}
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="panel-body">
                  @if (output.assumptions) {
                    <p class="assumptions"><em>Assumptions: {{ output.assumptions }}</em></p>
                  }

                  <!-- Output Indicators -->
                  @if (output.indicators.length > 0) {
                    <div class="indicators-section">
                      <span class="indicator-label">{{ 'projects.logframe.indicators' | translate }}:</span>
                      <mat-chip-set>
                        @for (indicator of output.indicators; track indicator.id) {
                          <mat-chip>
                            <mat-icon matChipAvatar>insights</mat-icon>
                            {{ indicator.code }}: {{ indicator.name }}
                          </mat-chip>
                        }
                      </mat-chip-set>
                    </div>
                  }

                  <!-- Level 3: Activities -->
                  @for (activity of output.activities; track activity.id) {
                    <mat-expansion-panel class="activity-panel">
                      <mat-expansion-panel-header>
                        <mat-panel-title>
                          <mat-icon class="level-icon activity-icon">task</mat-icon>
                          <span class="level-label">{{ 'projects.logframe.activities' | translate }}:</span>
                          <strong>{{ activity.code }}</strong> - {{ activity.name }}
                        </mat-panel-title>
                      </mat-expansion-panel-header>

                      <div class="panel-body activity-details">
                        @if (activity.budgetAllocated) {
                          <div class="detail-item">
                            <span class="detail-label">Budget:</span>
                            <span>{{ activity.budgetAllocated | currency:'USD':'symbol':'1.0-0' }}</span>
                          </div>
                        }
                        @if (activity.unit) {
                          <div class="detail-item">
                            <span class="detail-label">Unit:</span>
                            <span>{{ activity.unit }}</span>
                          </div>
                        }
                        @if (activity.lifetimeTarget) {
                          <div class="detail-item">
                            <span class="detail-label">Target:</span>
                            <span>{{ activity.lifetimeTarget }}</span>
                          </div>
                        }
                      </div>
                    </mat-expansion-panel>
                  }
                </div>
              </mat-expansion-panel>
            }
          </div>
        </mat-expansion-panel>
      }
    }
  `,
  styles: `
    :host { display: block; }
    h3 {
      font-size: 1.125rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    .outcome-panel { margin-bottom: 0.75rem; }
    .output-panel {
      margin-top: 0.75rem;
      margin-left: 1.5rem;
    }
    .activity-panel {
      margin-top: 0.5rem;
      margin-left: 1.5rem;
    }
    .panel-body { padding: 0.5rem 0; }
    .level-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 0.5rem;
    }
    .outcome-icon { color: #1565c0; }
    .output-icon { color: #2e7d32; }
    .activity-icon { color: #e65100; }
    .level-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-secondary, #666);
      margin-right: 0.5rem;
    }
    .assumptions {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      margin: 0.25rem 0 0.75rem;
    }
    .indicators-section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .indicator-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary, #666);
    }
    .activity-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .detail-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary, #666);
    }
  `,
})
export default class LogframeComponent {
  readonly logframe = input<LogframeDto | null>(null);
}
