import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
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
import { KnowledgeActions } from '../../store/knowledge.actions';
import { selectSelectedArticle, selectComments, selectKnowledgeLoading, selectCategories } from '../../store/knowledge.selectors';
import { ArticleService } from '../../services/article.service';
import { KbArticleDto, UpdateArticleRequest, ArticleType } from '../../models/article.model';
import { KbArticleCommentDto } from '../../models/comment.model';

@Component({
  selector: 'ethel-article-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="article()?.title ?? ('knowledge.articles.detail' | translate)">
      @if (article()) {
        <button mat-stroked-button *appHasPermission="'knowledge.articles.update'" (click)="toggleEditMode()">
          <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
          {{ editing() ? ('common.cancel' | translate) : ('common.edit' | translate) }}
        </button>
        @if (article()!.status === 'Draft') {
          <button mat-flat-button color="primary" *appHasPermission="'knowledge.articles.update'" (click)="onPublish()">
            <mat-icon>publish</mat-icon>
            {{ 'knowledge.articles.publish' | translate }}
          </button>
        }
        @if (article()!.status === 'Published') {
          <button mat-stroked-button color="warn" *appHasPermission="'knowledge.articles.update'" (click)="onArchive()">
            <mat-icon>archive</mat-icon>
            {{ 'knowledge.articles.archive' | translate }}
          </button>
        }
        <button mat-icon-button color="warn" *appHasPermission="'knowledge.articles.delete'" (click)="onDelete()">
          <mat-icon>delete</mat-icon>
        </button>
      }
    </app-page-header>

    @if (loading() && !article()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (article()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'knowledge.tabs.overview' | translate">
          <div class="tab-content">
            @if (!editing()) {
              <div class="detail-grid">
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.articleType' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content><mat-chip>{{ article()!.articleType }}</mat-chip></mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.status' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <mat-chip [class.status-draft]="article()!.status === 'Draft'"
                              [class.status-published]="article()!.status === 'Published'"
                              [class.status-archived]="article()!.status === 'Archived'">
                      {{ article()!.status }}
                    </mat-chip>
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.categoryName' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ article()!.categoryName }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.viewCount' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <span class="view-count"><mat-icon class="inline-icon">visibility</mat-icon> {{ article()!.viewCount }}</span>
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.isFeatured' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    @if (article()!.isFeatured) {
                      <mat-icon class="featured-icon">star</mat-icon> Yes
                    } @else {
                      No
                    }
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.createdAt' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ article()!.createdAt | date:'mediumDate' }}</mat-card-content>
                </mat-card>
              </div>

              @if (article()!.tags && article()!.tags.length > 0) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.tags' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <div class="tags-row">
                      @for (tag of article()!.tags; track tag) {
                        <mat-chip>{{ tag }}</mat-chip>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }

              @if (article()!.summary) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'knowledge.fields.summary' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ article()!.summary }}</mat-card-content>
                </mat-card>
              }

              <mat-card class="narrative-card">
                <mat-card-header><mat-card-title>{{ 'knowledge.fields.content' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content class="article-content">{{ article()!.content }}</mat-card-content>
              </mat-card>

              @if (article()!.linkedProjectId || article()!.linkedEvaluationId) {
                <div class="detail-grid">
                  @if (article()!.linkedProjectId) {
                    <mat-card>
                      <mat-card-header><mat-card-title>{{ 'knowledge.fields.linkedProjectId' | translate }}</mat-card-title></mat-card-header>
                      <mat-card-content>{{ article()!.linkedProjectId }}</mat-card-content>
                    </mat-card>
                  }
                  @if (article()!.linkedEvaluationId) {
                    <mat-card>
                      <mat-card-header><mat-card-title>{{ 'knowledge.fields.linkedEvaluationId' | translate }}</mat-card-title></mat-card-header>
                      <mat-card-content>{{ article()!.linkedEvaluationId }}</mat-card-content>
                    </mat-card>
                  }
                </div>
              }
            } @else {
              <form [formGroup]="editForm" (ngSubmit)="onUpdateArticle()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'knowledge.fields.title' | translate }}</mat-label>
                    <input matInput formControlName="title" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'knowledge.fields.categoryName' | translate }}</mat-label>
                    <mat-select formControlName="categoryId">
                      @for (cat of categories(); track cat.id) {
                        <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'knowledge.fields.tags' | translate }}</mat-label>
                    <input matInput formControlName="tags" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'knowledge.fields.isFeatured' | translate }}</mat-label>
                    <mat-select formControlName="isFeatured">
                      <mat-option [value]="true">Yes</mat-option>
                      <mat-option [value]="false">No</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'knowledge.fields.summary' | translate }}</mat-label>
                    <textarea matInput formControlName="summary" rows="2"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'knowledge.fields.content' | translate }}</mat-label>
                    <textarea matInput formControlName="content" rows="10"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-button type="button" (click)="toggleEditMode()">{{ 'common.cancel' | translate }}</button>
                  <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving()">
                    @if (saving()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Comments Tab -->
        <mat-tab [label]="'knowledge.tabs.comments' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'knowledge.articles.update'">
              <button mat-stroked-button (click)="toggleCommentForm()">
                <mat-icon>{{ showCommentForm() ? 'close' : 'add_comment' }}</mat-icon>
                {{ showCommentForm() ? ('common.cancel' | translate) : ('knowledge.comments.add' | translate) }}
              </button>
            </div>

            @if (showCommentForm()) {
              <form [formGroup]="commentForm" (ngSubmit)="onAddComment()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'knowledge.fields.content' | translate }}</mat-label>
                    <textarea matInput formControlName="content" rows="3"></textarea>
                    @if (commentForm.controls.content.hasError('required')) {
                      <mat-error>Comment content is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'knowledge.fields.parentCommentId' | translate }}</mat-label>
                    <input matInput formControlName="parentCommentId" placeholder="Optional - reply to comment ID" />
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="commentForm.invalid || savingComment()">
                    @if (savingComment()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            @if (loading() && comments().length === 0) {
              <app-loading-spinner></app-loading-spinner>
            } @else if (comments().length === 0) {
              <app-empty-state
                icon="comment"
                title="No comments yet"
                message="Be the first to add a comment to this article.">
              </app-empty-state>
            } @else {
              <div class="comments-list">
                @for (comment of topLevelComments(); track comment.id) {
                  <mat-card class="comment-card">
                    <mat-card-header>
                      <mat-card-title>{{ comment.authorId }}</mat-card-title>
                      <mat-card-subtitle>{{ comment.createdAt | date:'medium' }}</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>{{ comment.content }}</mat-card-content>
                    <mat-card-actions>
                      <button mat-button (click)="onReplyTo(comment.id)">
                        <mat-icon>reply</mat-icon> {{ 'knowledge.comments.reply' | translate }}
                      </button>
                    </mat-card-actions>
                  </mat-card>
                  @for (reply of getReplies(comment.id); track reply.id) {
                    <mat-card class="comment-card reply-card">
                      <mat-card-header>
                        <mat-card-title>{{ reply.authorId }}</mat-card-title>
                        <mat-card-subtitle>{{ reply.createdAt | date:'medium' }}</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>{{ reply.content }}</mat-card-content>
                    </mat-card>
                  }
                }
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="article"
        title="Article not found"
        message="The requested article could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .tab-content { padding: 1.5rem 0; }
    .narrative-card { margin-bottom: 1rem; }
    .article-content { white-space: pre-wrap; }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .edit-form { margin-bottom: 1.5rem; }
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
    .tags-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .view-count { display: flex; align-items: center; gap: 0.25rem; }
    .inline-icon { font-size: 18px; width: 18px; height: 18px; }
    .featured-icon { color: #f9a825; }
    .comments-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .comment-card { margin-bottom: 0; }
    .reply-card { margin-left: 2rem; }
    .status-draft { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-published { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-archived { --mdc-chip-elevated-container-color: #ffe0b2; }
  `,
})
export default class ArticleDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly articleService = inject(ArticleService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly article = this.store.selectSignal(selectSelectedArticle);
  readonly comments = this.store.selectSignal(selectComments);
  readonly loading = this.store.selectSignal(selectKnowledgeLoading);
  readonly categories = this.store.selectSignal(selectCategories);

  readonly activeTab = signal(0);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly showCommentForm = signal(false);
  readonly savingComment = signal(false);

  readonly topLevelComments = computed(() =>
    this.comments().filter((c) => !c.parentCommentId)
  );

  readonly editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
    content: ['', [Validators.required]],
    summary: [''],
    tags: [''],
    isFeatured: [false],
  });

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
    parentCommentId: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(KnowledgeActions.loadArticle({ id: this.id() }));
    this.store.dispatch(KnowledgeActions.loadCategories());
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 1) {
      this.store.dispatch(KnowledgeActions.loadComments({ articleId: this.id() }));
    }
  }

  toggleEditMode(): void {
    if (!this.editing()) {
      const a = this.article();
      if (a) {
        this.editForm.patchValue({
          title: a.title,
          categoryId: a.categoryId,
          content: a.content,
          summary: a.summary ?? '',
          tags: a.tags?.join(', ') ?? '',
          isFeatured: a.isFeatured,
        });
      }
    }
    this.editing.update((v) => !v);
  }

  onUpdateArticle(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateArticleRequest = {
      id: this.id(),
      title: value.title,
      categoryId: value.categoryId,
      content: value.content,
      summary: value.summary || undefined,
      tags: value.tags ? value.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      isFeatured: value.isFeatured,
    };
    this.saving.set(true);
    this.articleService.updateArticle(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Article updated successfully');
        this.editing.set(false);
        this.saving.set(false);
        this.store.dispatch(KnowledgeActions.loadArticle({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to update article');
        this.saving.set(false);
      },
    });
  }

  onPublish(): void {
    this.store.dispatch(KnowledgeActions.publishArticle({ id: this.id() }));
  }

  onArchive(): void {
    this.store.dispatch(KnowledgeActions.archiveArticle({ id: this.id() }));
  }

  onDelete(): void {
    this.store.dispatch(KnowledgeActions.deleteArticle({ id: this.id() }));
  }

  toggleCommentForm(): void {
    this.showCommentForm.update((v) => !v);
    if (this.showCommentForm()) {
      this.commentForm.reset();
    }
  }

  onReplyTo(commentId: string): void {
    this.showCommentForm.set(true);
    this.commentForm.patchValue({ parentCommentId: commentId });
  }

  onAddComment(): void {
    if (this.commentForm.invalid) return;
    const value = this.commentForm.getRawValue();
    this.savingComment.set(true);
    this.articleService.addComment(this.id(), {
      articleId: this.id(),
      content: value.content,
      parentCommentId: value.parentCommentId || undefined,
    }).subscribe({
      next: () => {
        this.notification.success('Comment added successfully');
        this.commentForm.reset();
        this.showCommentForm.set(false);
        this.savingComment.set(false);
        this.store.dispatch(KnowledgeActions.loadComments({ articleId: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add comment');
        this.savingComment.set(false);
      },
    });
  }

  getReplies(parentId: string): KbArticleCommentDto[] {
    return this.comments().filter((c) => c.parentCommentId === parentId);
  }
}
