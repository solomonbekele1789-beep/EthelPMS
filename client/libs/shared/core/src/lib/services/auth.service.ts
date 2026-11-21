import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, UserProfile } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private accessTokenMemory: string | null = null;
  private refreshTokenMemory: string | null = null;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => this.storeTokensInMemory(response))
    );
  }

  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {
      refreshToken: this.refreshTokenMemory ?? undefined,
    }).pipe(
      tap(() => this.clearTokens())
    );
  }

  refreshToken(refreshToken?: string): Observable<LoginResponse> {
    const token = refreshToken ?? this.refreshTokenMemory ?? undefined;
    return this.api.post<LoginResponse>('/auth/refresh', token ? { refreshToken: token } : {}).pipe(
      tap((response) => this.storeTokensInMemory(response))
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.api.post<void>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.api.post<void>('/auth/reset-password', { token, newPassword });
  }

  setupPassword(token: string, password: string): Observable<void> {
    return this.api.post<void>('/auth/setup-password', { token, password });
  }

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/users/me');
  }

  getAccessToken(): string | null {
    return this.accessTokenMemory;
  }

  getRefreshToken(): string | null {
    return this.refreshTokenMemory;
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private storeTokensInMemory(response: LoginResponse): void {
    this.accessTokenMemory = response.accessToken ?? null;
    this.refreshTokenMemory = response.refreshToken ?? null;
  }

  private clearTokens(): void {
    this.accessTokenMemory = null;
    this.refreshTokenMemory = null;
  }
}
