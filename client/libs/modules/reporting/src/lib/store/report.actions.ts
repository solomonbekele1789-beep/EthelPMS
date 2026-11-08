import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ReportDto,
  ReportListItemDto,
  ReportApprovalDto,
  FinancialSummaryDto,
  CreateReportRequest,
  UpdateReportRequest,
  ApproveReportRequest,
  RejectReportRequest,
} from '../models/report.model';
import { ReportTemplateDto, CreateReportTemplateRequest, UpdateReportTemplateRequest } from '../models/report-template.model';

export const ReportActions = createActionGroup({
  source: 'Reporting',
  events: {
    // Reports CRUD
    'Load Reports': props<{ page: number; pageSize: number; projectId?: string; reportType?: string; status?: string }>(),
    'Load Reports Success': props<{ reports: ReportListItemDto[]; totalCount: number }>(),
    'Load Reports Failure': props<{ error: string }>(),

    'Load Report': props<{ id: string }>(),
    'Load Report Success': props<{ report: ReportDto }>(),
    'Load Report Failure': props<{ error: string }>(),

    'Create Report': props<{ request: CreateReportRequest }>(),
    'Create Report Success': props<{ id: string }>(),
    'Create Report Failure': props<{ error: string }>(),

    'Update Report': props<{ id: string; request: UpdateReportRequest }>(),
    'Update Report Success': emptyProps(),
    'Update Report Failure': props<{ error: string }>(),

    // Workflow
    'Submit Report': props<{ id: string }>(),
    'Submit Report Success': props<{ id: string }>(),
    'Submit Report Failure': props<{ error: string }>(),

    'Approve Report': props<{ id: string; request: ApproveReportRequest }>(),
    'Approve Report Success': props<{ id: string }>(),
    'Approve Report Failure': props<{ error: string }>(),

    'Reject Report': props<{ id: string; request: RejectReportRequest }>(),
    'Reject Report Success': props<{ id: string }>(),
    'Reject Report Failure': props<{ error: string }>(),

    // Approval history
    'Load Approval History': props<{ id: string }>(),
    'Load Approval History Success': props<{ approvals: ReportApprovalDto[] }>(),
    'Load Approval History Failure': props<{ error: string }>(),

    // Financial summary
    'Load Financial Summary': props<{ projectId: string; fiscalYear?: number }>(),
    'Load Financial Summary Success': props<{ summary: FinancialSummaryDto }>(),
    'Load Financial Summary Failure': props<{ error: string }>(),

    // Templates
    'Load Templates': props<{ reportType?: string }>(),
    'Load Templates Success': props<{ templates: ReportTemplateDto[] }>(),
    'Load Templates Failure': props<{ error: string }>(),

    'Load Template': props<{ id: string }>(),
    'Load Template Success': props<{ template: ReportTemplateDto }>(),
    'Load Template Failure': props<{ error: string }>(),

    'Create Template': props<{ request: CreateReportTemplateRequest }>(),
    'Create Template Success': props<{ id: string }>(),
    'Create Template Failure': props<{ error: string }>(),

    'Update Template': props<{ id: string; request: UpdateReportTemplateRequest }>(),
    'Update Template Success': emptyProps(),
    'Update Template Failure': props<{ error: string }>(),
  }
});
