import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  TaskItemDto,
  TaskCommentDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  UpdateTaskProgressRequest,
  AssignTaskRequest,
  MoveTaskRequest,
  AddTaskCommentRequest,
  SubmitForApprovalRequest,
  ApproveTaskRequest,
  RejectTaskRequest,
} from '../models/task-item.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = inject(ApiService);

  listTasks(params: {
    boardId?: string;
    listId?: string;
    projectId?: string;
    status?: string;
    assignedToUserId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<TaskItemDto>> {
    let httpParams = new HttpParams();

    if (params.boardId) httpParams = httpParams.set('boardId', params.boardId);
    if (params.listId) httpParams = httpParams.set('listId', params.listId);
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.assignedToUserId) httpParams = httpParams.set('assignedToUserId', params.assignedToUserId);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<TaskItemDto>>('/tasks', httpParams);
  }

  getTask(id: string): Observable<TaskItemDto> {
    return this.api.get<TaskItemDto>(`/tasks/${id}`);
  }

  createTask(request: CreateTaskRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/tasks', request);
  }

  updateTask(id: string, request: UpdateTaskRequest): Observable<void> {
    return this.api.put<void>(`/tasks/${id}`, request);
  }

  updateStatus(id: string, request: UpdateTaskStatusRequest): Observable<void> {
    return this.api.patch<void>(`/tasks/${id}/status`, request);
  }

  updateProgress(id: string, request: UpdateTaskProgressRequest): Observable<void> {
    return this.api.patch<void>(`/tasks/${id}/progress`, request);
  }

  assignTask(id: string, request: AssignTaskRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/tasks/${id}/assign`, request);
  }

  moveTask(id: string, request: MoveTaskRequest): Observable<void> {
    return this.api.patch<void>(`/tasks/${id}/move`, request);
  }

  addComment(id: string, request: AddTaskCommentRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/tasks/${id}/comments`, request);
  }

  listComments(id: string): Observable<TaskCommentDto[]> {
    return this.api.get<TaskCommentDto[]>(`/tasks/${id}/comments`);
  }

  submitForApproval(id: string, request: SubmitForApprovalRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/tasks/${id}/submit-for-approval`, request);
  }

  approveTask(id: string, request: ApproveTaskRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/tasks/${id}/approve`, request);
  }

  rejectTask(id: string, request: RejectTaskRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/tasks/${id}/reject`, request);
  }
}
