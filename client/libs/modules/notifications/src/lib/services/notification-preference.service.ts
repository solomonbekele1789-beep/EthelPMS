import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  UserNotificationPreferenceDto,
  UpdateNotificationPreferenceRequest,
} from '../models/notification-preference.model';

@Injectable({ providedIn: 'root' })
export class NotificationPreferenceService {
  private readonly api = inject(ApiService);

  getPreferences(userId?: string): Observable<UserNotificationPreferenceDto[]> {
    let httpParams = new HttpParams();

    if (userId) httpParams = httpParams.set('userId', userId);

    return this.api.get<UserNotificationPreferenceDto[]>('/notification-preferences', httpParams);
  }

  updatePreference(request: UpdateNotificationPreferenceRequest): Observable<{ id: string }> {
    return this.api.put<{ id: string }>('/notification-preferences', request);
  }
}
