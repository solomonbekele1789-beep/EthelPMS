import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import {
  TaskBoardDto,
  CreateTaskBoardRequest,
} from '../models/task-board.model';

@Injectable({ providedIn: 'root' })
export class TaskBoardService {
  private readonly api = inject(ApiService);

  getBoard(id: string): Observable<TaskBoardDto> {
    return this.api.get<TaskBoardDto>(`/task-boards/${id}`);
  }

  createBoard(request: CreateTaskBoardRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/task-boards', request);
  }
}
