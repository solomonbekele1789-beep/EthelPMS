export interface DonorDto {
  id: string;
  name: string;
  acronym: string | null;
  country: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  defaultProcurementThreshold: number | null;
  contacts: DonorContactDto[];
  grantCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface DonorContactDto {
  id: string;
  donorId: string;
  fullName: string;
  title: string | null;
  email: string;
  phone: string | null;
  isPrimary: boolean;
}

export interface CreateDonorRequest {
  name: string;
  acronym?: string;
  country?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateDonorRequest {
  id: string;
  name: string;
  acronym?: string;
  country?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface AddDonorContactRequest {
  donorId: string;
  fullName: string;
  email: string;
  title?: string;
  phone?: string;
  isPrimary: boolean;
}
