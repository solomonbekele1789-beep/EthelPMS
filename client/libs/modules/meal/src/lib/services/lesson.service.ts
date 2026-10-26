import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  LessonLearnedDto,
  CreateLessonLearnedRequest,
} from '../models/lesson.model';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private readonly api = inject(ApiService);

  listLessons(projectId?: string, category?: string): Observable<LessonLearnedDto[]> {
    let params = new HttpParams();

    if (projectId) params = params.set('projectId', projectId);
    if (category) params = params.set('category', category);

    return this.api.get<LessonLearnedDto[]>('/lessons-learned', params);
  }

  createLesson(request: CreateLessonLearnedRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/lessons-learned', request);
  }
}
