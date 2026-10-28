export type DataSourceType = 'KoboToolbox' | 'ODK' | 'CommCare' | 'CustomApi';

export interface DataSyncConfigDto {
  id: string;
  name: string;
  sourceType: DataSourceType;
  sourceUrl: string;
  formId: string | null;
  targetModule: string;
  targetEntityType: string;
  syncFrequency: string | null;
  lastSyncAt: string | null;
  isActive: boolean;
}

export interface CreateDataSyncRequest {
  name: string;
  sourceType: DataSourceType;
  sourceUrl: string;
  apiKey?: string;
  formId?: string;
  targetModule: string;
  targetEntityType: string;
  mappingConfig: string;
  syncFrequency?: string;
}

export interface UpdateDataSyncRequest {
  id: string;
  name: string;
  sourceUrl: string;
  apiKey?: string;
  mappingConfig: string;
  syncFrequency?: string;
  isActive: boolean;
}
