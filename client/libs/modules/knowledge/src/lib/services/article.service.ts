import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import { KbArticleDto, KbArticleListDto, CreateArticleRequest, UpdateArticleRequest, ArticleType, ArticleStatus } from '../models/article.model';
import { KbArticleCommentDto, AddCommentRequest } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly api = inject(ApiService);

  listArticles(params?: {
    categoryId?: string;
    articleType?: ArticleType;
    status?: ArticleStatus;
    searchTerm?: string;
    tags?: string;
  }): Observable<KbArticleListDto[]> {
    let httpParams = new HttpParams();
    if (params?.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params?.articleType) httpParams = httpParams.set('articleType', params.articleType);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params?.tags) httpParams = httpParams.set('tags', params.tags);
    return this.api.get<KbArticleListDto[]>('/kb/articles', httpParams);
  }

  searchArticles(term: string): Observable<KbArticleListDto[]> {
    const params = new HttpParams().set('term', term);
    return this.api.get<KbArticleListDto[]>('/kb/articles/search', params);
  }

  getArticle(id: string): Observable<KbArticleDto> {
    return this.api.get<KbArticleDto>(`/kb/articles/${id}`);
  }

  createArticle(request: CreateArticleRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/kb/articles', request);
  }

  updateArticle(id: string, request: UpdateArticleRequest): Observable<void> {
    return this.api.put<void>(`/kb/articles/${id}`, request);
  }

  publishArticle(id: string): Observable<void> {
    return this.api.put<void>(`/kb/articles/${id}/publish`);
  }

  archiveArticle(id: string): Observable<void> {
    return this.api.put<void>(`/kb/articles/${id}/archive`);
  }

  deleteArticle(id: string): Observable<void> {
    return this.api.delete<void>(`/kb/articles/${id}`);
  }

  listComments(articleId: string): Observable<KbArticleCommentDto[]> {
    return this.api.get<KbArticleCommentDto[]>(`/kb/articles/${articleId}/comments`);
  }

  addComment(articleId: string, request: AddCommentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/kb/articles/${articleId}/comments`, request);
  }
}
