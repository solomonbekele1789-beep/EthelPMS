export type TrainingStatus = 'Draft' | 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
export type AttendanceStatus = 'Registered' | 'Attended' | 'Absent' | 'WalkIn';

export interface TrainingSessionDto {
  id: string;
  trainingProgramId: string;
  title: string;
  venue?: string;
  scheduledDate: string;
  endDate?: string;
  status: string;
  maxParticipants?: number;
  notes?: string;
  createdAt: string;
  participants: TrainingParticipantDto[];
}

export interface TrainingParticipantDto {
  id: string;
  trainingSessionId: string;
  participantId?: string;
  fullName: string;
  status: string;
  attendedAt?: string;
  preTestScore?: number;
  postTestScore?: number;
  certificateNumber?: string;
}

export interface CreateTrainingSessionRequest {
  trainingProgramId: string;
  title: string;
  scheduledDate: string;
  venue?: string;
  endDate?: string;
  maxParticipants?: number;
  notes?: string;
}

export interface RegisterParticipantRequest {
  trainingSessionId: string;
  fullName: string;
  participantId?: string;
}

export interface RecordAttendanceRequest {
  trainingParticipantId: string;
  status: AttendanceStatus;
}
