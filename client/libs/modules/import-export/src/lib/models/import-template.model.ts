export type ImportFileFormat = 'CSV' | 'Excel' | 'JSON' | 'KoboToolbox';

export interface ImportTemplateDto {
  id: string;
  name: string;
  module: string;
  entityType: string;
  fileFormat: ImportFileFormat;
  columnMappings: string;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateImportTemplateRequest {
  name: string;
  module: string;
  entityType: string;
  fileFormat: ImportFileFormat;
  columnMappings: string;
  validationRules?: string;
  isSystemTemplate: boolean;
}

export interface UpdateImportTemplateRequest {
  id: string;
  name: string;
  columnMappings: string;
  validationRules?: string;
  isActive: boolean;
}
