import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ProjectDto,
  ProjectListItemDto,
  CreateProjectRequest,
  UpdateProjectRequest,
  RejectProjectRequest,
  ProjectStatus,
} from '../models/project.model';
import { LogframeDto } from '../models/logframe.model';

export const ProjectActions = createActionGroup({
  source: 'Projects',
  events: {
    'Load Projects': props<{ page: number; pageSize: number; search?: string; status?: ProjectStatus }>(),
    'Load Projects Success': props<{ projects: ProjectListItemDto[]; totalCount: number }>(),
    'Load Projects Failure': props<{ error: string }>(),
    'Load Project': props<{ id: string }>(),
    'Load Project Success': props<{ project: ProjectDto }>(),
    'Load Project Failure': props<{ error: string }>(),
    'Create Project': props<{ request: CreateProjectRequest }>(),
    'Create Project Success': props<{ id: string }>(),
    'Create Project Failure': props<{ error: string }>(),
    'Update Project': props<{ id: string; request: UpdateProjectRequest }>(),
    'Update Project Success': emptyProps(),
    'Update Project Failure': props<{ error: string }>(),
    'Submit Project': props<{ id: string }>(),
    'Submit Project Success': props<{ id: string }>(),
    'Submit Project Failure': props<{ error: string }>(),
    'Approve Project': props<{ id: string }>(),
    'Approve Project Success': props<{ id: string }>(),
    'Approve Project Failure': props<{ error: string }>(),
    'Reject Project': props<{ id: string; request: RejectProjectRequest }>(),
    'Reject Project Success': props<{ id: string }>(),
    'Reject Project Failure': props<{ error: string }>(),
    'Load Logframe': props<{ projectId: string }>(),
    'Load Logframe Success': props<{ logframe: LogframeDto }>(),
    'Load Logframe Failure': props<{ error: string }>(),
  }
});
