import { createFeature, createReducer, on } from '@ngrx/store';
import { DocumentDto } from '../models/document.model';
import { FolderTreeDto } from '../models/folder.model';
import { DocumentsActions } from './documents.actions';

export const DOCUMENTS_FEATURE_KEY = 'documents';

export interface DocumentsState {
  documents: DocumentDto[];
  documentsTotalCount: number;
  selectedDocument: DocumentDto | null;
  folderTree: FolderTreeDto[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  documentsTotalCount: 0,
  selectedDocument: null,
  folderTree: [],
  loading: false,
  error: null,
};

export const documentsFeature = createFeature({
  name: DOCUMENTS_FEATURE_KEY,
  reducer: createReducer(
    initialState,
    on(DocumentsActions.loadDocuments, (state) => ({ ...state, loading: true, error: null })),
    on(DocumentsActions.loadDocumentsSuccess, (state, { documents, totalCount }) => ({
      ...state, documents, documentsTotalCount: totalCount, loading: false,
    })),
    on(DocumentsActions.loadDocumentsFailure, (state, { error }) => ({ ...state, error, loading: false })),
    on(DocumentsActions.loadDocument, (state) => ({ ...state, loading: true, error: null })),
    on(DocumentsActions.loadDocumentSuccess, (state, { document }) => ({
      ...state, selectedDocument: document, loading: false,
    })),
    on(DocumentsActions.loadDocumentFailure, (state, { error }) => ({ ...state, error, loading: false })),
    on(DocumentsActions.uploadDocument, (state) => ({ ...state, loading: true, error: null })),
    on(DocumentsActions.uploadDocumentSuccess, (state) => ({ ...state, loading: false })),
    on(DocumentsActions.uploadDocumentFailure, (state, { error }) => ({ ...state, error, loading: false })),
    on(DocumentsActions.loadFolderTree, (state) => ({ ...state, loading: true, error: null })),
    on(DocumentsActions.loadFolderTreeSuccess, (state, { folders }) => ({
      ...state, folderTree: folders, loading: false,
    })),
    on(DocumentsActions.loadFolderTreeFailure, (state, { error }) => ({ ...state, error, loading: false })),
  ),
});

export const documentsReducer = documentsFeature.reducer;
