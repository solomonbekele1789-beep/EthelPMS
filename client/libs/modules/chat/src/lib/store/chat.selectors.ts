import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState, CHAT_FEATURE_KEY } from './chat.reducer';

export const selectChatState = createFeatureSelector<ChatState>(CHAT_FEATURE_KEY);

export const selectRooms = createSelector(selectChatState, (state) => state.rooms);
export const selectRoomsTotalCount = createSelector(selectChatState, (state) => state.roomsTotalCount);
export const selectSelectedRoom = createSelector(selectChatState, (state) => state.selectedRoom);
export const selectMessages = createSelector(selectChatState, (state) => state.messages);
export const selectMessagesTotalCount = createSelector(selectChatState, (state) => state.messagesTotalCount);
export const selectChatLoading = createSelector(selectChatState, (state) => state.loading);
export const selectChatError = createSelector(selectChatState, (state) => state.error);
