export interface ParticipantServiceDto {
  id: string;
  participantId: string;
  projectId: string;
  activityId?: string;
  serviceName: string;
  description?: string;
  serviceDate: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

export interface RecordServiceRequest {
  participantId: string;
  projectId: string;
  serviceName: string;
  serviceDate: string;
  activityId?: string;
  description?: string;
  quantity?: number;
  unit?: string;
}
