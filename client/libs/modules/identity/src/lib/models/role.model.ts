export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissions: PermissionDto[];
  createdAt: string;
}

export interface RoleListItemDto {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissionCount: number;
  userCount: number;
}

export interface PermissionDto {
  id: string;
  code: string;
  displayName: string;
  module: string;
  resource: string;
  action: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}
