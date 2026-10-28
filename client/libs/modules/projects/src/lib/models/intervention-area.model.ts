export interface InterventionAreaDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  parentId?: string;
  children: InterventionAreaDto[];
}

export interface ProjectInterventionAreaDto {
  id: string;
  interventionAreaId: string;
  interventionAreaName: string;
  budgetAllocated: number;
  budgetPercentage: number;
  directBeneficiariesMale: number;
  directBeneficiariesFemale: number;
  indirectBeneficiariesMale: number;
  indirectBeneficiariesFemale: number;
}

export interface CreateInterventionAreaRequest {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
}

export interface UpdateInterventionAreaRequest {
  interventionAreaId: string;
  name: string;
  code: string;
  description?: string;
}

export interface AllocateInterventionAreaRequest {
  projectId: string;
  interventionAreaId: string;
  budgetAllocated: number;
  budgetPercentage: number;
  directBeneficiariesMale: number;
  directBeneficiariesFemale: number;
  indirectBeneficiariesMale: number;
  indirectBeneficiariesFemale: number;
}
