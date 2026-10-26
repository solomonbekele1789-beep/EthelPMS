import { createActionGroup, props } from '@ngrx/store';
import { ChatRoomDto, CreateChatRoomRequest } from '../models/chat-room.model';
import { ChatMessageDto, SendMessageRequest } from '../models/chat-message.model';

export const ChatActions = createActionGroup({
  source: 'Chat',
  events: {
    'Load Rooms': props<{ page?: number; pageSize?: number; search?: string }>(),
    'Load Rooms Success': props<{ rooms: ChatRoomDto[]; totalCount: number }>(),
    'Load Rooms Failure': props<{ error: string }>(),
    'Load Room': props<{ id: string }>(),
    'Load Room Success': props<{ room: ChatRoomDto }>(),
    'Load Room Failure': props<{ error: string }>(),
    'Create Room': props<{ request: CreateChatRoomRequest }>(),
    'Create Room Success': props<{ id: string }>(),
    'Create Room Failure': props<{ error: string }>(),
    'Load Messages': props<{ chatRoomId: string; page?: number; pageSize?: number }>(),
    'Load Messages Success': props<{ messages: ChatMessageDto[]; totalCount: number }>(),
    'Load Messages Failure': props<{ error: string }>(),
    'Send Message': props<{ request: SendMessageRequest }>(),
    'Send Message Success': props<{ id: string }>(),
    'Send Message Failure': props<{ error: string }>(),
  },
});
