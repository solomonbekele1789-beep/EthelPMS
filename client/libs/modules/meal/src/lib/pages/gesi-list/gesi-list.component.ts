import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
import { GesiAssessmentDto, CreateGesiAssessmentRequest } from '../../models/gesi.model';
import { GesiService } from '../../services/gesi.service';

@Component({
  selector: 'ethel-gesi-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'meal.gesi.title' | translate">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <!-- Project ID Input -->
      <div class="project-filter">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'meal.fields.projectId' | translate }}</mat-label>
          <input matInput [value]="projectId()" (change)="onProjectIdChange($event)" />
        </mat-form-field>
        <button mat-flat-button color="primary" [disabled]="!projectId() || loadingAssessments()" (click)="loadAssessments()">
          @if (loadingAssessments()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            Load
          }
        </button>
      </div>

      @if (loadingAssessments()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (assessments().length === 0 && projectId()) {
        <app-empty-state
          icon="people"
          title="No GESI assessments"
          message="No assessments found for this project.">
        </app-empty-state>
      } @else {
        <div class="card-list">
          @for (assessment of assessments(); track assessment.id) {
            <mat-card class="assessment-card">
              <mat-card-header>
                <mat-card-title>
                  <div class="score-header">
                    <span class="score-label">{{ 'meal.gesi.score' | translate }}:</span>
                    <div class="gender-marker" [class]="'marker-' + assessment.genderMarkerScore">
                      {{ assessment.genderMarkerScore }}
                    </div>
                  </div>
                </mat-card-title>
                <mat-card-subtitle>{{ 'meal.gesi.date' | translate }}: {{ assessment.assessmentDate | date:'mediumDate' }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                @if (assessment.keyFindings) {
                  <div class="card-section">
                    <strong>{{ 'meal.gesi.findings' | translate }}</strong>
                    <p>{{ assessment.keyFindings }}</p>
                  </div>
                }
                @if (assessment.recommendations) {
                  <div class="card-section">
                    <strong>{{ 'meal.gesi.recommendations' | translate }}</strong>
                    <p>{{ assessment.recommendations }}</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      <!-- Add Assessment Form -->
      @if (showForm()) {
        <div class="inline-form">
          <h4>{{ 'meal.gesi.add' | translate }}</h4>
          <form [formGroup]="form" (ngSubmit)="onAddAssessment()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'meal.fields.projectId' | translate }}</mat-label>
                <input matInput formControlName="projectId" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'meal.gesi.score' | translate }} (0-4)</mat-label>
                <mat-select formControlName="genderMarkerScore">
                  @for (score of scoreOptions; track score) {
                    <mat-option [value]="score">{{ score }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'meal.gesi.date' | translate }}</mat-label>
                <input matInput formControlName="assessmentDate" type="date" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'meal.gesi.analysis' | translate }}</mat-label>
              <textarea matInput formControlName="analysis" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'meal.gesi.justification' | translate }}</mat-label>
              <textarea matInput formControlName="justification" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="showForm.set(false)">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.add' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      } @else {
        <button mat-stroked-button class="add-btn" (click)="onShowForm()">
          <mat-icon>add</mat-icon>
          {{ 'meal.gesi.add' | translate }}
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .project-filter { display: flex; align-items: flex-start; gap: 1rem; }
    .project-filter mat-form-field { flex: 1; max-width: 400px; }
    .card-list { display: flex; flex-direction: column; gap: 1rem; }
    .assessment-card { margin-bottom: 0; }
    .score-header { display: flex; align-items: center; gap: 0.5rem; }
    .score-label { font-size: 0.875rem; }
    .gender-marker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 1rem;
      color: #fff;
    }
    .marker-0 { background: #9e9e9e; }
    .marker-1 { background: #f44336; }
    .marker-2 { background: #ff9800; }
    .marker-3 { background: #4caf50; }
    .marker-4 { background: #2196f3; }
    .card-section { margin-top: 0.5rem; }
    .card-section p { margin: 0.25rem 0 0; }
    .inline-form {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .full-width { width: 100%; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .add-btn { margin-top: 0.5rem; }
  `,
})
export default class GesiListComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly gesiService = inject(GesiService);
  private readonly notification = inject(NotificationService);

  readonly projectId = signal('');
  readonly assessments = signal<GesiAssessmentDto[]>([]);
  readonly loadingAssessments = signal(false);
  readonly showForm = signal(false);
  readonly saving = signal(false);

  readonly scoreOptions = [0, 1, 2, 3, 4];

  readonly form = this.fb.nonNullable.group({
    projectId: ['', [Validators.required]],
    genderMarkerScore: [0, [Validators.required, Validators.min(0), Validators.max(4)]],
    assessmentDate: ['', [Validators.required]],
    analysis: [''],
    justification: [''],
  });

  onProjectIdChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.projectId.set(input.value);
  }

  loadAssessments(): void {
    const pid = this.projectId();
    if (!pid) return;
    this.loadingAssessments.set(true);
    this.gesiService.listAssessments(pid).subscribe({
      next: (data) => {
        this.assessments.set(data);
        this.loadingAssessments.set(false);
      },
      error: () => {
        this.loadingAssessments.set(false);
        this.notification.error('Failed to load GESI assessments');
      },
    });
  }

  onShowForm(): void {
    this.showForm.set(true);
    if (this.projectId()) {
      this.form.patchValue({ projectId: this.projectId() });
    }
  }

  onAddAssessment(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    const request: CreateGesiAssessmentRequest = {
      projectId: value.projectId,
      genderMarkerScore: value.genderMarkerScore,
      assessmentDate: value.assessmentDate,
      analysis: value.analysis || undefined,
      justification: value.justification || undefined,
    };
    this.gesiService.createAssessment(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ projectId: '', genderMarkerScore: 0, assessmentDate: '', analysis: '', justification: '' });
        this.notification.success('Assessment created');
        // Reload if we have a project ID
        if (this.projectId()) {
          this.loadAssessments();
        }
      },
      error: () => {
        this.saving.set(false);
        this.notification.error('Failed to create assessment');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/meal']);
  }
}
