import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  MealPlanDto,
  MealIndicatorDto,
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
  RejectMealPlanRequest,
  AddMealIndicatorRequest,
} from '../models/meal-plan.model';
import { EvaluationDto, CreateEvaluationRequest } from '../models/evaluation.model';
import { GesiAssessmentDto, CreateGesiAssessmentRequest } from '../models/gesi.model';
import { LessonLearnedDto, CreateLessonLearnedRequest } from '../models/lesson.model';

export const MealActions = createActionGroup({
  source: 'MEAL',
  events: {
    // MEAL Plans
    'Load Plans': props<{ page: number; pageSize: number; projectId?: string }>(),
    'Load Plans Success': props<{ plans: MealPlanDto[]; totalCount: number }>(),
    'Load Plans Failure': props<{ error: string }>(),

    'Load Plan': props<{ id: string }>(),
    'Load Plan Success': props<{ plan: MealPlanDto }>(),
    'Load Plan Failure': props<{ error: string }>(),

    'Create Plan': props<{ request: CreateMealPlanRequest }>(),
    'Create Plan Success': props<{ id: string }>(),
    'Create Plan Failure': props<{ error: string }>(),

    'Update Plan': props<{ id: string; request: UpdateMealPlanRequest }>(),
    'Update Plan Success': emptyProps(),
    'Update Plan Failure': props<{ error: string }>(),

    'Submit Plan': props<{ id: string }>(),
    'Submit Plan Success': props<{ id: string }>(),
    'Submit Plan Failure': props<{ error: string }>(),

    'Approve Plan': props<{ id: string }>(),
    'Approve Plan Success': props<{ id: string }>(),
    'Approve Plan Failure': props<{ error: string }>(),

    'Reject Plan': props<{ id: string; request: RejectMealPlanRequest }>(),
    'Reject Plan Success': props<{ id: string }>(),
    'Reject Plan Failure': props<{ error: string }>(),

    // Evaluations
    'Load Evaluations': props<{ projectId?: string; status?: string }>(),
    'Load Evaluations Success': props<{ evaluations: EvaluationDto[] }>(),
    'Load Evaluations Failure': props<{ error: string }>(),

    'Load Evaluation': props<{ id: string }>(),
    'Load Evaluation Success': props<{ evaluation: EvaluationDto }>(),
    'Load Evaluation Failure': props<{ error: string }>(),

    'Create Evaluation': props<{ request: CreateEvaluationRequest }>(),
    'Create Evaluation Success': props<{ id: string }>(),
    'Create Evaluation Failure': props<{ error: string }>(),

    // GESI
    'Load Gesi Assessments': props<{ projectId: string }>(),
    'Load Gesi Assessments Success': props<{ assessments: GesiAssessmentDto[] }>(),
    'Load Gesi Assessments Failure': props<{ error: string }>(),

    // Lessons
    'Load Lessons': props<{ projectId?: string; category?: string }>(),
    'Load Lessons Success': props<{ lessons: LessonLearnedDto[] }>(),
    'Load Lessons Failure': props<{ error: string }>(),

    'Create Lesson': props<{ request: CreateLessonLearnedRequest }>(),
    'Create Lesson Success': props<{ id: string }>(),
    'Create Lesson Failure': props<{ error: string }>(),
  }
});
