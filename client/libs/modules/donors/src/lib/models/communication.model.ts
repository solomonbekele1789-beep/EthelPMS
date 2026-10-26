export type CommunicationType = 'Email' | 'Meeting' | 'PhoneCall' | 'Letter' | 'Report' | 'Other';

export interface DonorCommunicationDto {
  id: string;
  donorId: string;
  grantId: string | null;
  type: CommunicationType;
  subject: string;
  content: string | null;
  communicationDate: string;
  contactedBy: string;
  outcome: string | null;
}

export interface RecordCommunicationRequest {
  donorId: string;
  grantId?: string;
  type: CommunicationType;
  subject: string;
  content?: string;
  communicationDate: string;
  contactedBy: string;
  outcome?: string;
}
