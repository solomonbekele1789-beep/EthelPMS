import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const UiActions = createActionGroup({
  source: 'UI',
  events: {
    'Toggle Sidebar': emptyProps(),
    'Set Sidebar Collapsed': props<{ collapsed: boolean }>(),
    'Set Theme': props<{ theme: 'light' | 'dark' }>(),
    'Set Language': props<{ language: string }>(),
  },
});
