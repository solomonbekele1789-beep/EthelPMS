export interface ApprovalConfigDto {
  id: string;
  module: string;
  entityType: string;
  requiredApprovalLevels: number;
  autoApproveBelow?: number;
  isActive: boolean;
}

export interface CreateApprovalConfigRequest {
  module: string;
  entityType: string;
  requiredApprovalLevels: number;
  autoApproveBelow?: number;
  isActive: boolean;
}

export interface UpdateApprovalConfigRequest {
  id: string;
  requiredApprovalLevels: number;
  autoApproveBelow?: number;
  isActive: boolean;
}
