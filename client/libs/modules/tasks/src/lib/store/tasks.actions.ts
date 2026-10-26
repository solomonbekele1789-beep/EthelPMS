import { createActionGroup, props } from '@ngrx/store';
import {
  TaskBoardDto,
  CreateTaskBoardRequest,
} from '../models/task-board.model';
import {
  TaskItemDto,
  CreateTaskRequest,
  TaskCommentDto,
} from '../models/task-item.model';

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    // Task Boards
    'Load Board': props<{ id: string }>(),
    'Load Board Success': props<{ board: TaskBoardDto }>(),
    'Load Board Failure': props<{ error: string }>(),
    'Create Board': props<{ request: CreateTaskBoardRequest }>(),
    'Create Board Success': props<{ id: string }>(),
    'Create Board Failure': props<{ error: string }>(),

    // Task Items
    'Load Tasks': props<{ boardId?: string; listId?: string; projectId?: string; status?: string; assignedToUserId?: string; search?: string; page?: number; pageSize?: number }>(),
    'Load Tasks Success': props<{ tasks: TaskItemDto[]; totalCount: number }>(),
    'Load Tasks Failure': props<{ error: string }>(),
    'Load Task': props<{ id: string }>(),
    'Load Task Success': props<{ task: TaskItemDto }>(),
    'Load Task Failure': props<{ error: string }>(),
    'Create Task': props<{ request: CreateTaskRequest }>(),
    'Create Task Success': props<{ id: string }>(),
    'Create Task Failure': props<{ error: string }>(),

    // Comments
    'Load Comments': props<{ taskId: string }>(),
    'Load Comments Success': props<{ comments: TaskCommentDto[] }>(),
    'Load Comments Failure': props<{ error: string }>(),
  }
});
