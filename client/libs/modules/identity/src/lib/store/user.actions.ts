import { createActionGroup, props } from '@ngrx/store';
import { UserDto, UserListItemDto, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

export const UserActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': props<{ page: number; pageSize: number; search?: string; sortBy?: string; sortDirection?: 'asc' | 'desc' }>(),
    'Load Users Success': props<{ users: UserListItemDto[]; totalCount: number }>(),
    'Load Users Failure': props<{ error: string }>(),
    'Load User': props<{ id: string }>(),
    'Load User Success': props<{ user: UserDto }>(),
    'Load User Failure': props<{ error: string }>(),
    'Create User': props<{ request: CreateUserRequest }>(),
    'Create User Success': props<{ user: UserDto }>(),
    'Create User Failure': props<{ error: string }>(),
    'Update User': props<{ id: string; request: UpdateUserRequest }>(),
    'Update User Success': props<{ user: UserDto }>(),
    'Update User Failure': props<{ error: string }>(),
    'Deactivate User': props<{ id: string }>(),
    'Deactivate User Success': props<{ id: string }>(),
    'Activate User': props<{ id: string }>(),
    'Activate User Success': props<{ id: string }>(),
  }
});
