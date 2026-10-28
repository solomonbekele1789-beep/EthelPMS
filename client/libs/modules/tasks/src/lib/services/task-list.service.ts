import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { CreateTaskListRequest } from '../models/task-board.model';

@Injectable({ providedIn: 'root' })
export class TaskListService {
  private readonly api = inject(ApiService);

  createList(request: CreateTaskListRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/task-lists', request);
  }
}
