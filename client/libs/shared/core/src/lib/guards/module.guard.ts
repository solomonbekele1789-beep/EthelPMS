import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantService } from '../services/tenant.service';
import { PermissionService } from '../services/permission.service';

export const moduleGuard: CanActivateFn = (route) => {
  const tenantService = inject(TenantService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredModule = route.data['module'] as string | undefined;
  if (!requiredModule) {
    return true;
  }

  if (permissionService.isSuperAdmin()) {
    return true;
  }

  if (tenantService.isModuleEnabled(requiredModule)) {
    return true;
  }

  return router.createUrlTree(['/module-not-available'], {
    queryParams: { module: requiredModule },
  });
};
