export interface ProjectDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  operationalStatus: OperationalStatus;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currencyId: string;
  donorName?: string;
  sector?: string;
  programPillar?: string;
  directBeneficiariesMale: number;
  directBeneficiariesFemale: number;
  indirectBeneficiariesMale: number;
  indirectBeneficiariesFemale: number;
  beneficiariesPwd: number;
  totalDirectBeneficiaries: number;
  totalIndirectBeneficiaries: number;
  assumptions?: string;
  risks?: string;
  meansOfVerification?: string;
  scope?: string;
  officeId?: string;
  projectManagerId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ProjectListItemDto {
  id: string;
  code: string;
  name: string;
  status: ProjectStatus;
  operationalStatus: OperationalStatus;
  startDate: string;
  endDate: string;
  totalBudget: number;
  donorName?: string;
  totalDirectBeneficiaries: number;
  createdAt: string;
}

export interface CreateProjectRequest {
  code: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currencyId: string;
  donorName?: string;
  sector?: string;
  programPillar?: string;
  officeId?: string;
  projectManagerId?: string;
}

export interface UpdateProjectRequest {
  projectId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  donorName?: string;
  sector?: string;
  programPillar?: string;
}

export interface AddTeamMemberRequest {
  projectId: string;
  userId: string;
  role: string;
}

export interface RejectProjectRequest {
  projectId: string;
  reason: string;
}

export type ProjectStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Amendment';
export type OperationalStatus = 'NotStarted' | 'InProgress' | 'Suspended' | 'Completed' | 'Cancelled';
