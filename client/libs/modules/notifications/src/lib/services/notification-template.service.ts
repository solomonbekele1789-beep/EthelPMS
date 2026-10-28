import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  NotificationTemplateDto,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
} from '../models/notification-template.model';

@Injectable({ providedIn: 'root' })
export class NotificationTemplateService {
  private readonly api = inject(ApiService);

  listTemplates(params: {
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<NotificationTemplateDto>> {
    let httpParams = new HttpParams();

    if (params.isActive != null) httpParams = httpParams.set('isActive', params.isActive.toString());
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<NotificationTemplateDto>>('/notification-templates', httpParams);
  }

  createTemplate(request: CreateNotificationTemplateRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/notification-templates', request);
  }

  updateTemplate(id: string, request: UpdateNotificationTemplateRequest): Observable<{ id: string }> {
    return this.api.put<{ id: string }>(`/notification-templates/${id}`, request);
  }
}
