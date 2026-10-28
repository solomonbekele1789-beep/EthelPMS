import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RoleService } from '../services/role.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { RoleActions } from './role.actions';

@Injectable()
export class RoleEffects {
  private readonly actions$ = inject(Actions);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loadRoles$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.loadRoles),
    switchMap(({ page, pageSize, search }) =>
      this.roleService.listRoles(page, pageSize, search).pipe(
        map((response) => RoleActions.loadRolesSuccess({ roles: response.items, totalCount: response.totalCount })),
        catchError((error) => of(RoleActions.loadRolesFailure({ error: error?.error?.detail ?? 'Failed to load roles' })))
      )
    )
  ));

  loadRole$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.loadRole),
    switchMap(({ id }) =>
      this.roleService.getRole(id).pipe(
        map((role) => RoleActions.loadRoleSuccess({ role })),
        catchError((error) => of(RoleActions.loadRoleFailure({ error: error?.error?.detail ?? 'Failed to load role' })))
      )
    )
  ));

  loadPermissions$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.loadPermissions),
    switchMap(() =>
      this.roleService.listPermissions().pipe(
        map((permissions) => RoleActions.loadPermissionsSuccess({ permissions })),
        catchError((error) => of(RoleActions.loadPermissionsFailure({ error: error?.error?.detail ?? 'Failed to load permissions' })))
      )
    )
  ));

  createRole$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.createRole),
    exhaustMap(({ request }) =>
      this.roleService.createRole(request).pipe(
        map((role) => RoleActions.createRoleSuccess({ role })),
        catchError((error) => of(RoleActions.createRoleFailure({ error: error?.error?.detail ?? 'Failed to create role' })))
      )
    )
  ));

  createRoleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.createRoleSuccess),
    tap(() => {
      this.notification.success('Role created successfully');
      this.router.navigate(['/roles']);
    })
  ), { dispatch: false });

  updateRole$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.updateRole),
    exhaustMap(({ id, request }) =>
      this.roleService.updateRole(id, request).pipe(
        map((role) => RoleActions.updateRoleSuccess({ role })),
        catchError((error) => of(RoleActions.updateRoleFailure({ error: error?.error?.detail ?? 'Failed to update role' })))
      )
    )
  ));

  updateRoleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.updateRoleSuccess),
    tap(() => this.notification.success('Role updated successfully'))
  ), { dispatch: false });

  deleteRole$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.deleteRole),
    exhaustMap(({ id }) =>
      this.roleService.deleteRole(id).pipe(
        map(() => RoleActions.deleteRoleSuccess({ id })),
        catchError((error) => of(RoleActions.deleteRoleFailure({ error: error?.error?.detail ?? 'Failed to delete role' })))
      )
    )
  ));

  deleteRoleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(RoleActions.deleteRoleSuccess),
    tap(() => this.notification.success('Role deleted successfully'))
  ), { dispatch: false });
}
