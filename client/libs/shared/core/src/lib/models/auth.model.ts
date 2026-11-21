export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  officeId: string | null;
  officeName: string | null;
  roles: string[];
  permissions: string[];
  tenant?: { id: string; name: string; slug?: string; modules: string[] } | null;
}

export interface TenantInfo {
  id: string;
  name: string;
  identifier: string;
}

export interface AuthState {
  user: UserProfile | null;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
