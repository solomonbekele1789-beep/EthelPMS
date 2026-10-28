export type SupplierStatus = 'Active' | 'Inactive' | 'Blacklisted';

export interface SupplierDto {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  taxIdNumber?: string;
  status: SupplierStatus;
  rating: number;
  blacklistReason?: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  taxIdNumber?: string;
}

export interface UpdateSupplierRequest {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  taxIdNumber?: string;
}
