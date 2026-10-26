import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { RiskActions } from '../../store/risk.actions';
import { selectMatrixItems, selectRiskLoading } from '../../store/risk.selectors';
import { Likelihood, Impact, RiskMatrixItemDto } from '../../models/risk.model';

@Component({
  selector: 'ethel-risk-matrix',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'risk.matrix.title' | translate"></app-page-header>

    <div class="matrix-container">
      <!-- Project Input -->
      <div class="project-input">
        <mat-form-field appearance="outline" class="project-field">
          <mat-label>{{ 'risk.fields.projectId' | translate }}</mat-label>
          <input matInput [value]="projectId()" (input)="onProjectIdInput($event)" />
        </mat-form-field>
        <button mat-flat-button color="primary" [disabled]="!projectId() || loading()" (click)="onLoadMatrix()">
          <mat-icon>grid_on</mat-icon>
          {{ 'risk.matrix.loadButton' | translate }}
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (matrixItems().length > 0) {
        <!-- 5x5 Matrix Grid -->
        <div class="matrix-wrapper">
          <div class="y-axis-label">{{ 'risk.fields.likelihood' | translate }}</div>
          <div class="matrix-with-labels">
            <div class="y-axis">
              @for (l of likelihoodRows; track l) {
                <div class="y-label">{{ l }}</div>
              }
            </div>
            <div class="grid-area">
              @for (l of likelihoodRows; track l; let rowIdx = $index) {
                @for (i of impactCols; track i; let colIdx = $index) {
                  <div class="matrix-cell"
                    [style.grid-row]="rowIdx + 1"
                    [style.grid-column]="colIdx + 1"
                    [style.background-color]="getCellColor(l, i)">
                    @for (item of getCellItems(l, i); track item.id) {
                      <mat-chip class="risk-chip" (click)="onRiskClick(item.id)">
                        {{ item.title }}
                      </mat-chip>
                    }
                  </div>
                }
              }
            </div>
          </div>
          <div class="x-axis">
            @for (i of impactCols; track i) {
              <div class="x-label">{{ i }}</div>
            }
          </div>
          <div class="x-axis-label">{{ 'risk.fields.impact' | translate }}</div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background-color: #4caf50"></div><span>1-4 (Low)</span></div>
          <div class="legend-item"><div class="legend-color" style="background-color: #ff9800"></div><span>5-9 (Medium)</span></div>
          <div class="legend-item"><div class="legend-color" style="background-color: #f44336"></div><span>10-14 (High)</span></div>
          <div class="legend-item"><div class="legend-color" style="background-color: #b71c1c"></div><span>15-25 (Critical)</span></div>
        </div>
      } @else if (projectId()) {
        <app-empty-state
          icon="grid_on"
          title="No risks in matrix"
          message="No risks found for this project.">
        </app-empty-state>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .matrix-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .project-input { display: flex; align-items: center; gap: 1rem; }
    .project-field { width: 320px; }
    .matrix-wrapper { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .y-axis-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--mat-sys-outline);
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      position: absolute;
      left: -2rem;
      top: 50%;
      translate: 0 -50%;
    }
    .matrix-with-labels {
      display: flex;
      gap: 0.5rem;
      position: relative;
    }
    .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
    .y-label {
      font-size: 11px;
      color: var(--mat-sys-outline);
      text-align: right;
      padding-right: 0.5rem;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .grid-area {
      display: grid;
      grid-template-columns: repeat(5, 140px);
      grid-template-rows: repeat(5, 120px);
      gap: 2px;
    }
    .matrix-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 6px;
      border-radius: 4px;
      overflow-y: auto;
      align-items: flex-start;
    }
    .risk-chip {
      cursor: pointer;
      font-size: 11px !important;
      min-height: 24px !important;
      padding: 0 8px !important;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .risk-chip:hover { opacity: 0.8; }
    .x-axis {
      display: grid;
      grid-template-columns: repeat(5, 140px);
      gap: 2px;
      margin-left: auto;
      width: fit-content;
    }
    .x-label {
      font-size: 11px;
      color: var(--mat-sys-outline);
      text-align: center;
      padding-top: 0.25rem;
    }
    .x-axis-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--mat-sys-outline);
      text-align: center;
    }
    .legend {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 1rem;
    }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 13px; }
    .legend-color { width: 20px; height: 20px; border-radius: 4px; }
  `,
})
export default class RiskMatrixComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly matrixItems = this.store.selectSignal(selectMatrixItems);
  readonly loading = this.store.selectSignal(selectRiskLoading);

  readonly projectId = signal('');

  // Y-axis top→bottom: VeryHigh→VeryLow
  readonly likelihoodRows: Likelihood[] = ['VeryHigh', 'High', 'Medium', 'Low', 'VeryLow'];
  // X-axis left→right: Negligible→Catastrophic
  readonly impactCols: Impact[] = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

  private readonly likelihoodScores: Record<Likelihood, number> = {
    VeryLow: 1,
    Low: 2,
    Medium: 3,
    High: 4,
    VeryHigh: 5,
  };

  private readonly impactScores: Record<Impact, number> = {
    Negligible: 1,
    Minor: 2,
    Moderate: 3,
    Major: 4,
    Catastrophic: 5,
  };

  onProjectIdInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectId.set(value);
  }

  onLoadMatrix(): void {
    if (!this.projectId()) return;
    this.store.dispatch(RiskActions.loadMatrix({ projectId: this.projectId() }));
  }

  getCellItems(likelihood: Likelihood, impact: Impact): RiskMatrixItemDto[] {
    return this.matrixItems().filter(
      (item) => item.likelihood === likelihood && item.impact === impact
    );
  }

  getCellColor(likelihood: Likelihood, impact: Impact): string {
    const score = this.likelihoodScores[likelihood] * this.impactScores[impact];
    if (score <= 4) return '#e8f5e9';   // green
    if (score <= 9) return '#fff9c4';   // yellow
    if (score <= 14) return '#fff3e0';  // orange
    return '#ffebee';                    // red
  }

  onRiskClick(id: string): void {
    this.router.navigate(['/risk', id]);
  }
}
