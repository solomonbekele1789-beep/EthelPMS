export interface InterventionAreaDto {
  id: string;
  name: string;
  code: string;
  areaType: string; // 'Country' | 'Region' | 'Zone' | 'Woreda' | 'Kebele' | 'Site'
  description?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  accuracy?: number;
  gpsSource?: string;
  landmarkOrAddress?: string;
  parentId?: string;
  parentName?: string;
  children: InterventionAreaDto[];
}

export interface ProjectInterventionAreaDto {
  id: string;
  interventionAreaId: string;
  interventionAreaName: string;
  interventionAreaCode?: string;
  areaType?: string;
  parentName?: string;
  latitude?: number;
  longitude?: number;
  landmarkOrAddress?: string;
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
  areaType?: string;
  description?: string;
  parentId?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  accuracy?: number;
  gpsSource?: string;
  landmarkOrAddress?: string;
}

export interface UpdateInterventionAreaRequest {
  interventionAreaId: string;
  name: string;
  code?: string;
  areaType?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  accuracy?: number;
  gpsSource?: string;
  landmarkOrAddress?: string;
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
