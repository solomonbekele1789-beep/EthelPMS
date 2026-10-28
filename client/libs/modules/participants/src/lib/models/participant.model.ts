export type ParticipantStatus = 'Active' | 'Inactive' | 'Graduated' | 'Exited';
export type Gender = 'Male' | 'Female' | 'Other';
export type EnrollmentStatus = 'Enrolled' | 'Completed' | 'Exited' | 'Graduated';

export interface ParticipantDto {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  participantCode: string;
  gender: string;
  dateOfBirth?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
  status: ParticipantStatus;
  registrationDate: string;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  vulnerabilityScore?: number;
  householdId?: string;
  photoUrl?: string;
  createdAt: string;
  enrollments: ParticipantEnrollmentDto[];
}

export interface ParticipantListItemDto {
  id: string;
  fullName: string;
  participantCode: string;
  gender: string;
  status: ParticipantStatus;
  woreda?: string;
  vulnerabilityScore?: number;
  registrationDate: string;
}

export interface ParticipantEnrollmentDto {
  id: string;
  participantId: string;
  projectId: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  exitDate?: string;
  exitReason?: string;
  cohortName?: string;
}

export interface RegisterParticipantRequest {
  firstName: string;
  lastName: string;
  gender: Gender;
  middleName?: string;
  dateOfBirth?: string;
  idNumber?: string;
  phone?: string;
}

export interface UpdateParticipantRequest {
  participantId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  middleName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
}

export interface UpdateAddressRequest {
  participantId: string;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  address?: string;
}

export interface EnrollParticipantRequest {
  participantId: string;
  projectId: string;
  cohortName?: string;
}

export interface ExitEnrollmentRequest {
  enrollmentId: string;
  reason: string;
}
