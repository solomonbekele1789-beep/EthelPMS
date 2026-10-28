import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState, TASKS_FEATURE_KEY } from './tasks.reducer';

export const selectTasksState = createFeatureSelector<TasksState>(TASKS_FEATURE_KEY);
export const selectBoard = createSelector(selectTasksState, (state) => state.board);
export const selectBoardLists = createSelector(selectTasksState, (state) => state.board?.lists ?? []);
export const selectTasks = createSelector(selectTasksState, (state) => state.tasks);
export const selectTasksTotalCount = createSelector(selectTasksState, (state) => state.tasksTotalCount);
export const selectSelectedTask = createSelector(selectTasksState, (state) => state.selectedTask);
export const selectComments = createSelector(selectTasksState, (state) => state.comments);
export const selectTasksLoading = createSelector(selectTasksState, (state) => state.loading);
export const selectTasksError = createSelector(selectTasksState, (state) => state.error);
