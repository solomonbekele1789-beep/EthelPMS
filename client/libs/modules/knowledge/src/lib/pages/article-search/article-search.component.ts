import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  SearchInputComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { KnowledgeActions } from '../../store/knowledge.actions';
import { selectArticles, selectKnowledgeLoading } from '../../store/knowledge.selectors';

@Component({
  selector: 'ethel-article-search',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    SearchInputComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'knowledge.search.title' | translate">
    </app-page-header>

    <div class="search-container">
      <app-search-input
        placeholder="Search knowledge base..."
        (search)="onSearch($event)">
      </app-search-input>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (hasSearched() && articles().length === 0) {
        <app-empty-state
          icon="search_off"
          title="No results found"
          message="Try different keywords or browse by category.">
        </app-empty-state>
      } @else if (articles().length > 0) {
        <div class="results-list">
          @for (article of articles(); track article.id) {
            <mat-card class="result-card" (click)="onArticleClick(article.id)">
              <mat-card-header>
                <mat-card-title>
                  {{ article.title }}
                  @if (article.isFeatured) {
                    <mat-icon class="featured-icon">star</mat-icon>
                  }
                </mat-card-title>
                <mat-card-subtitle>
                  {{ article.categoryName }} &middot; {{ article.articleType }} &middot; {{ article.createdAt | date:'mediumDate' }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                @if (article.summary) {
                  <p class="article-summary">{{ article.summary }}</p>
                }
                <div class="result-meta">
                  <mat-chip [class.status-draft]="article.status === 'Draft'"
                            [class.status-published]="article.status === 'Published'"
                            [class.status-archived]="article.status === 'Archived'">
                    {{ article.status }}
                  </mat-chip>
                  <span class="view-count">
                    <mat-icon class="inline-icon">visibility</mat-icon> {{ article.viewCount }}
                  </span>
                  @if (article.tags && article.tags.length > 0) {
                    @for (tag of article.tags; track tag) {
                      <mat-chip class="tag-chip">{{ tag }}</mat-chip>
                    }
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <div class="search-hint">
          <mat-icon>lightbulb</mat-icon>
          <p>{{ 'knowledge.search.hint' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .search-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .results-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .result-card { cursor: pointer; }
    .result-card:hover { box-shadow: var(--mat-sys-level3); }
    .article-summary { margin: 0 0 0.5rem; color: var(--mat-sys-on-surface-variant); }
    .result-meta { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    .view-count { display: flex; align-items: center; gap: 0.25rem; font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
    .inline-icon { font-size: 16px; width: 16px; height: 16px; }
    .featured-icon { color: #f9a825; font-size: 20px; vertical-align: middle; }
    .tag-chip { --mdc-chip-elevated-container-color: #e8eaf6; font-size: 0.75rem; }
    .search-hint {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--mat-sys-on-surface-variant);
      justify-content: center;
    }
    .status-draft { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-published { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-archived { --mdc-chip-elevated-container-color: #ffe0b2; }
  `,
})
export default class ArticleSearchComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly articles = this.store.selectSignal(selectArticles);
  readonly loading = this.store.selectSignal(selectKnowledgeLoading);
  readonly hasSearched = signal(false);

  onSearch(term: string): void {
    if (!term.trim()) return;
    this.hasSearched.set(true);
    this.store.dispatch(KnowledgeActions.searchArticles({ term }));
  }

  onArticleClick(id: string): void {
    this.router.navigate(['/knowledge', id]);
  }
}
