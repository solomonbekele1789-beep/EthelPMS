import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState, PROJECTS_FEATURE_KEY } from './project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>(PROJECTS_FEATURE_KEY);

export const selectProjects = createSelector(selectProjectState, (state) => state.projects);

export const selectProjectTotalCount = createSelector(selectProjectState, (state) => state.totalCount);

export const selectProjectsLoading = createSelector(selectProjectState, (state) => state.loading);

export const selectProjectsError = createSelector(selectProjectState, (state) => state.error);

export const selectSelectedProject = createSelector(selectProjectState, (state) => state.selectedProject);

export const selectLogframe = createSelector(selectProjectState, (state) => state.logframe);
