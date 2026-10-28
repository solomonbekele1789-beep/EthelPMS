import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SystemSettingDto, UpdateSystemSettingRequest } from '../models/system-setting.model';
import { OrgSettingDto, UpsertOrgSettingRequest } from '../models/org-setting.model';
import {
  ApprovalConfigDto,
  CreateApprovalConfigRequest,
  UpdateApprovalConfigRequest,
} from '../models/approval-config.model';
import {
  AlertThresholdDto,
  CreateAlertThresholdRequest,
  UpdateAlertThresholdRequest,
} from '../models/alert-threshold.model';

export const SettingsActions = createActionGroup({
  source: 'Settings',
  events: {
    // System Settings
    'Load System Settings': props<{ category?: string }>(),
    'Load System Settings Success': props<{ systemSettings: SystemSettingDto[] }>(),
    'Load System Settings Failure': props<{ error: string }>(),
    'Update System Setting': props<{ key: string; request: UpdateSystemSettingRequest }>(),
    'Update System Setting Success': emptyProps(),
    'Update System Setting Failure': props<{ error: string }>(),

    // Org Settings
    'Load Org Settings': props<{ module?: string; category?: string }>(),
    'Load Org Settings Success': props<{ orgSettings: OrgSettingDto[] }>(),
    'Load Org Settings Failure': props<{ error: string }>(),
    'Upsert Org Setting': props<{ request: UpsertOrgSettingRequest }>(),
    'Upsert Org Setting Success': props<{ id: string }>(),
    'Upsert Org Setting Failure': props<{ error: string }>(),

    // Approval Configs
    'Load Approval Configs': props<{ module?: string }>(),
    'Load Approval Configs Success': props<{ approvalConfigs: ApprovalConfigDto[] }>(),
    'Load Approval Configs Failure': props<{ error: string }>(),
    'Create Approval Config': props<{ request: CreateApprovalConfigRequest }>(),
    'Create Approval Config Success': props<{ id: string }>(),
    'Create Approval Config Failure': props<{ error: string }>(),
    'Update Approval Config': props<{ id: string; request: UpdateApprovalConfigRequest }>(),
    'Update Approval Config Success': emptyProps(),
    'Update Approval Config Failure': props<{ error: string }>(),

    // Alert Thresholds
    'Load Alert Thresholds': props<{ module?: string }>(),
    'Load Alert Thresholds Success': props<{ alertThresholds: AlertThresholdDto[] }>(),
    'Load Alert Thresholds Failure': props<{ error: string }>(),
    'Create Alert Threshold': props<{ request: CreateAlertThresholdRequest }>(),
    'Create Alert Threshold Success': props<{ id: string }>(),
    'Create Alert Threshold Failure': props<{ error: string }>(),
    'Update Alert Threshold': props<{ id: string; request: UpdateAlertThresholdRequest }>(),
    'Update Alert Threshold Success': emptyProps(),
    'Update Alert Threshold Failure': props<{ error: string }>(),
    'Delete Alert Threshold': props<{ id: string }>(),
    'Delete Alert Threshold Success': emptyProps(),
    'Delete Alert Threshold Failure': props<{ error: string }>(),
  },
});
