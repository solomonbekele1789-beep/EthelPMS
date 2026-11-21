import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CORE_CONFIG } from '../models/tokens';
import { PagedRequest, PagedResult } from '../models/pagination.model';

export type QueryParams = HttpParams | Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(CORE_CONFIG);
  private readonly baseUrl = this.config.apiBaseUrl;

  private toHttpParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }
    if (params instanceof HttpParams) {
      return params;
    }
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: this.toHttpParams(params),
      withCredentials: true,
    });
  }

  getList<T>(
    path: string,
    pagination?: Partial<PagedRequest>,
    filters?: Record<string, string | number | boolean | null | undefined>
  ): Observable<PagedResult<T>> {
    const merged: Record<string, string | number | boolean | null | undefined> = {
      ...filters,
      ...(pagination?.page !== undefined ? { page: pagination.page } : {}),
      ...(pagination?.pageSize !== undefined ? { pageSize: pagination.pageSize } : {}),
      ...(pagination?.sortBy ? { sortBy: pagination.sortBy } : {}),
      ...(pagination?.sortDirection || pagination?.sortDir
        ? { sortDirection: pagination.sortDirection ?? pagination.sortDir }
        : {}),
      ...(pagination?.search ? { search: pagination.search } : {}),
    };
    return this.get<PagedResult<T>>(path, merged);
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { withCredentials: true });
  }

  put<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, { withCredentials: true });
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, { withCredentials: true });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, { withCredentials: true });
  }
}
