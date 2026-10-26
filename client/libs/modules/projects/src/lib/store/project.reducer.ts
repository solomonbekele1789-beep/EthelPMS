import { createReducer, on } from '@ngrx/store';
import { ProjectDto, ProjectListItemDto } from '../models/project.model';
import { LogframeDto } from '../models/logframe.model';
import { ProjectActions } from './project.actions';

export const PROJECTS_FEATURE_KEY = 'projects';

export interface ProjectState {
  projects: ProjectListItemDto[];
  totalCount: number;
  selectedProject: ProjectDto | null;
  logframe: LogframeDto | null;
  loading: boolean;
  error: string | null;
}

export const initialProjectState: ProjectState = {
  projects: [],
  totalCount: 0,
  selectedProject: null,
  logframe: null,
  loading: false,
  error: null,
};

export const projectReducer = createReducer(
  initialProjectState,

  on(ProjectActions.loadProjects, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProjectActions.loadProjectsSuccess, (state, { projects, totalCount }) => ({
    ...state,
    projects,
    totalCount,
    loading: false,
  })),
  on(ProjectActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProjectActions.loadProject, (state) => ({
    ...state,
    loading: true,
    selectedProject: null,
  })),
  on(ProjectActions.loadProjectSuccess, (state, { project }) => ({
    ...state,
    selectedProject: project,
    loading: false,
  })),
  on(ProjectActions.loadProjectFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProjectActions.createProject, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProjectActions.createProjectSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProjectActions.createProjectFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProjectActions.updateProject, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProjectActions.updateProjectSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProjectActions.updateProjectFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProjectActions.submitProject, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProjectActions.submitProjectSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProjectActions.submitProjectFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProjectActions.approveProject, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProjectActions.approveProjectSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProjectActions.approveProjectFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProjectActions.rejectProject, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProjectActions.rejectProjectSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProjectActions.rejectProjectFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProjectActions.loadLogframe, (state) => ({
    ...state,
    loading: true,
    logframe: null,
  })),
  on(ProjectActions.loadLogframeSuccess, (state, { logframe }) => ({
    ...state,
    logframe,
    loading: false,
  })),
  on(ProjectActions.loadLogframeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
