export type OfficeType = 'HeadOffice' | 'AreaOffice' | 'BranchOffice';

export interface OfficeDto {
  id: string;
  name: string;
  code: string;
  officeType: OfficeType;
  description: string | null;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  parentOfficeId: string | null;
  parentOfficeName: string | null;
  parentOfficeCode?: string | null;
  locationId: string | null;
  locationName: string | null;
  createdAt: string;
}

export interface OfficeListItemDto {
  id: string;
  name: string;
  code: string;
  officeType: OfficeType;
  description: string | null;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  parentOfficeId: string | null;
  parentOfficeName: string | null;
  parentOfficeCode?: string | null;
  locationName: string | null;
  userCount: number;
  createdAt: string;
}

export interface CreateOfficeRequest {
  name: string;
  code: string;
  officeType?: OfficeType;
  description?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  parentOfficeId?: string;
  locationId?: string;
}

export interface UpdateOfficeRequest {
  name: string;
  code: string;
  officeType?: OfficeType;
  description?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  parentOfficeId?: string;
  locationId?: string;
}
