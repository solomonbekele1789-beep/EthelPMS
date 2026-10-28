import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, LoginResponse, UserProfile } from '../models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponse }>(),
    'Login Failure': props<{ error: string }>(),

    'Logout': emptyProps(),
    'Logout Success': emptyProps(),

    'Restore Session': emptyProps(),
    'Restore Session Success': props<{ user: UserProfile }>(),
    'Restore Session Failure': emptyProps(),

    'Refresh Token': props<{ refreshToken: string }>(),
    'Refresh Token Success': props<{ response: LoginResponse }>(),

    'Update Permissions': props<{ permissions: string[]; roles: string[] }>(),
  },
});
