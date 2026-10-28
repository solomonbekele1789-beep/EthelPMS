import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string | undefined;
  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  if (requiredPermission && permissionService.hasPermission(requiredPermission)) {
    return true;
  }

  if (requiredPermissions && permissionService.hasAnyPermission(requiredPermissions)) {
    return true;
  }

  if (!requiredPermission && !requiredPermissions) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
