import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  ProjectDto,
  ProjectListItemDto,
  CreateProjectRequest,
  UpdateProjectRequest,
  AddTeamMemberRequest,
  ProjectTeamMemberDto,
  RejectProjectRequest,
} from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = inject(ApiService);

  listProjects(
    page: number,
    pageSize: number,
    search?: string,
    status?: string
  ): Observable<PagedResult<ProjectListItemDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.api.get<PagedResult<ProjectListItemDto>>('/projects', params);
  }

  getProject(id: string): Observable<ProjectDto> {
    return this.api.get<ProjectDto>(`/projects/${id}`);
  }

  createProject(request: CreateProjectRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/projects', request);
  }

  updateProject(id: string, request: UpdateProjectRequest): Observable<void> {
    return this.api.put<void>(`/projects/${id}`, request);
  }

  submitProject(id: string): Observable<void> {
    return this.api.post<void>(`/projects/${id}/submit`);
  }

  approveProject(id: string): Observable<void> {
    return this.api.post<void>(`/projects/${id}/approve`);
  }

  rejectProject(id: string, request: RejectProjectRequest): Observable<void> {
    return this.api.post<void>(`/projects/${id}/reject`, request);
  }

  getTeamMembers(projectId: string): Observable<ProjectTeamMemberDto[]> {
    return this.api.get<ProjectTeamMemberDto[]>(`/projects/${projectId}/team`);
  }

  addTeamMember(id: string, request: AddTeamMemberRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`/projects/${id}/team`, request);
  }

  removeTeamMember(projectId: string, memberId: string): Observable<void> {
    return this.api.delete<void>(`/projects/${projectId}/team/${memberId}`);
  }
}
