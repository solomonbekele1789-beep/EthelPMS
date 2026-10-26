import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  ChatMessageDto,
  SendMessageRequest,
  EditMessageRequest,
  ReactToMessageRequest,
} from '../models/chat-message.model';

@Injectable({ providedIn: 'root' })
export class ChatMessageService {
  private readonly api = inject(ApiService);

  listMessages(params: {
    chatRoomId: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<ChatMessageDto>> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set('chatRoomId', params.chatRoomId);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<ChatMessageDto>>('/chat-messages', httpParams);
  }

  sendMessage(request: SendMessageRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/chat-messages', request);
  }

  editMessage(id: string, request: EditMessageRequest): Observable<{ id: string }> {
    return this.api.put<{ id: string }>(`/chat-messages/${id}`, request);
  }

  deleteMessage(id: string): Observable<void> {
    return this.api.delete<void>(`/chat-messages/${id}`);
  }

  reactToMessage(id: string, request: ReactToMessageRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/chat-messages/${id}/reactions`, request);
  }
}
