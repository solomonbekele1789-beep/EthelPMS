import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ParticipantsActions } from '../../store/participants.actions';
import { selectPipeline, selectParticipantsLoading } from '../../store/participants.selectors';

@Component({
  selector: 'ethel-graduation-pipeline',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    DecimalPipe,
    PercentPipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'participants.graduation.pipeline' | translate">
      <button mat-button (click)="onParticipants()">
        <mat-icon>people</mat-icon>
        {{ 'participants.title' | translate }}
      </button>
      <button mat-button (click)="onBenchmarks()">
        <mat-icon>tune</mat-icon>
        {{ 'participants.graduation.benchmarks' | translate }}
      </button>
      <button mat-button (click)="onDecisions()">
        <mat-icon>gavel</mat-icon>
        {{ 'participants.graduation.decisions' | translate }}
      </button>
    </app-page-header>

    <div class="page-container">
      <mat-form-field appearance="outline" class="project-input">
        <mat-label>{{ 'participants.fields.projectId' | translate }}</mat-label>
        <input matInput [value]="projectId()" (keyup.enter)="onLoadPipeline($event)" (input)="onProjectIdInput($event)" />
        <button matSuffix mat-icon-button (click)="loadPipeline()" [disabled]="!projectId()">
          <mat-icon>search</mat-icon>
        </button>
      </mat-form-field>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (pipeline()) {
        <!-- Summary Stats -->
        <div class="summary-row">
          <mat-card class="summary-card">
            <mat-card-header><mat-card-title>{{ 'participants.graduation.totalParticipants' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>
              <span class="big-number">{{ pipeline()!.totalParticipants | number }}</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card graduation-rate-card">
            <mat-card-header><mat-card-title>{{ 'participants.graduation.graduationRate' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>
              <span class="big-number accent">{{ pipeline()!.graduationRate / 100 | percent:'1.1-1' }}</span>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Pipeline Stages -->
        <div class="pipeline-row">
          <mat-card class="stage-card p1">
            <mat-card-header><mat-card-title>P1</mat-card-title></mat-card-header>
            <mat-card-content>
              <span class="stage-count">{{ pipeline()!.p1Count | number }}</span>
              <span class="stage-pct">{{ getPercentage(pipeline()!.p1Count) | percent:'1.0-0' }}</span>
            </mat-card-content>
          </mat-card>
          <mat-icon class="arrow-icon">arrow_forward</mat-icon>

          <mat-card class="stage-card p2">
            <mat-card-header><mat-card-title>P2</mat-card-title></mat-card-header>
            <mat-card-content>
              <span class="stage-count">{{ pipeline()!.p2Count | number }}</span>
              <span class="stage-pct">{{ getPercentage(pipeline()!.p2Count) | percent:'1.0-0' }}</span>
            </mat-card-content>
          </mat-card>
          <mat-icon class="arrow-icon">arrow_forward</mat-icon>

          <mat-card class="stage-card p3">
            <mat-card-header><mat-card-title>P3</mat-card-title></mat-card-header>
            <mat-card-content>
              <span class="stage-count">{{ pipeline()!.p3Count | number }}</span>
              <span class="stage-pct">{{ getPercentage(pipeline()!.p3Count) | percent:'1.0-0' }}</span>
            </mat-card-content>
          </mat-card>
          <mat-icon class="arrow-icon">arrow_forward</mat-icon>

          <mat-card class="stage-card p4">
            <mat-card-header><mat-card-title>P4</mat-card-title></mat-card-header>
            <mat-card-content>
              <span class="stage-count">{{ pipeline()!.p4Count | number }}</span>
              <span class="stage-pct">{{ getPercentage(pipeline()!.p4Count) | percent:'1.0-0' }}</span>
            </mat-card-content>
          </mat-card>
          <mat-icon class="arrow-icon">arrow_forward</mat-icon>

          <mat-card class="stage-card graduated">
            <mat-card-header><mat-card-title>{{ 'participants.graduation.graduated' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content>
              <span class="stage-count">{{ pipeline()!.graduatedCount | number }}</span>
              <span class="stage-pct">{{ getPercentage(pipeline()!.graduatedCount) | percent:'1.0-0' }}</span>
            </mat-card-content>
          </mat-card>
        </div>
      } @else if (!projectId()) {
        <app-empty-state icon="school" title="Select a project" message="Enter a project ID to view the graduation pipeline."></app-empty-state>
      } @else {
        <app-empty-state icon="school" title="No pipeline data" message="No graduation pipeline data found for this project."></app-empty-state>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .project-input { max-width: 400px; }
    .summary-row {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .summary-card {
      flex: 1;
      min-width: 200px;
      text-align: center;
    }
    .big-number {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .big-number.accent { color: #4caf50; }
    .graduation-rate-card { border-left: 4px solid #4caf50; }
    .pipeline-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.5rem 0;
    }
    .stage-card {
      flex: 1;
      min-width: 120px;
      text-align: center;
      border-top: 4px solid;
    }
    .stage-card.p1 { border-top-color: #f44336; }
    .stage-card.p2 { border-top-color: #ff9800; }
    .stage-card.p3 { border-top-color: #ffc107; }
    .stage-card.p4 { border-top-color: #4caf50; }
    .stage-card.graduated { border-top-color: #2196f3; }
    .stage-count {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
    }
    .stage-pct {
      display: block;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.54);
      margin-top: 0.25rem;
    }
    .arrow-icon {
      color: rgba(0, 0, 0, 0.38);
      flex-shrink: 0;
    }
  `,
})
export default class GraduationPipelineComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly pipeline = this.store.selectSignal(selectPipeline);
  readonly loading = this.store.selectSignal(selectParticipantsLoading);

  readonly projectId = signal('');

  ngOnInit(): void {
    // Pipeline requires a projectId, so we wait for user input
  }

  onProjectIdInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectId.set(value);
  }

  onLoadPipeline(event: Event): void {
    event.preventDefault();
    this.loadPipeline();
  }

  loadPipeline(): void {
    const pid = this.projectId();
    if (!pid) return;
    this.store.dispatch(ParticipantsActions.loadPipeline({ projectId: pid }));
  }

  getPercentage(count: number): number {
    const total = this.pipeline()?.totalParticipants ?? 0;
    return total > 0 ? count / total : 0;
  }

  onParticipants(): void {
    this.router.navigate(['/participants']);
  }

  onBenchmarks(): void {
    this.router.navigate(['/participants/graduation/benchmarks']);
  }

  onDecisions(): void {
    this.router.navigate(['/participants/graduation/decisions']);
  }
}
