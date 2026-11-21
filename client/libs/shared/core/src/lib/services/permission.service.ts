import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map } from 'rxjs';
import { selectPermissions, selectRoles } from '../store/auth.selectors';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly store = inject(Store);

  readonly permissions$: Observable<string[]> = this.store.select(selectPermissions);
  readonly roles$: Observable<string[]> = this.store.select(selectRoles);

  private permissions: string[] = [];
  private roles: string[] = [];

  constructor() {
    this.permissions$.subscribe((p) => (this.permissions = p));
    this.roles$.subscribe((r) => (this.roles = r));
  }

  hasPermission(permission: string): boolean {
    if (this.isSuperAdmin()) return true;
    if (permission.startsWith('platform.')) return false;
    return this.permissions.includes(permission);
  }

  hasPermission$(permission: string): Observable<boolean> {
    return combineLatest([this.permissions$, this.roles$]).pipe(
      map(([perms, roles]) => {
        if (roles.includes('SuperAdmin')) return true;
        if (permission.startsWith('platform.')) return false;
        return perms.includes(permission);
      })
    );
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (this.isSuperAdmin()) return true;
    return permissions.some((p) => !p.startsWith('platform.') && this.permissions.includes(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    if (this.isSuperAdmin()) return true;
    return permissions.every((p) => !p.startsWith('platform.') && this.permissions.includes(p));
  }

  isSuperAdmin(): boolean {
    return this.roles.includes('SuperAdmin');
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  hasRole$(role: string): Observable<boolean> {
    return this.roles$.pipe(map((roles) => roles.includes(role)));
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((r) => this.roles.includes(r));
  }
}
