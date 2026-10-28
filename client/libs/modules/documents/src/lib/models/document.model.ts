export type DocumentStatus = 'Draft' | 'Published' | 'Archived';
export type DocumentCategory = 'General' | 'Policy' | 'Report' | 'Contract' | 'Template' | 'Training' | 'Procurement' | 'Financial' | 'Other';

export interface DocumentVersionDto {
  id: string;
  documentId: string;
  versionNumber: number;
  storageUrl: string;
  fileSizeBytes: number;
  contentType: string;
  changeNotes?: string;
  uploadedByUserId: string;
  uploadedByName: string;
  createdAt: string;
}

export interface DocumentDto {
  id: string;
  folderId?: string;
  fileName: string;
  displayName?: string;
  description?: string;
  status: DocumentStatus;
  category: DocumentCategory;
  contentType: string;
  fileSizeBytes: number;
  currentVersion: number;
  tags?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
  versionCount: number;
  latestVersion?: DocumentVersionDto;
  createdAt: string;
  createdBy?: string;
}

export interface DocumentCommentDto {
  id: string;
  documentId: string;
  authorUserId: string;
  authorName: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
}

export interface UploadDocumentRequest {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  storageUrl: string;
  folderId?: string;
  displayName?: string;
  description?: string;
  category?: DocumentCategory;
  tags?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
}

export interface UpdateDocumentMetadataRequest {
  documentId: string;
  displayName?: string;
  description?: string;
  category: DocumentCategory;
  tags?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
}

export interface UploadNewVersionRequest {
  documentId: string;
  storageUrl: string;
  fileSizeBytes: number;
  contentType: string;
  changeNotes?: string;
}

export interface AddDocumentCommentRequest {
  documentId: string;
  content: string;
  parentCommentId?: string;
}
