export type ExportFormat = 'CSV' | 'Excel' | 'JSON' | 'PDF';
export type ExportJobStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface ExportJobDto {
  id: string;
  exportedById: string;
  module: string;
  entityType: string;
  exportFormat: ExportFormat;
  fileName: string | null;
  fileSize: number | null;
  status: ExportJobStatus;
  totalRecords: number | null;
  completedAt: string | null;
}

export interface StartExportRequest {
  module: string;
  entityType: string;
  exportFormat: ExportFormat;
  filterCriteria?: string;
}
