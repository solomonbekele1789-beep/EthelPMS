import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ParticipantDto,
  ParticipantListItemDto,
  RegisterParticipantRequest,
  UpdateParticipantRequest,
} from '../models/participant.model';
import {
  GraduationBenchmarkDto,
  GraduationPipelineDto,
  GraduationDecisionDto,
  RejectGraduationRequest,
} from '../models/graduation.model';

export const ParticipantsActions = createActionGroup({
  source: 'Participants',
  events: {
    // Participants
    'Load Participants': props<{ projectId?: string; status?: string; search?: string; page?: number; pageSize?: number }>(),
    'Load Participants Success': props<{ participants: ParticipantListItemDto[]; totalCount: number }>(),
    'Load Participants Failure': props<{ error: string }>(),
    'Load Participant': props<{ id: string }>(),
    'Load Participant Success': props<{ participant: ParticipantDto }>(),
    'Load Participant Failure': props<{ error: string }>(),
    'Register Participant': props<{ request: RegisterParticipantRequest }>(),
    'Register Participant Success': props<{ id: string }>(),
    'Register Participant Failure': props<{ error: string }>(),
    'Update Participant': props<{ id: string; request: UpdateParticipantRequest }>(),
    'Update Participant Success': emptyProps(),
    'Update Participant Failure': props<{ error: string }>(),

    // Graduation
    'Load Benchmarks': props<{ projectId?: string; activeOnly?: boolean }>(),
    'Load Benchmarks Success': props<{ benchmarks: GraduationBenchmarkDto[] }>(),
    'Load Benchmarks Failure': props<{ error: string }>(),
    'Load Pipeline': props<{ projectId: string }>(),
    'Load Pipeline Success': props<{ pipeline: GraduationPipelineDto }>(),
    'Load Pipeline Failure': props<{ error: string }>(),
    'Load Decisions': props<{ projectId?: string; participantId?: string }>(),
    'Load Decisions Success': props<{ decisions: GraduationDecisionDto[] }>(),
    'Load Decisions Failure': props<{ error: string }>(),
    'Approve Decision': props<{ id: string }>(),
    'Approve Decision Success': emptyProps(),
    'Approve Decision Failure': props<{ error: string }>(),
    'Reject Decision': props<{ id: string; request: RejectGraduationRequest }>(),
    'Reject Decision Success': emptyProps(),
    'Reject Decision Failure': props<{ error: string }>(),
  }
});
