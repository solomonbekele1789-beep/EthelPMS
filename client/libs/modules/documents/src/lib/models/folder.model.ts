export interface DocumentFolderDto {
  id: string;
  name: string;
  parentFolderId?: string;
  description?: string;
  projectId?: string;
  sortOrder: number;
  documentCount: number;
  subFolders: DocumentFolderDto[];
  createdAt: string;
  createdBy?: string;
}

export interface FolderTreeDto {
  id: string;
  name: string;
  parentFolderId?: string;
  children: FolderTreeDto[];
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: string;
  description?: string;
  projectId?: string;
  sortOrder?: number;
}

export interface UpdateFolderRequest {
  folderId: string;
  name: string;
  description?: string;
}

export interface MoveFolderRequest {
  folderId: string;
  parentFolderId?: string;
}
