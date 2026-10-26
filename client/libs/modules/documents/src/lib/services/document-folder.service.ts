import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  FolderTreeDto,
  CreateFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
} from '../models/folder.model';

@Injectable({ providedIn: 'root' })
export class DocumentFolderService {
  private readonly api = inject(ApiService);

  getFolderTree(projectId?: string): Observable<FolderTreeDto[]> {
    let httpParams = new HttpParams();

    if (projectId) httpParams = httpParams.set('projectId', projectId);

    return this.api.get<FolderTreeDto[]>('/document-folders/tree', httpParams);
  }

  createFolder(request: CreateFolderRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/document-folders', request);
  }

  updateFolder(id: string, request: UpdateFolderRequest): Observable<void> {
    return this.api.put<void>(`/document-folders/${id}`, request);
  }

  moveFolder(id: string, request: MoveFolderRequest): Observable<void> {
    return this.api.patch<void>(`/document-folders/${id}/move`, request);
  }
}
