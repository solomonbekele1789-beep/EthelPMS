export type ImportJobStatus =
  | 'Pending'
  | 'Validating'
  | 'Validated'
  | 'Processing'
  | 'Completed'
  | 'CompletedWithErrors'
  | 'Failed'
  | 'Cancelled';

export interface ImportJobDto {
  id: string;
  importTemplateId: string | null;
  templateName: string | null;
  importedById: string;
  fileName: string;
  fileSize: number;
  module: string;
  entityType: string;
  status: ImportJobStatus;
  totalRows: number | null;
  processedRows: number | null;
  successRows: number | null;
  errorRows: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ImportJobListDto {
  id: string;
  fileName: string;
  module: string;
  entityType: string;
  status: ImportJobStatus;
  totalRows: number | null;
  successRows: number | null;
  errorRows: number | null;
  createdAt: string;
}

export interface StartImportRequest {
  importTemplateId?: string;
  fileName: string;
  fileSize: number;
  fileStoragePath: string;
  module: string;
  entityType: string;
}
