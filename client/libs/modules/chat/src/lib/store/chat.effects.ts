import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChatRoomService } from '../services/chat-room.service';
import { ChatMessageService } from '../services/chat-message.service';
import { ChatActions } from './chat.actions';

@Injectable()
export class ChatEffects {
  private readonly actions$ = inject(Actions);
  private readonly chatRoomService = inject(ChatRoomService);
  private readonly chatMessageService = inject(ChatMessageService);

  loadRooms$ = createEffect(() => this.actions$.pipe(
    ofType(ChatActions.loadRooms),
    switchMap(({ page, pageSize, search }) =>
      this.chatRoomService.listRooms({ page, pageSize, search }).pipe(
        map((response) => ChatActions.loadRoomsSuccess({ rooms: response.items, totalCount: response.totalCount })),
        catchError((error) => of(ChatActions.loadRoomsFailure({ error: error?.error?.detail ?? 'Failed to load rooms' })))
      )
    )
  ));

  loadRoom$ = createEffect(() => this.actions$.pipe(
    ofType(ChatActions.loadRoom),
    switchMap(({ id }) =>
      this.chatRoomService.getRoom(id).pipe(
        map((room) => ChatActions.loadRoomSuccess({ room })),
        catchError((error) => of(ChatActions.loadRoomFailure({ error: error?.error?.detail ?? 'Failed to load room' })))
      )
    )
  ));

  createRoom$ = createEffect(() => this.actions$.pipe(
    ofType(ChatActions.createRoom),
    exhaustMap(({ request }) =>
      this.chatRoomService.createRoom(request).pipe(
        map((response) => ChatActions.createRoomSuccess({ id: response.id })),
        catchError((error) => of(ChatActions.createRoomFailure({ error: error?.error?.detail ?? 'Failed to create room' })))
      )
    )
  ));

  loadMessages$ = createEffect(() => this.actions$.pipe(
    ofType(ChatActions.loadMessages),
    switchMap(({ chatRoomId, page, pageSize }) =>
      this.chatMessageService.listMessages({ chatRoomId, page, pageSize }).pipe(
        map((response) => ChatActions.loadMessagesSuccess({ messages: response.items, totalCount: response.totalCount })),
        catchError((error) => of(ChatActions.loadMessagesFailure({ error: error?.error?.detail ?? 'Failed to load messages' })))
      )
    )
  ));

  sendMessage$ = createEffect(() => this.actions$.pipe(
    ofType(ChatActions.sendMessage),
    exhaustMap(({ request }) =>
      this.chatMessageService.sendMessage(request).pipe(
        map((response) => ChatActions.sendMessageSuccess({ id: response.id })),
        catchError((error) => of(ChatActions.sendMessageFailure({ error: error?.error?.detail ?? 'Failed to send message' })))
      )
    )
  ));
}
