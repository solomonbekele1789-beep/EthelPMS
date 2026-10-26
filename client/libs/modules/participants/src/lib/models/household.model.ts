export interface HouseholdMemberDto {
  id: string;
  householdCode: string;
  participantId: string;
  isHeadOfHousehold: boolean;
  relationshipToHead?: string;
  address?: string;
  woreda?: string;
  kebele?: string;
  householdSize?: number;
}

export interface AddHouseholdMemberRequest {
  householdCode: string;
  participantId: string;
  isHeadOfHousehold: boolean;
  relationshipToHead?: string;
  householdSize?: number;
}
