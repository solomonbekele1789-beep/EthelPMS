export interface PartnershipDashboardDto {
  totalPartners: number;
  activePartners: number;
  totalDisbursed: number;
  pendingReports: number;
  overdueCompliance: number;
  riskDistribution: Record<string, number>;
}
