import { createReducer, on } from '@ngrx/store';
import { ParticipantDto, ParticipantListItemDto } from '../models/participant.model';
import { GraduationBenchmarkDto, GraduationPipelineDto, GraduationDecisionDto } from '../models/graduation.model';
import { ParticipantsActions } from './participants.actions';

export const PARTICIPANTS_FEATURE_KEY = 'participants';

export interface ParticipantsState {
  participants: ParticipantListItemDto[];
  totalCount: number;
  selectedParticipant: ParticipantDto | null;
  benchmarks: GraduationBenchmarkDto[];
  pipeline: GraduationPipelineDto | null;
  decisions: GraduationDecisionDto[];
  loading: boolean;
  error: string | null;
}

export const initialParticipantsState: ParticipantsState = {
  participants: [],
  totalCount: 0,
  selectedParticipant: null,
  benchmarks: [],
  pipeline: null,
  decisions: [],
  loading: false,
  error: null,
};

export const participantsReducer = createReducer(
  initialParticipantsState,

  // Participants
  on(ParticipantsActions.loadParticipants, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ParticipantsActions.loadParticipantsSuccess, (state, { participants, totalCount }) => ({
    ...state,
    participants,
    totalCount,
    loading: false,
  })),
  on(ParticipantsActions.loadParticipantsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ParticipantsActions.loadParticipant, (state) => ({
    ...state,
    loading: true,
    selectedParticipant: null,
  })),
  on(ParticipantsActions.loadParticipantSuccess, (state, { participant }) => ({
    ...state,
    selectedParticipant: participant,
    loading: false,
  })),
  on(ParticipantsActions.loadParticipantFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ParticipantsActions.registerParticipant, (state) => ({
    ...state,
    loading: true,
  })),
  on(ParticipantsActions.registerParticipantSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ParticipantsActions.registerParticipantFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ParticipantsActions.updateParticipant, (state) => ({
    ...state,
    loading: true,
  })),
  on(ParticipantsActions.updateParticipantSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ParticipantsActions.updateParticipantFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Graduation — Benchmarks
  on(ParticipantsActions.loadBenchmarks, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ParticipantsActions.loadBenchmarksSuccess, (state, { benchmarks }) => ({
    ...state,
    benchmarks,
    loading: false,
  })),
  on(ParticipantsActions.loadBenchmarksFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Graduation — Pipeline
  on(ParticipantsActions.loadPipeline, (state) => ({
    ...state,
    loading: true,
    pipeline: null,
  })),
  on(ParticipantsActions.loadPipelineSuccess, (state, { pipeline }) => ({
    ...state,
    pipeline,
    loading: false,
  })),
  on(ParticipantsActions.loadPipelineFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Graduation — Decisions
  on(ParticipantsActions.loadDecisions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ParticipantsActions.loadDecisionsSuccess, (state, { decisions }) => ({
    ...state,
    decisions,
    loading: false,
  })),
  on(ParticipantsActions.loadDecisionsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ParticipantsActions.approveDecision, (state) => ({
    ...state,
    loading: true,
  })),
  on(ParticipantsActions.approveDecisionSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ParticipantsActions.approveDecisionFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ParticipantsActions.rejectDecision, (state) => ({
    ...state,
    loading: true,
  })),
  on(ParticipantsActions.rejectDecisionSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ParticipantsActions.rejectDecisionFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
