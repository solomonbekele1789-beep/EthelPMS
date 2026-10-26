import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ParticipantsState, PARTICIPANTS_FEATURE_KEY } from './participants.reducer';

export const selectParticipantsState = createFeatureSelector<ParticipantsState>(PARTICIPANTS_FEATURE_KEY);
export const selectParticipants = createSelector(selectParticipantsState, (state) => state.participants);
export const selectParticipantsTotalCount = createSelector(selectParticipantsState, (state) => state.totalCount);
export const selectParticipantsLoading = createSelector(selectParticipantsState, (state) => state.loading);
export const selectParticipantsError = createSelector(selectParticipantsState, (state) => state.error);
export const selectSelectedParticipant = createSelector(selectParticipantsState, (state) => state.selectedParticipant);
export const selectBenchmarks = createSelector(selectParticipantsState, (state) => state.benchmarks);
export const selectPipeline = createSelector(selectParticipantsState, (state) => state.pipeline);
export const selectDecisions = createSelector(selectParticipantsState, (state) => state.decisions);
