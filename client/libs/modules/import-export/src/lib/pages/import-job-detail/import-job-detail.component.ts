import { Component, ChangeDetectionStrategy, inject, signal, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ImportExportActions } from '../../store/import-export.actions';
import { selectSelectedJob, selectImportExportLoading } from '../../store/import-export.selectors';
import { ImportJobDto } from '../../models/import-job.model';

@Component({
  selector: 'ethel-import-job-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="job()?.fileName ?? ('importexport.imports.detail' | translate)">
      @if (job()) {
        <mat-chip [class.status-pending]="job()!.status === 'Pending'"
                  [class.status-validating]="job()!.status === 'Validating' || job()!.status === 'Validated'"
                  [class.status-processing]="job()!.status === 'Processing'"
                  [class.status-completed]="job()!.status === 'Completed'"
                  [class.status-errors]="job()!.status === 'CompletedWithErrors'"
                  [class.status-failed]="job()!.status === 'Failed'"
                  [class.status-cancelled]="job()!.status === 'Cancelled'">
          {{ job()!.status }}
        </mat-chip>
      }
    </app-page-header>

    @if (loading() && !job()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (job()) {
      <!-- Progress Bar -->
      @if (job()!.totalRows != null && job()!.processedRows != null) {
        <div class="progress-section">
          <div class="progress-label">
            {{ 'importexport.fields.progress' | translate }}:
            {{ job()!.processedRows }} / {{ job()!.totalRows }} rows
            ({{ progressPercent() | number:'1.0-0' }}%)
          </div>
          <mat-progress-bar
            mode="determinate"
            [value]="progressPercent()"
            [color]="job()!.status === 'Failed' ? 'warn' : 'primary'">
          </mat-progress-bar>
        </div>
      }

      <!-- Overview Cards -->
      <div class="detail-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.fileName' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>{{ job()!.fileName }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.fileSize' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>{{ (job()!.fileSize / 1024) | number:'1.1-1' }} KB</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.module' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>{{ job()!.module }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.entityType' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>{{ job()!.entityType }}</mat-card-content>
        </mat-card>

        @if (job()!.templateName) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'importexport.fields.template' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>{{ job()!.templateName }}</mat-card-content>
          </mat-card>
        }

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.status' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-chip [class.status-pending]="job()!.status === 'Pending'"
                      [class.status-validating]="job()!.status === 'Validating' || job()!.status === 'Validated'"
                      [class.status-processing]="job()!.status === 'Processing'"
                      [class.status-completed]="job()!.status === 'Completed'"
                      [class.status-errors]="job()!.status === 'CompletedWithErrors'"
                      [class.status-failed]="job()!.status === 'Failed'"
                      [class.status-cancelled]="job()!.status === 'Cancelled'">
              {{ job()!.status }}
            </mat-chip>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Row Stats -->
      <h3 class="section-title">{{ 'importexport.imports.rowStats' | translate }}</h3>
      <div class="detail-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.totalRows' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>{{ job()!.totalRows ?? '-' }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.processedRows' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>{{ job()!.processedRows ?? '-' }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.successRows' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content class="success-text">{{ job()!.successRows ?? '-' }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'importexport.fields.errorRows' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content class="error-text">{{ job()!.errorRows ?? '-' }}</mat-card-content>
        </mat-card>
      </div>

      <!-- Timestamps -->
      <h3 class="section-title">{{ 'importexport.imports.timestamps' | translate }}</h3>
      <div class="detail-grid">
        @if (job()!.startedAt) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'importexport.fields.startedAt' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>{{ job()!.startedAt | date:'medium' }}</mat-card-content>
          </mat-card>
        }
        @if (job()!.completedAt) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'importexport.fields.completedAt' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>{{ job()!.completedAt | date:'medium' }}</mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Actions -->
      <div class="action-buttons">
        @if (job()!.status === 'Pending' || job()!.status === 'Validating' || job()!.status === 'Processing') {
          <button mat-flat-button color="warn" *appHasPermission="'importexport.import.update'" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            {{ 'importexport.imports.cancel' | translate }}
          </button>
        }
        <button mat-button (click)="goBack()">
          {{ 'common.back' | translate }}
        </button>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .progress-section { margin-bottom: 1.5rem; }
    .progress-label { margin-bottom: 0.5rem; font-weight: 500; }
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
    .success-text { color: #388e3c; font-weight: 500; }
    .error-text { color: #d32f2f; font-weight: 500; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .status-pending { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-validating { --mdc-chip-elevated-container-color: #bbdefb; }
    .status-processing { --mdc-chip-elevated-container-color: #ffe0b2; }
    .status-completed { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-errors { --mdc-chip-elevated-container-color: #fff9c4; }
    .status-failed { --mdc-chip-elevated-container-color: #ffcdd2; }
    .status-cancelled { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class ImportJobDetailComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly job = this.store.selectSignal(selectSelectedJob);
  readonly loading = this.store.selectSignal(selectImportExportLoading);

  readonly progressPercent = signal(0);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(ImportExportActions.loadImportJob({ id }));
      }
    });

    effect(() => {
      const job = this.job();
      if (job && job.totalRows && job.processedRows != null) {
        this.progressPercent.set((job.processedRows / job.totalRows) * 100);
      } else {
        this.progressPercent.set(0);
      }
    });
  }

  onCancel(): void {
    this.store.dispatch(ImportExportActions.cancelImport({ id: this.id() }));
    this.notification.success('Import job cancelled');
  }

  goBack(): void {
    this.router.navigate(['/import-export/imports']);
  }
}
