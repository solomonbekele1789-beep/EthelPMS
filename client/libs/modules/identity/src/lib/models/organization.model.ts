export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
  calendarPreference: string;
  userCount: number;
  officeCount: number;
}

export interface UpdateOrganizationRequest {
  name: string;
  logoUrl?: string;
  timezone?: string;
  calendarPreference?: string;
}
