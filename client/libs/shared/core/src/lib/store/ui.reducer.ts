import { createReducer, on } from '@ngrx/store';
import { UiActions } from './ui.actions';

export const UI_FEATURE_KEY = 'ui';

export interface UiState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: string;
}

export const initialUiState: UiState = {
  sidebarCollapsed: false,
  theme: 'light',
  language: 'en',
};

export const uiReducer = createReducer(
  initialUiState,

  on(UiActions.toggleSidebar, (state) => ({
    ...state,
    sidebarCollapsed: !state.sidebarCollapsed,
  })),

  on(UiActions.setSidebarCollapsed, (state, { collapsed }) => ({
    ...state,
    sidebarCollapsed: collapsed,
  })),

  on(UiActions.setTheme, (state, { theme }) => ({
    ...state,
    theme,
  })),

  on(UiActions.setLanguage, (state, { language }) => ({
    ...state,
    language,
  }))
);
