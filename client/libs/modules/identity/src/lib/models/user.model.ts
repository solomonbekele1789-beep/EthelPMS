export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName?: string;
  phone: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  employeeId?: string | null;
  employmentDate?: string | null;
  levelOfEducation?: string | null;
  qualification?: string | null;
  basicSalary?: number | null;
  managerId?: string | null;
  managerName?: string | null;
  profilePhotoUrl?: string | null;
  region?: string | null;
  officeLevel?: string | null;
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
  middleName?: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  password?: string;
  employeeId?: string;
  employmentDate?: string;
  levelOfEducation?: string;
  qualification?: string;
  basicSalary?: number;
  managerId?: string;
  profilePhotoUrl?: string;
  region?: string;
  officeLevel?: string;
  officeId?: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  employeeId?: string;
  employmentDate?: string;
  levelOfEducation?: string;
  qualification?: string;
  basicSalary?: number;
  managerId?: string;
  profilePhotoUrl?: string;
  region?: string;
  officeLevel?: string;
  officeId?: string;
  isActive: boolean;
}
