export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  officeId: string | null;
  officeName: string | null;
  roles: string[];
  createdAt: string;
}

export interface UserListItemDto {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  officeName: string | null;
  roles: string[];
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  officeId?: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  officeId?: string;
  isActive: boolean;
}
