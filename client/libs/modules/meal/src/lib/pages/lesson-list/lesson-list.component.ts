import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  SearchInputComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { LessonLearnedDto, CreateLessonLearnedRequest } from '../../models/lesson.model';
import { LessonService } from '../../services/lesson.service';

@Component({
  selector: 'ethel-lesson-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    SearchInputComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'meal.lessons.title' | translate">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <!-- Filters -->
      <div class="filters-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'meal.fields.projectId' | translate }}</mat-label>
          <input matInput [value]="projectIdFilter()" (change)="onProjectIdChange($event)" />
        </mat-form-field>
        <app-search-input placeholder="Filter by category..." (search)="onCategoryFilter($event)"></app-search-input>
        <button mat-flat-button color="primary" [disabled]="loadingLessons()" (click)="loadLessons()">
          @if (loadingLessons()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            Load
          }
        </button>
      </div>

      @if (loadingLessons()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (filteredLessons().length === 0) {
        <app-empty-state
          icon="lightbulb"
          title="No lessons learned"
          message="No lessons found. Add lessons from evaluations or project experiences.">
        </app-empty-state>
      } @else {
        <div class="card-list">
          @for (lesson of filteredLessons(); track lesson.id) {
            <mat-card class="lesson-card">
              <mat-card-header>
                <mat-card-title>{{ lesson.title }}</mat-card-title>
                @if (lesson.category) {
                  <mat-card-subtitle>{{ 'meal.lessons.category' | translate }}: {{ lesson.category }}</mat-card-subtitle>
                }
              </mat-card-header>
              <mat-card-content>
                <p class="lesson-description">{{ lesson.description }}</p>

                @if (lesson.context) {
                  <div class="lesson-field">
                    <strong>{{ 'meal.lessons.context' | translate }}:</strong>
                    <p>{{ lesson.context }}</p>
                  </div>
                }

                @if (lesson.actionTaken) {
                  <div class="lesson-field">
                    <strong>{{ 'meal.lessons.actionTaken' | translate }}:</strong>
                    <p>{{ lesson.actionTaken }}</p>
                  </div>
                }

                @if (lesson.impact) {
                  <div class="lesson-field">
                    <strong>{{ 'meal.lessons.impact' | translate }}:</strong>
                    <p>{{ lesson.impact }}</p>
                  </div>
                }

                @if (lesson.recommendedAction) {
                  <div class="lesson-field">
                    <strong>{{ 'meal.lessons.recommendedAction' | translate }}:</strong>
                    <p>{{ lesson.recommendedAction }}</p>
                  </div>
                }

                <p class="meta-text">Created: {{ lesson.createdAt | date:'mediumDate' }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      <!-- Add Lesson Form -->
      @if (showForm()) {
        <div class="inline-form">
          <h4>{{ 'meal.lessons.add' | translate }}</h4>
          <form [formGroup]="form" (ngSubmit)="onAddLesson()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'meal.fields.projectId' | translate }}</mat-label>
                <input matInput formControlName="projectId" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'meal.fields.title' | translate }}</mat-label>
                <input matInput formControlName="title" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'meal.fields.description' | translate }}</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'meal.lessons.category' | translate }}</mat-label>
                <input matInput formControlName="category" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Evaluation ID (optional)</mat-label>
                <input matInput formControlName="evaluationId" />
              </mat-form-field>
            </div>

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
          {{ 'meal.lessons.add' | translate }}
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filters-row { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .filter-field { max-width: 300px; }
    .card-list { display: flex; flex-direction: column; gap: 1rem; }
    .lesson-card { margin-bottom: 0; }
    .lesson-description { margin: 0.5rem 0; }
    .lesson-field { margin-top: 0.5rem; }
    .lesson-field p { margin: 0.25rem 0 0; }
    .meta-text { font-size: 0.875rem; color: rgba(0, 0, 0, 0.6); margin-top: 0.75rem; }
    .inline-form {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
    .full-width { width: 100%; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
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
export default class LessonListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly lessonService = inject(LessonService);
  private readonly notification = inject(NotificationService);

  readonly projectIdFilter = signal('');
  readonly categoryFilter = signal('');
  readonly lessons = signal<LessonLearnedDto[]>([]);
  readonly loadingLessons = signal(false);
  readonly showForm = signal(false);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    projectId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: [''],
    evaluationId: [''],
  });

  readonly filteredLessons = signal<LessonLearnedDto[]>([]);

  constructor() {
    // Reactive filtering via effect
    effect(() => {
      const all = this.lessons();
      const cat = this.categoryFilter().toLowerCase();
      let filtered = all;
      if (cat) {
        filtered = filtered.filter(
          l => l.category?.toLowerCase().includes(cat) || l.title.toLowerCase().includes(cat)
        );
      }
      this.filteredLessons.set(filtered);
    });
  }

  ngOnInit(): void {
    this.loadLessons();
  }

  onProjectIdChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.projectIdFilter.set(input.value);
  }

  onCategoryFilter(term: string): void {
    this.categoryFilter.set(term);
  }

  loadLessons(): void {
    this.loadingLessons.set(true);
    const pid = this.projectIdFilter() || undefined;
    this.lessonService.listLessons(pid).subscribe({
      next: (data) => {
        this.lessons.set(data);
        this.loadingLessons.set(false);
      },
      error: () => {
        this.loadingLessons.set(false);
        this.notification.error('Failed to load lessons');
      },
    });
  }

  onShowForm(): void {
    this.showForm.set(true);
    if (this.projectIdFilter()) {
      this.form.patchValue({ projectId: this.projectIdFilter() });
    }
  }

  onAddLesson(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    const request: CreateLessonLearnedRequest = {
      projectId: value.projectId,
      title: value.title,
      description: value.description,
      category: value.category || undefined,
      evaluationId: value.evaluationId || undefined,
    };
    this.lessonService.createLesson(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ projectId: '', title: '', description: '', category: '', evaluationId: '' });
        this.notification.success('Lesson created');
        this.loadLessons();
      },
      error: () => {
        this.saving.set(false);
        this.notification.error('Failed to create lesson');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/meal']);
  }
}
