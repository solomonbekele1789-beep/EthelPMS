import { createActionGroup, props } from '@ngrx/store';
import { DocumentDto, UploadDocumentRequest } from '../models/document.model';
import { FolderTreeDto } from '../models/folder.model';

export const DocumentsActions = createActionGroup({
  source: 'Documents',
  events: {
    'Load Documents': props<{ folderId?: string; category?: string; status?: string; search?: string; page?: number; pageSize?: number }>(),
    'Load Documents Success': props<{ documents: DocumentDto[]; totalCount: number }>(),
    'Load Documents Failure': props<{ error: string }>(),
    'Load Document': props<{ id: string }>(),
    'Load Document Success': props<{ document: DocumentDto }>(),
    'Load Document Failure': props<{ error: string }>(),
    'Upload Document': props<{ request: UploadDocumentRequest }>(),
    'Upload Document Success': props<{ id: string }>(),
    'Upload Document Failure': props<{ error: string }>(),
    'Load Folder Tree': props<{ projectId?: string }>(),
    'Load Folder Tree Success': props<{ folders: FolderTreeDto[] }>(),
    'Load Folder Tree Failure': props<{ error: string }>(),
  },
});
