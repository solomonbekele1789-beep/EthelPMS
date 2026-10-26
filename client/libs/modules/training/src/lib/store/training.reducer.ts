import { createFeature, createReducer, on } from '@ngrx/store';
import { TrainingProgramDto } from '../models/training-program.model';
import { TrainingSessionDto } from '../models/training-session.model';
import { TrainerDto } from '../models/trainer.model';
import { TrainingActions } from './training.actions';

export const TRAINING_FEATURE_KEY = 'training';

export interface TrainingState {
  programs: TrainingProgramDto[];
  programsTotalCount: number;
  sessions: TrainingSessionDto[];
  sessionsTotalCount: number;
  selectedSession: TrainingSessionDto | null;
  trainers: TrainerDto[];
  trainersTotalCount: number;
  loading: boolean;
  error: string | null;
}

export const initialTrainingState: TrainingState = {
  programs: [],
  programsTotalCount: 0,
  sessions: [],
  sessionsTotalCount: 0,
  selectedSession: null,
  trainers: [],
  trainersTotalCount: 0,
  loading: false,
  error: null,
};

export const trainingFeature = createFeature({
  name: TRAINING_FEATURE_KEY,
  reducer: createReducer(
    initialTrainingState,

    // Training Programs
    on(TrainingActions.loadPrograms, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(TrainingActions.loadProgramsSuccess, (state, { programs, totalCount }) => ({
      ...state,
      programs,
      programsTotalCount: totalCount,
      loading: false,
    })),
    on(TrainingActions.loadProgramsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(TrainingActions.createProgram, (state) => ({
      ...state,
      loading: true,
    })),
    on(TrainingActions.createProgramSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(TrainingActions.createProgramFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Training Sessions
    on(TrainingActions.loadSessions, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(TrainingActions.loadSessionsSuccess, (state, { sessions, totalCount }) => ({
      ...state,
      sessions,
      sessionsTotalCount: totalCount,
      loading: false,
    })),
    on(TrainingActions.loadSessionsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(TrainingActions.loadSession, (state) => ({
      ...state,
      loading: true,
      selectedSession: null,
    })),
    on(TrainingActions.loadSessionSuccess, (state, { session }) => ({
      ...state,
      selectedSession: session,
      loading: false,
    })),
    on(TrainingActions.loadSessionFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(TrainingActions.createSession, (state) => ({
      ...state,
      loading: true,
    })),
    on(TrainingActions.createSessionSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(TrainingActions.createSessionFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Trainers
    on(TrainingActions.loadTrainers, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(TrainingActions.loadTrainersSuccess, (state, { trainers, totalCount }) => ({
      ...state,
      trainers,
      trainersTotalCount: totalCount,
      loading: false,
    })),
    on(TrainingActions.loadTrainersFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(TrainingActions.createTrainer, (state) => ({
      ...state,
      loading: true,
    })),
    on(TrainingActions.createTrainerSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(TrainingActions.createTrainerFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
  ),
});

export const trainingReducer = trainingFeature.reducer;
