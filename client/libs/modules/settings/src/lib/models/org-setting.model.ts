import { SettingDataType } from './system-setting.model';

export interface OrgSettingDto {
  id: string;
  settingKey: string;
  settingValue: string;
  dataType: SettingDataType;
  module?: string;
  category: string;
  description?: string;
}

export interface UpsertOrgSettingRequest {
  settingKey: string;
  settingValue: string;
  dataType: SettingDataType;
  module?: string;
  category: string;
}
