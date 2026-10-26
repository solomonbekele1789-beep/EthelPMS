import { createActionGroup, props } from '@ngrx/store';
import {
  TrainingProgramDto,
  CreateTrainingProgramRequest,
} from '../models/training-program.model';
import {
  TrainingSessionDto,
  CreateTrainingSessionRequest,
} from '../models/training-session.model';
import { TrainerDto, CreateTrainerRequest } from '../models/trainer.model';

export const TrainingActions = createActionGroup({
  source: 'Training',
  events: {
    // Training Programs
    'Load Programs': props<{ projectId?: string; category?: string; page?: number; pageSize?: number }>(),
    'Load Programs Success': props<{ programs: TrainingProgramDto[]; totalCount: number }>(),
    'Load Programs Failure': props<{ error: string }>(),
    'Create Program': props<{ request: CreateTrainingProgramRequest }>(),
    'Create Program Success': props<{ id: string }>(),
    'Create Program Failure': props<{ error: string }>(),

    // Training Sessions
    'Load Sessions': props<{ programId?: string; status?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number }>(),
    'Load Sessions Success': props<{ sessions: TrainingSessionDto[]; totalCount: number }>(),
    'Load Sessions Failure': props<{ error: string }>(),
    'Load Session': props<{ id: string }>(),
    'Load Session Success': props<{ session: TrainingSessionDto }>(),
    'Load Session Failure': props<{ error: string }>(),
    'Create Session': props<{ request: CreateTrainingSessionRequest }>(),
    'Create Session Success': props<{ id: string }>(),
    'Create Session Failure': props<{ error: string }>(),

    // Trainers
    'Load Trainers': props<{ page?: number; pageSize?: number }>(),
    'Load Trainers Success': props<{ trainers: TrainerDto[]; totalCount: number }>(),
    'Load Trainers Failure': props<{ error: string }>(),
    'Create Trainer': props<{ request: CreateTrainerRequest }>(),
    'Create Trainer Success': props<{ id: string }>(),
    'Create Trainer Failure': props<{ error: string }>(),
  }
});
