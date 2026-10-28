import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { selectAuthState } from '../store/auth.selectors';

export function moduleGuard(requiredModule: string): CanActivateFn {
  return () => {
    const store = inject(Store);
    const router = inject(Router);

    if (!requiredModule) {
      return true;
    }

    // Wait for any in-flight session restore to finish before reading user state.
    return store.select(selectAuthState).pipe(
      filter((state) => !state.isLoading),
      take(1),
      map(({ user }) => {
        if (!user) {
          return router.createUrlTree(['/auth/login']);
        }

        // Organization Admin has full access to all modules
        const userRoles = user.roles ?? [];
        if (userRoles.includes('Organization Admin')) {
          return true;
        }

        const userPermissions = user.permissions ?? [];

        // Allow access if user has the explicit module access permission,
        // a wildcard, or ANY permission belonging to this module.
        const modulePermission = `module.${requiredModule}.access`;
        const hasModulePermission =
          userPermissions.includes(modulePermission) ||
          userPermissions.includes('module.*.access') ||
          userPermissions.some((p) => p.startsWith(`${requiredModule}.`));

        if (hasModulePermission) {
          return true;
        }

        return router.createUrlTree(['/module-not-available']);
      })
    );
  };
}
