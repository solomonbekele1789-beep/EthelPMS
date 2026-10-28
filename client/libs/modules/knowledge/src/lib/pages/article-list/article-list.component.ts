import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { KnowledgeActions } from '../../store/knowledge.actions';
import { selectArticles, selectKnowledgeLoading, selectCategories } from '../../store/knowledge.selectors';
import { ArticleType, ArticleStatus } from '../../models/article.model';

@Component({
  selector: 'ethel-article-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'knowledge.articles.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'knowledge.articles.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'knowledge.articles.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <app-search-input placeholder="Search articles..." (search)="onSearch($event)"></app-search-input>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'knowledge.fields.articleType' | translate }}</mat-label>
          <mat-select [value]="typeFilter()" (selectionChange)="onTypeFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (t of articleTypes; track t) {
              <mat-option [value]="t">{{ t }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'knowledge.fields.status' | translate }}</mat-label>
          <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ s }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'knowledge.fields.categoryName' | translate }}</mat-label>
          <mat-select [value]="categoryFilter()" (selectionChange)="onCategoryFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (cat of categories(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="articles()"
        [loading]="loading()"
        [totalCount]="articles().length"
        [page]="1"
        [pageSize]="50"
        emptyTitle="No articles found"
        emptyMessage="Get started by creating your first knowledge base article."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #typeTpl let-row>
      <mat-chip>{{ row.articleType }}</mat-chip>
    </ng-template>

    <ng-template #statusTpl let-row>
      <mat-chip [class.status-draft]="row.status === 'Draft'"
                [class.status-published]="row.status === 'Published'"
                [class.status-archived]="row.status === 'Archived'">
        {{ row.status }}
      </mat-chip>
    </ng-template>

    <ng-template #featuredTpl let-row>
      @if (row.isFeatured) {
        <mat-icon class="featured-icon">star</mat-icon>
      }
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 180px; }
    .featured-icon { color: #f9a825; }
    .status-draft { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-published { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-archived { --mdc-chip-elevated-container-color: #ffe0b2; }
  `,
})
export default class ArticleListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly articles = this.store.selectSignal(selectArticles);
  readonly loading = this.store.selectSignal(selectKnowledgeLoading);
  readonly categories = this.store.selectSignal(selectCategories);

  readonly searchTerm = signal('');
  readonly typeFilter = signal('');
  readonly statusFilter = signal('');
  readonly categoryFilter = signal('');

  readonly articleTypes: ArticleType[] = ['LessonLearned', 'BestPractice', 'EvaluationFinding', 'CaseStudy', 'Guideline', 'Template'];
  readonly statuses: ArticleStatus[] = ['Draft', 'Published', 'Archived'];

  readonly typeTpl = viewChild<TemplateRef<unknown>>('typeTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly featuredTpl = viewChild<TemplateRef<unknown>>('featuredTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'articleType', label: 'Type', template: this.typeTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'categoryName', label: 'Category' },
    { key: 'isFeatured', label: 'Featured', template: this.featuredTpl() },
    { key: 'viewCount', label: 'Views', sortable: true },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(KnowledgeActions.loadCategories());
    this.loadArticles();
  }

  loadArticles(): void {
    this.store.dispatch(
      KnowledgeActions.loadArticles({
        categoryId: this.categoryFilter() || undefined,
        articleType: (this.typeFilter() as ArticleType) || undefined,
        status: (this.statusFilter() as ArticleStatus) || undefined,
        searchTerm: this.searchTerm() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.loadArticles();
  }

  onTypeFilter(value: string): void {
    this.typeFilter.set(value);
    this.loadArticles();
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.loadArticles();
  }

  onCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
    this.loadArticles();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/knowledge', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/knowledge/create']);
  }
}
