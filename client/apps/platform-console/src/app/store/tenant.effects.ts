import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { PlatformTenantService } from '../services/tenant.service';
import { TenantActions } from './tenant.actions';

@Injectable()
export class TenantEffects {
  private readonly actions$ = inject(Actions);
  private readonly tenantService = inject(PlatformTenantService);

  loadTenants$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.loadTenants),
      switchMap(({ page, pageSize, search, status }) =>
        this.tenantService.listTenants({ page, pageSize, search, status }).pipe(
          map((res) =>
            TenantActions.loadTenantsSuccess({
              tenants: res.items ?? res.data ?? [],
              totalCount: res.totalCount ?? 0,
            })
          ),
          catchError((err) => of(TenantActions.loadTenantsFailure({ error: err?.message ?? 'Failed to load tenants' })))
        )
      )
    )
  );

  loadTenant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.loadTenant),
      switchMap(({ id }) =>
        this.tenantService.getTenant(id).pipe(
          map((tenant) => TenantActions.loadTenantSuccess({ tenant })),
          catchError((err) => of(TenantActions.loadTenantFailure({ error: err?.message ?? 'Failed to load tenant' })))
        )
      )
    )
  );

  loadUsage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.loadTenantUsage),
      switchMap(({ id }) =>
        this.tenantService.getTenantUsage(id).pipe(
          map((usage) => TenantActions.loadTenantUsageSuccess({ usage })),
          catchError(() => of(TenantActions.loadTenantUsageSuccess({ usage: { currentUsers: 0, maxUsers: 0, currentProjects: 0, maxProjects: 0, storageUsedBytes: 0 } })))
        )
      )
    )
  );

  loadModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.loadTenantModules),
      switchMap(({ tenantId }) =>
        this.tenantService.listModules(tenantId).pipe(
          map((modules) => TenantActions.loadTenantModulesSuccess({ modules })),
          catchError(() => of(TenantActions.loadTenantModulesSuccess({ modules: [] })))
        )
      )
    )
  );

  toggleModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.toggleModule),
      switchMap(({ tenantId, moduleName, enabled }) =>
        this.tenantService.toggleModule(tenantId, moduleName, enabled).pipe(
          map(() => TenantActions.toggleModuleSuccess({ moduleName, enabled })),
          catchError((err) => of(TenantActions.toggleModuleFailure({ error: err?.message ?? 'Failed to toggle module' })))
        )
      )
    )
  );

  loadAccessKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.loadAccessKeys),
      switchMap(({ tenantId }) =>
        this.tenantService.listAccessKeys(tenantId).pipe(
          map((keys) => TenantActions.loadAccessKeysSuccess({ keys })),
          catchError(() => of(TenantActions.loadAccessKeysSuccess({ keys: [] })))
        )
      )
    )
  );

  loadProvisioningLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.loadProvisioningLogs),
      switchMap(({ tenantId }) =>
        this.tenantService.getProvisioningStatus(tenantId).pipe(
          map((logs) => TenantActions.loadProvisioningLogsSuccess({ logs })),
          catchError(() => of(TenantActions.loadProvisioningLogsSuccess({ logs: [] })))
        )
      )
    )
  );

  loadSubscriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantActions.loadSubscriptions),
      switchMap(() =>
        this.tenantService.listSubscriptions().pipe(
          map((packages) => TenantActions.loadSubscriptionsSuccess({ packages })),
          catchError(() => of(TenantActions.loadSubscriptionsSuccess({ packages: [] })))
        )
      )
    )
  );
}
