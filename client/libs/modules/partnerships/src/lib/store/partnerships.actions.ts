import { createActionGroup, props } from '@ngrx/store';
import { SubGranteeDto, SubGranteeListDto, RegisterSubGranteeRequest } from '../models/sub-grantee.model';
import { DisbursementDto, CreateDisbursementRequest } from '../models/disbursement.model';
import { PartnerReportDto, PartnerReportListDto, CreatePartnerReportRequest } from '../models/partner-report.model';
import { PartnerComplianceDto, CreateComplianceCheckRequest } from '../models/compliance.model';
import { PartnershipDashboardDto } from '../models/partnership-dashboard.model';

export const PartnershipsActions = createActionGroup({
  source: 'Partnerships',
  events: {
    // Sub-Grantees
    'Load Sub Grantees': props<{ status?: string; partnerType?: string }>(),
    'Load Sub Grantees Success': props<{ subGrantees: SubGranteeListDto[] }>(),
    'Load Sub Grantees Failure': props<{ error: string }>(),
    'Load Sub Grantee': props<{ id: string }>(),
    'Load Sub Grantee Success': props<{ subGrantee: SubGranteeDto }>(),
    'Load Sub Grantee Failure': props<{ error: string }>(),
    'Register Sub Grantee': props<{ request: RegisterSubGranteeRequest }>(),
    'Register Sub Grantee Success': props<{ id: string }>(),
    'Register Sub Grantee Failure': props<{ error: string }>(),

    // Disbursements
    'Load Disbursements': props<{ subGranteeId?: string }>(),
    'Load Disbursements Success': props<{ disbursements: DisbursementDto[] }>(),
    'Load Disbursements Failure': props<{ error: string }>(),
    'Create Disbursement': props<{ request: CreateDisbursementRequest }>(),
    'Create Disbursement Success': props<{ id: string }>(),
    'Create Disbursement Failure': props<{ error: string }>(),

    // Partner Reports
    'Load Reports': props<{ subGranteeId?: string; status?: string }>(),
    'Load Reports Success': props<{ reports: PartnerReportListDto[] }>(),
    'Load Reports Failure': props<{ error: string }>(),
    'Load Report': props<{ id: string }>(),
    'Load Report Success': props<{ report: PartnerReportDto }>(),
    'Load Report Failure': props<{ error: string }>(),
    'Create Report': props<{ request: CreatePartnerReportRequest }>(),
    'Create Report Success': props<{ id: string }>(),
    'Create Report Failure': props<{ error: string }>(),

    // Compliance
    'Load Compliance Checks': props<{ subGranteeId?: string }>(),
    'Load Compliance Checks Success': props<{ complianceChecks: PartnerComplianceDto[] }>(),
    'Load Compliance Checks Failure': props<{ error: string }>(),
    'Create Compliance Check': props<{ request: CreateComplianceCheckRequest }>(),
    'Create Compliance Check Success': props<{ id: string }>(),
    'Create Compliance Check Failure': props<{ error: string }>(),

    // Dashboard
    'Load Dashboard': props<Record<string, never>>(),
    'Load Dashboard Success': props<{ dashboard: PartnershipDashboardDto }>(),
    'Load Dashboard Failure': props<{ error: string }>(),
  },
});
