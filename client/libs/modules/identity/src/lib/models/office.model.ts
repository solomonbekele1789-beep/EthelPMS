export interface OfficeDto {
  id: string;
  name: string;
  code: string;
  parentOfficeId: string | null;
  parentOfficeName: string | null;
  locationId: string | null;
  locationName: string | null;
}

export interface OfficeListItemDto {
  id: string;
  name: string;
  code: string;
  parentOfficeName: string | null;
  locationName: string | null;
  userCount: number;
}

export interface CreateOfficeRequest {
  name: string;
  code: string;
  parentOfficeId?: string;
  locationId?: string;
}

export interface UpdateOfficeRequest {
  name: string;
  code: string;
  parentOfficeId?: string;
  locationId?: string;
}
