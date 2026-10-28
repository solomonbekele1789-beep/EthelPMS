import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import { NotificationDto, UnreadCountDto } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);

  listNotifications(params: {
    status?: string;
    eventType?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<NotificationDto>> {
    let httpParams = new HttpParams();

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.eventType) httpParams = httpParams.set('eventType', params.eventType);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<NotificationDto>>('/notifications', httpParams);
  }

  markRead(id: string): Observable<{ id: string }> {
    return this.api.put<{ id: string }>(`/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<{ markedRead: number }> {
    return this.api.put<{ markedRead: number }>('/notifications/read-all', {});
  }

  getUnreadCount(): Observable<UnreadCountDto> {
    return this.api.get<UnreadCountDto>('/notifications/unread-count');
  }
}
