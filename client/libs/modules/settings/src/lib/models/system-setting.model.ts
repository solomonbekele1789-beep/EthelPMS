export interface SystemSettingDto {
  id: string;
  settingKey: string;
  settingValue: string;
  dataType: SettingDataType;
  category: string;
  description: string;
  isReadOnly: boolean;
}

export interface UpdateSystemSettingRequest {
  settingKey: string;
  settingValue: string;
}

export type SettingDataType = 'String' | 'Integer' | 'Boolean' | 'Decimal' | 'Json' | 'DateTime';
