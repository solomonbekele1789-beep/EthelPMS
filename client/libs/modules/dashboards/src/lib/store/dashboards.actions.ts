import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  DashboardConfigDto,
  DashboardSummaryDto,
  CreateDashboardRequest,
  UpdateDashboardRequest,
} from '../models/dashboard.model';
import {
  DashboardWidgetDto,
  AddWidgetRequest,
  UpdateWidgetRequest,
} from '../models/widget.model';
import {
  SavedFilterDto,
  CreateSavedFilterRequest,
} from '../models/saved-filter.model';

export const DashboardActions = createActionGroup({
  source: 'Dashboards',
  events: {
    // Dashboards CRUD
    'Load Dashboards': emptyProps(),
    'Load Dashboards Success': props<{ dashboards: DashboardSummaryDto[] }>(),
    'Load Dashboards Failure': props<{ error: string }>(),

    'Load Dashboard': props<{ id: string }>(),
    'Load Dashboard Success': props<{ dashboard: DashboardConfigDto }>(),
    'Load Dashboard Failure': props<{ error: string }>(),

    'Create Dashboard': props<{ request: CreateDashboardRequest }>(),
    'Create Dashboard Success': props<{ id: string }>(),
    'Create Dashboard Failure': props<{ error: string }>(),

    'Update Dashboard': props<{ id: string; request: UpdateDashboardRequest }>(),
    'Update Dashboard Success': emptyProps(),
    'Update Dashboard Failure': props<{ error: string }>(),

    'Delete Dashboard': props<{ id: string }>(),
    'Delete Dashboard Success': props<{ id: string }>(),
    'Delete Dashboard Failure': props<{ error: string }>(),

    // Widgets CRUD
    'Load Widgets': props<{ dashboardId: string }>(),
    'Load Widgets Success': props<{ widgets: DashboardWidgetDto[] }>(),
    'Load Widgets Failure': props<{ error: string }>(),

    'Add Widget': props<{ dashboardId: string; request: AddWidgetRequest }>(),
    'Add Widget Success': props<{ id: string; dashboardId: string }>(),
    'Add Widget Failure': props<{ error: string }>(),

    'Update Widget': props<{ dashboardId: string; widgetId: string; request: UpdateWidgetRequest }>(),
    'Update Widget Success': props<{ dashboardId: string }>(),
    'Update Widget Failure': props<{ error: string }>(),

    'Remove Widget': props<{ dashboardId: string; widgetId: string }>(),
    'Remove Widget Success': props<{ widgetId: string; dashboardId: string }>(),
    'Remove Widget Failure': props<{ error: string }>(),

    // Saved Filters CRUD
    'Load Filters': props<{ module?: string }>(),
    'Load Filters Success': props<{ filters: SavedFilterDto[] }>(),
    'Load Filters Failure': props<{ error: string }>(),

    'Create Filter': props<{ request: CreateSavedFilterRequest }>(),
    'Create Filter Success': props<{ id: string }>(),
    'Create Filter Failure': props<{ error: string }>(),

    'Delete Filter': props<{ id: string }>(),
    'Delete Filter Success': props<{ id: string }>(),
    'Delete Filter Failure': props<{ error: string }>(),
  },
});
