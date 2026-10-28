export interface AssetMaintenanceDto {
  id: string;
  assetId: string;
  assetName: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  performedBy?: string;
  notes?: string;
  isCompleted: boolean;
  nextScheduledDate?: string;
}

export interface ScheduleMaintenanceRequest {
  assetId: string;
  description: string;
  scheduledDate: string;
}

export interface CompleteMaintenanceRequest {
  maintenanceId: string;
  completedDate: string;
  cost?: number;
  performedBy?: string;
  notes?: string;
  nextScheduledDate?: string;
}
