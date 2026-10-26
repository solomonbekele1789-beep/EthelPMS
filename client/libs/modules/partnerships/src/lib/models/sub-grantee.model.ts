export type PartnerType = 'LocalNGO' | 'InternationalNGO' | 'CommunityOrg' | 'GovernmentBody' | 'AcademicInstitution' | 'PrivateSector';
export type PartnerStatus = 'Prospect' | 'Active' | 'Suspended' | 'Inactive' | 'Blacklisted';
export type PartnerRiskRating = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SubGranteeDto {
  id: string;
  organizationId: string;
  name: string;
  registrationNumber?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  country: string;
  partnerType: PartnerType;
  status: PartnerStatus;
  riskRating: PartnerRiskRating;
  capacityScore?: number;
  onboardingDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubGranteeListDto {
  id: string;
  name: string;
  partnerType: PartnerType;
  status: PartnerStatus;
  riskRating: PartnerRiskRating;
  capacityScore?: number;
  country: string;
}

export interface RegisterSubGranteeRequest {
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  country: string;
  partnerType: PartnerType;
  registrationNumber?: string;
  address?: string;
}

export interface UpdateSubGranteeRequest {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
}

export interface AssessRiskRequest {
  id: string;
  riskRating: PartnerRiskRating;
  capacityScore?: number;
}
