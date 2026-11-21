export type TenantStatus = 'Pending' | 'Provisioning' | 'Active' | 'Suspended' | 'Archived';

export interface TenantListItemDto {
  id: string;
  name: string;
  slug: string;
  adminEmail: string;
  status: TenantStatus;
  subscriptionPackageName?: string;
  maxUsers: number;
  maxProjects: number;
  userCount?: number;
  projectCount?: number;
  createdAt: string;
}

export interface TenantModuleDto {
  moduleName: string;
  isEnabled: boolean;
  enabledAt?: string | null;
}

export interface TenantDetailDto extends TenantListItemDto {
  logoUrl?: string | null;
  primaryColor?: string | null;
  timezone: string;
  subscriptionPackageId: string;
  activatedAt?: string | null;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  modules?: TenantModuleDto[];
}

export interface TenantUsageDto {
  currentUsers: number;
  maxUsers: number;
  currentProjects: number;
  maxProjects: number;
  storageUsedBytes: number;
}

export interface ProvisioningLogDto {
  id: string;
  step: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  message?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export interface AccessKeyDto {
  id: string;
  label: string;
  maskedKey: string;
  scopes: string[];
  isRevoked: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface CreateAccessKeyResponse {
  key: string;
  message: string;
}

export interface SubscriptionPackageDto {
  id: string;
  name: string;
  description?: string;
  priceMonthlyUsd: number;
  maxUsers: number;
  maxProjects: number;
  includedModules: string[];
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  adminEmail: string;
  subscriptionPackageId: string;
  timezone?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  maxUsers?: number;
  maxProjects?: number;
  timezone?: string;
}

export interface UpdateBrandingRequest {
  logoUrl?: string | null;
  primaryColor?: string | null;
}
