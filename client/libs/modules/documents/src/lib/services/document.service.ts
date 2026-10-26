import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  DocumentDto,
  DocumentVersionDto,
  DocumentCommentDto,
  UploadDocumentRequest,
  UpdateDocumentMetadataRequest,
  UploadNewVersionRequest,
  AddDocumentCommentRequest,
} from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = inject(ApiService);

  listDocuments(params: {
    folderId?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<DocumentDto>> {
    let httpParams = new HttpParams();

    if (params.folderId) httpParams = httpParams.set('folderId', params.folderId);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<DocumentDto>>('/documents', httpParams);
  }

  getDocument(id: string): Observable<DocumentDto> {
    return this.api.get<DocumentDto>(`/documents/${id}`);
  }

  uploadDocument(request: UploadDocumentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/documents', request);
  }

  updateMetadata(id: string, request: UpdateDocumentMetadataRequest): Observable<void> {
    return this.api.put<void>(`/documents/${id}/metadata`, request);
  }

  uploadNewVersion(id: string, request: UploadNewVersionRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/documents/${id}/versions`, request);
  }

  listVersions(id: string): Observable<DocumentVersionDto[]> {
    return this.api.get<DocumentVersionDto[]>(`/documents/${id}/versions`);
  }

  listComments(id: string): Observable<DocumentCommentDto[]> {
    return this.api.get<DocumentCommentDto[]>(`/documents/${id}/comments`);
  }

  addComment(id: string, request: AddDocumentCommentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/documents/${id}/comments`, request);
  }
}
