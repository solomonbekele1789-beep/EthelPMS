import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ReportTemplateDto,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
} from '../models/report-template.model';
import {
  ReportScheduleDto,
  CreateReportScheduleRequest,
  UpdateReportScheduleRequest,
} from '../models/report-schedule.model';
import {
  GeneratedReportDto,
  GenerateReportRequest,
  ShareReportRequest,
} from '../models/generated-report.model';

export const ReportsActions = createActionGroup({
  source: 'Reports',
  events: {
    // Templates
    'Load Templates': props<{ module?: string }>(),
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
    'Delete Template': props<{ id: string }>(),
    'Delete Template Success': props<{ id: string }>(),
    'Delete Template Failure': props<{ error: string }>(),

    // Schedules
    'Load Schedules': emptyProps(),
    'Load Schedules Success': props<{ schedules: ReportScheduleDto[] }>(),
    'Load Schedules Failure': props<{ error: string }>(),
    'Create Schedule': props<{ request: CreateReportScheduleRequest }>(),
    'Create Schedule Success': props<{ id: string }>(),
    'Create Schedule Failure': props<{ error: string }>(),
    'Update Schedule': props<{ id: string; request: UpdateReportScheduleRequest }>(),
    'Update Schedule Success': emptyProps(),
    'Update Schedule Failure': props<{ error: string }>(),
    'Delete Schedule': props<{ id: string }>(),
    'Delete Schedule Success': props<{ id: string }>(),
    'Delete Schedule Failure': props<{ error: string }>(),

    // Generated Reports
    'Load Generated Reports': props<{ templateId?: string; dateFrom?: string; dateTo?: string }>(),
    'Load Generated Reports Success': props<{ reports: GeneratedReportDto[] }>(),
    'Load Generated Reports Failure': props<{ error: string }>(),
    'Load Generated Report': props<{ id: string }>(),
    'Load Generated Report Success': props<{ report: GeneratedReportDto }>(),
    'Load Generated Report Failure': props<{ error: string }>(),
    'Generate Report': props<{ request: GenerateReportRequest }>(),
    'Generate Report Success': props<{ id: string }>(),
    'Generate Report Failure': props<{ error: string }>(),
    'Share Report': props<{ id: string; request: ShareReportRequest }>(),
    'Share Report Success': emptyProps(),
    'Share Report Failure': props<{ error: string }>(),
  },
});
