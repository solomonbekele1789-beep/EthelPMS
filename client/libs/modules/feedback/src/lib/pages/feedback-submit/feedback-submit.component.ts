import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, NotificationService } from '@ethelpms/shared/ui';
import { FeedbackActions } from '../../store/feedback.actions';
import { selectCategories } from '../../store/feedback.selectors';
import {
  FeedbackType,
  FeedbackPriority,
  FeedbackChannel,
  SubmitFeedbackRequest,
} from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'ethel-feedback-submit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'feedback.feedback.submit' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.category' | translate }}</mat-label>
            <mat-select formControlName="feedbackCategoryId">
              <mat-option [value]="''">-- None --</mat-option>
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.type' | translate }}</mat-label>
            <mat-select formControlName="type">
              @for (t of types; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
            @if (form.controls.type.hasError('required')) {
              <mat-error>Type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.priority' | translate }}</mat-label>
            <mat-select formControlName="priority">
              @for (p of priorities; track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
            @if (form.controls.priority.hasError('required')) {
              <mat-error>Priority is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.channel' | translate }}</mat-label>
            <mat-select formControlName="channel">
              @for (ch of channels; track ch) {
                <mat-option [value]="ch">{{ ch }}</mat-option>
              }
            </mat-select>
            @if (form.controls.channel.hasError('required')) {
              <mat-error>Channel is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'feedback.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="4"></textarea>
            @if (form.controls.description.hasError('required')) {
              <mat-error>Description is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.submitterName' | translate }}</mat-label>
            <input matInput formControlName="submitterName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.submitterContact' | translate }}</mat-label>
            <input matInput formControlName="submitterContact" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.location' | translate }}</mat-label>
            <input matInput formControlName="location" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'feedback.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
          </mat-form-field>

          <div class="checkbox-row">
            <mat-checkbox formControlName="isAnonymous">
              {{ 'feedback.fields.isAnonymous' | translate }}
            </mat-checkbox>

            <mat-checkbox formControlName="isConfidential">
              {{ 'feedback.fields.isConfidential' | translate }}
            </mat-checkbox>
          </div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || submitting()">
            @if (submitting()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.submit' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 800px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .checkbox-row {
      grid-column: 1 / -1;
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class FeedbackSubmitComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly feedbackService = inject(FeedbackService);
  private readonly notification = inject(NotificationService);

  readonly categories = this.store.selectSignal(selectCategories);
  readonly submitting = signal(false);

  readonly types: FeedbackType[] = ['Complaint', 'Suggestion', 'Positive', 'Safeguarding', 'Query'];
  readonly priorities: FeedbackPriority[] = ['Low', 'Normal', 'High', 'Critical'];
  readonly channels: FeedbackChannel[] = ['Web', 'Mobile', 'InPerson', 'Phone', 'SuggestionBox', 'Other'];

  readonly form = this.fb.nonNullable.group({
    feedbackCategoryId: [''],
    type: ['' as string, [Validators.required]],
    priority: ['Normal' as string, [Validators.required]],
    channel: ['' as string, [Validators.required]],
    description: ['', [Validators.required]],
    submitterName: [''],
    submitterContact: [''],
    isAnonymous: [false],
    isConfidential: [false],
    location: [''],
    projectId: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(FeedbackActions.loadCategories());
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const value = this.form.getRawValue();
    const request: SubmitFeedbackRequest = {
      feedbackCategoryId: value.feedbackCategoryId || undefined,
      type: value.type as FeedbackType,
      priority: value.priority as FeedbackPriority,
      channel: value.channel as FeedbackChannel,
      description: value.description,
      submitterName: value.submitterName || undefined,
      submitterContact: value.submitterContact || undefined,
      isAnonymous: value.isAnonymous,
      isConfidential: value.isConfidential,
      location: value.location || undefined,
      projectId: value.projectId || undefined,
    };
    this.feedbackService.submitFeedback(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notification.success('Feedback submitted successfully');
        this.router.navigate(['/feedback']);
      },
      error: () => {
        this.submitting.set(false);
        this.notification.error('Failed to submit feedback');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/feedback']);
  }
}
