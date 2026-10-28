import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  ChatRoomDto,
  CreateChatRoomRequest,
  AddParticipantRequest,
} from '../models/chat-room.model';

@Injectable({ providedIn: 'root' })
export class ChatRoomService {
  private readonly api = inject(ApiService);

  listRooms(params: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<ChatRoomDto>> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<ChatRoomDto>>('/chat-rooms', httpParams);
  }

  getRoom(id: string): Observable<ChatRoomDto> {
    return this.api.get<ChatRoomDto>(`/chat-rooms/${id}`);
  }

  createRoom(request: CreateChatRoomRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/chat-rooms', request);
  }

  addParticipant(roomId: string, request: AddParticipantRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/chat-rooms/${roomId}/participants`, request);
  }

  removeParticipant(roomId: string, userId: string): Observable<void> {
    return this.api.delete<void>(`/chat-rooms/${roomId}/participants/${userId}`);
  }
}
