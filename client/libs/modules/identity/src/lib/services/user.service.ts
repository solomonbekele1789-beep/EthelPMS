import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import { UserDto, UserListItemDto, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  listUsers(
    page: number,
    pageSize: number,
    search?: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Observable<PagedResult<UserListItemDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDirection) params = params.set('sortDirection', sortDirection);

    return this.api.get<PagedResult<UserListItemDto>>('/users', params);
  }

  getUser(id: string): Observable<UserDto> {
    return this.api.get<UserDto>(`/users/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<UserDto> {
    return this.api.post<UserDto>('/users', request);
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<UserDto> {
    return this.api.put<UserDto>(`/users/${id}`, request);
  }

  deactivateUser(id: string): Observable<void> {
    return this.api.post<void>(`/users/${id}/deactivate`);
  }

  activateUser(id: string): Observable<void> {
    return this.api.post<void>(`/users/${id}/activate`);
  }

  assignRole(userId: string, roleId: string): Observable<void> {
    return this.api.post<void>(`/users/${userId}/roles`, { roleId });
  }

  removeRole(userId: string, roleId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}/roles/${roleId}`);
  }
}
