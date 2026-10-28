import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState, UI_FEATURE_KEY } from './ui.reducer';

export const selectUiState = createFeatureSelector<UiState>(UI_FEATURE_KEY);

export const selectSidebarCollapsed = createSelector(
  selectUiState,
  (state) => state.sidebarCollapsed
);

export const selectTheme = createSelector(
  selectUiState,
  (state) => state.theme
);

export const selectLanguage = createSelector(
  selectUiState,
  (state) => state.language
);

// Aliases used by layout components
export const selectUiSidebarCollapsed = selectSidebarCollapsed;
