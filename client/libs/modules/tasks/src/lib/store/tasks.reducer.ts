import { createFeature, createReducer, on } from '@ngrx/store';
import { TaskBoardDto } from '../models/task-board.model';
import { TaskItemDto, TaskCommentDto } from '../models/task-item.model';
import { TasksActions } from './tasks.actions';

export const TASKS_FEATURE_KEY = 'tasks';

export interface TasksState {
  board: TaskBoardDto | null;
  tasks: TaskItemDto[];
  tasksTotalCount: number;
  selectedTask: TaskItemDto | null;
  comments: TaskCommentDto[];
  loading: boolean;
  error: string | null;
}

export const initialTasksState: TasksState = {
  board: null,
  tasks: [],
  tasksTotalCount: 0,
  selectedTask: null,
  comments: [],
  loading: false,
  error: null,
};

export const tasksFeature = createFeature({
  name: TASKS_FEATURE_KEY,
  reducer: createReducer(
    initialTasksState,

    // Task Boards
    on(TasksActions.loadBoard, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(TasksActions.loadBoardSuccess, (state, { board }) => ({
      ...state,
      board,
      loading: false,
    })),
    on(TasksActions.loadBoardFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(TasksActions.createBoard, (state) => ({
      ...state,
      loading: true,
    })),
    on(TasksActions.createBoardSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(TasksActions.createBoardFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Task Items
    on(TasksActions.loadTasks, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(TasksActions.loadTasksSuccess, (state, { tasks, totalCount }) => ({
      ...state,
      tasks,
      tasksTotalCount: totalCount,
      loading: false,
    })),
    on(TasksActions.loadTasksFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(TasksActions.loadTask, (state) => ({
      ...state,
      loading: true,
      selectedTask: null,
    })),
    on(TasksActions.loadTaskSuccess, (state, { task }) => ({
      ...state,
      selectedTask: task,
      loading: false,
    })),
    on(TasksActions.loadTaskFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(TasksActions.createTask, (state) => ({
      ...state,
      loading: true,
    })),
    on(TasksActions.createTaskSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(TasksActions.createTaskFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Comments
    on(TasksActions.loadComments, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(TasksActions.loadCommentsSuccess, (state, { comments }) => ({
      ...state,
      comments,
      loading: false,
    })),
    on(TasksActions.loadCommentsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
  ),
});

export const tasksReducer = tasksFeature.reducer;
