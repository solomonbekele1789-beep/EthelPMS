import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrainingState, TRAINING_FEATURE_KEY } from './training.reducer';

export const selectTrainingState = createFeatureSelector<TrainingState>(TRAINING_FEATURE_KEY);
export const selectPrograms = createSelector(selectTrainingState, (state) => state.programs);
export const selectProgramsTotalCount = createSelector(selectTrainingState, (state) => state.programsTotalCount);
export const selectSessions = createSelector(selectTrainingState, (state) => state.sessions);
export const selectSessionsTotalCount = createSelector(selectTrainingState, (state) => state.sessionsTotalCount);
export const selectSelectedSession = createSelector(selectTrainingState, (state) => state.selectedSession);
export const selectTrainers = createSelector(selectTrainingState, (state) => state.trainers);
export const selectTrainersTotalCount = createSelector(selectTrainingState, (state) => state.trainersTotalCount);
export const selectTrainingLoading = createSelector(selectTrainingState, (state) => state.loading);
export const selectTrainingError = createSelector(selectTrainingState, (state) => state.error);
