import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DocumentsState, DOCUMENTS_FEATURE_KEY } from './documents.reducer';

export const selectDocumentsState = createFeatureSelector<DocumentsState>(DOCUMENTS_FEATURE_KEY);

export const selectDocuments = createSelector(selectDocumentsState, (state) => state.documents);
export const selectDocumentsTotalCount = createSelector(selectDocumentsState, (state) => state.documentsTotalCount);
export const selectSelectedDocument = createSelector(selectDocumentsState, (state) => state.selectedDocument);
export const selectFolderTree = createSelector(selectDocumentsState, (state) => state.folderTree);
export const selectDocumentsLoading = createSelector(selectDocumentsState, (state) => state.loading);
export const selectDocumentsError = createSelector(selectDocumentsState, (state) => state.error);
