import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { KnowledgeActions } from '../../store/knowledge.actions';
import { selectCategories, selectKnowledgeLoading } from '../../store/knowledge.selectors';
import { ArticleType, CreateArticleRequest } from '../../models/article.model';

@Component({
  selector: 'ethel-article-create',
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
    TranslatePipe,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'knowledge.articles.create' | translate">
      <button mat-stroked-button (click)="onCancel()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="edit-form">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'knowledge.fields.title' | translate }}</mat-label>
              <input matInput formControlName="title" />
              @if (form.controls.title.hasError('required')) {
                <mat-error>Title is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'knowledge.fields.articleType' | translate }}</mat-label>
              <mat-select formControlName="articleType">
                @for (t of articleTypes; track t) {
                  <mat-option [value]="t">{{ t }}</mat-option>
                }
              </mat-select>
              @if (form.controls.articleType.hasError('required')) {
                <mat-error>Article type is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'knowledge.fields.categoryName' | translate }}</mat-label>
              <mat-select formControlName="categoryId">
                @for (cat of categories(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
              @if (form.controls.categoryId.hasError('required')) {
                <mat-error>Category is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'knowledge.fields.tags' | translate }}</mat-label>
              <input matInput formControlName="tags" placeholder="Comma-separated tags" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'knowledge.fields.summary' | translate }}</mat-label>
              <textarea matInput formControlName="summary" rows="2"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'knowledge.fields.content' | translate }}</mat-label>
              <textarea matInput formControlName="content" rows="10"></textarea>
              @if (form.controls.content.hasError('required')) {
                <mat-error>Content is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'knowledge.fields.linkedProjectId' | translate }}</mat-label>
              <input matInput formControlName="linkedProjectId" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'knowledge.fields.linkedEvaluationId' | translate }}</mat-label>
              <input matInput formControlName="linkedEvaluationId" />
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="onCancel()">{{ 'common.cancel' | translate }}</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'common.save' | translate }}
              }
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host { display: block; }
    .edit-form { margin-bottom: 0; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `,
})
export default class ArticleCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly categories = this.store.selectSignal(selectCategories);
  readonly loading = this.store.selectSignal(selectKnowledgeLoading);

  readonly articleTypes: ArticleType[] = ['LessonLearned', 'BestPractice', 'EvaluationFinding', 'CaseStudy', 'Guideline', 'Template'];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    articleType: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
    content: ['', [Validators.required]],
    summary: [''],
    tags: [''],
    linkedProjectId: [''],
    linkedEvaluationId: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(KnowledgeActions.loadCategories());
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateArticleRequest = {
      title: value.title,
      articleType: value.articleType as ArticleType,
      categoryId: value.categoryId,
      content: value.content,
      summary: value.summary || undefined,
      tags: value.tags ? value.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      linkedProjectId: value.linkedProjectId || undefined,
      linkedEvaluationId: value.linkedEvaluationId || undefined,
    };
    this.store.dispatch(KnowledgeActions.createArticle({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/knowledge']);
  }
}
