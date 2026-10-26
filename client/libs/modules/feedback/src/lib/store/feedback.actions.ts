import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FeedbackItemDto, SubmitFeedbackRequest } from '../models/feedback.model';
import { FeedbackCategoryDto } from '../models/feedback-category.model';
import { FeedbackDashboardDto } from '../models/feedback-dashboard.model';

export const FeedbackActions = createActionGroup({
  source: 'Feedback',
  events: {
    'Load Feedback': props<{ page?: number; pageSize?: number; status?: string; type?: string; feedbackCategoryId?: string; projectId?: string; isConfidential?: boolean }>(),
    'Load Feedback Success': props<{ items: FeedbackItemDto[]; totalCount: number }>(),
    'Load Feedback Failure': props<{ error: string }>(),
    'Load Feedback Item': props<{ id: string }>(),
    'Load Feedback Item Success': props<{ item: FeedbackItemDto }>(),
    'Load Feedback Item Failure': props<{ error: string }>(),
    'Submit Feedback': props<{ request: SubmitFeedbackRequest }>(),
    'Submit Feedback Success': props<{ id: string }>(),
    'Submit Feedback Failure': props<{ error: string }>(),
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: FeedbackCategoryDto[] }>(),
    'Load Categories Failure': props<{ error: string }>(),
    'Load Dashboard': emptyProps(),
    'Load Dashboard Success': props<{ dashboard: FeedbackDashboardDto }>(),
    'Load Dashboard Failure': props<{ error: string }>(),
  },
});
