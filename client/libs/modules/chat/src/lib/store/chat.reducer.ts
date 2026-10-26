import { createFeature, createReducer, on } from '@ngrx/store';
import { ChatRoomDto } from '../models/chat-room.model';
import { ChatMessageDto } from '../models/chat-message.model';
import { ChatActions } from './chat.actions';

export const CHAT_FEATURE_KEY = 'chat';

export interface ChatState {
  rooms: ChatRoomDto[];
  roomsTotalCount: number;
  selectedRoom: ChatRoomDto | null;
  messages: ChatMessageDto[];
  messagesTotalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: [],
  roomsTotalCount: 0,
  selectedRoom: null,
  messages: [],
  messagesTotalCount: 0,
  loading: false,
  error: null,
};

export const chatFeature = createFeature({
  name: CHAT_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    // --- Rooms list ---
    on(ChatActions.loadRooms, (state) => ({ ...state, loading: true, error: null })),
    on(ChatActions.loadRoomsSuccess, (state, { rooms, totalCount }) => ({
      ...state, rooms, roomsTotalCount: totalCount, loading: false,
    })),
    on(ChatActions.loadRoomsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Single room ---
    on(ChatActions.loadRoom, (state) => ({ ...state, loading: true, error: null })),
    on(ChatActions.loadRoomSuccess, (state, { room }) => ({
      ...state, selectedRoom: room, loading: false,
    })),
    on(ChatActions.loadRoomFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Create room ---
    on(ChatActions.createRoom, (state) => ({ ...state, loading: true, error: null })),
    on(ChatActions.createRoomSuccess, (state) => ({ ...state, loading: false })),
    on(ChatActions.createRoomFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Messages list ---
    on(ChatActions.loadMessages, (state) => ({ ...state, loading: true, error: null })),
    on(ChatActions.loadMessagesSuccess, (state, { messages, totalCount }) => ({
      ...state, messages, messagesTotalCount: totalCount, loading: false,
    })),
    on(ChatActions.loadMessagesFailure, (state, { error }) => ({ ...state, error, loading: false })),

    // --- Send message ---
    on(ChatActions.sendMessage, (state) => ({ ...state, loading: true, error: null })),
    on(ChatActions.sendMessageSuccess, (state) => ({ ...state, loading: false })),
    on(ChatActions.sendMessageFailure, (state, { error }) => ({ ...state, error, loading: false })),
  ),
});

export const chatReducer = chatFeature.reducer;
