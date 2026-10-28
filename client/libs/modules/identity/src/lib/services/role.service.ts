import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import { RoleDto, RoleListItemDto, PermissionDto, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);

  listRoles(
    page: number,
    pageSize: number,
    search?: string
  ): Observable<PagedResult<RoleListItemDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);

    return this.api.get<PagedResult<RoleListItemDto>>('/roles', params);
  }

  getRole(id: string): Observable<RoleDto> {
    return this.api.get<RoleDto>(`/roles/${id}`);
  }

  listPermissions(module?: string): Observable<PermissionDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);

    return this.api.get<PermissionDto[]>('/roles/permissions', params);
  }

  createRole(request: CreateRoleRequest): Observable<RoleDto> {
    return this.api.post<RoleDto>('/roles', request);
  }

  updateRole(id: string, request: UpdateRoleRequest): Observable<RoleDto> {
    return this.api.put<RoleDto>(`/roles/${id}`, request);
  }

  deleteRole(id: string): Observable<void> {
    return this.api.delete<void>(`/roles/${id}`);
  }
}
