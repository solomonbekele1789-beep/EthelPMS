import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DocumentService } from '../services/document.service';
import { DocumentFolderService } from '../services/document-folder.service';
import { DocumentsActions } from './documents.actions';

@Injectable()
export class DocumentsEffects {
  private readonly actions$ = inject(Actions);
  private readonly documentService = inject(DocumentService);
  private readonly documentFolderService = inject(DocumentFolderService);

  loadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(DocumentsActions.loadDocuments),
    switchMap(({ folderId, category, status, search, page, pageSize }) =>
      this.documentService.listDocuments({ folderId, category, status, search, page, pageSize }).pipe(
        map((response) => DocumentsActions.loadDocumentsSuccess({ documents: response.items, totalCount: response.totalCount })),
        catchError((error) => of(DocumentsActions.loadDocumentsFailure({ error: error?.error?.detail ?? 'Failed to load documents' })))
      )
    )
  ));

  loadDocument$ = createEffect(() => this.actions$.pipe(
    ofType(DocumentsActions.loadDocument),
    switchMap(({ id }) =>
      this.documentService.getDocument(id).pipe(
        map((document) => DocumentsActions.loadDocumentSuccess({ document })),
        catchError((error) => of(DocumentsActions.loadDocumentFailure({ error: error?.error?.detail ?? 'Failed to load document' })))
      )
    )
  ));

  uploadDocument$ = createEffect(() => this.actions$.pipe(
    ofType(DocumentsActions.uploadDocument),
    exhaustMap(({ request }) =>
      this.documentService.uploadDocument(request).pipe(
        map((response) => DocumentsActions.uploadDocumentSuccess({ id: response.id })),
        catchError((error) => of(DocumentsActions.uploadDocumentFailure({ error: error?.error?.detail ?? 'Failed to upload document' })))
      )
    )
  ));

  loadFolderTree$ = createEffect(() => this.actions$.pipe(
    ofType(DocumentsActions.loadFolderTree),
    switchMap(({ projectId }) =>
      this.documentFolderService.getFolderTree(projectId).pipe(
        map((folders) => DocumentsActions.loadFolderTreeSuccess({ folders })),
        catchError((error) => of(DocumentsActions.loadFolderTreeFailure({ error: error?.error?.detail ?? 'Failed to load folder tree' })))
      )
    )
  ));
}
