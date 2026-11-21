import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '@ethelpms/shared/core';

export const superAdminGuard: CanActivateFn = () => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (permissionService.isSuperAdmin()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
