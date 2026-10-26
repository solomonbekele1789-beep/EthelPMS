import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AssetCategoryService } from '../services/asset-category.service';
import { AssetService } from '../services/asset.service';
import { DisposalService } from '../services/disposal.service';
import { MaintenanceService } from '../services/maintenance.service';
import { StockService } from '../services/stock.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { AssetsActions } from './assets.actions';

@Injectable()
export class AssetsEffects {
  private readonly actions$ = inject(Actions);
  private readonly assetCategoryService = inject(AssetCategoryService);
  private readonly assetService = inject(AssetService);
  private readonly disposalService = inject(DisposalService);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly stockService = inject(StockService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Asset Categories

  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.loadCategories),
    switchMap(({ search }) =>
      this.assetCategoryService.listCategories({ search }).pipe(
        map((categories) => AssetsActions.loadCategoriesSuccess({ categories })),
        catchError((error) => of(AssetsActions.loadCategoriesFailure({ error: error?.error?.detail ?? 'Failed to load categories' })))
      )
    )
  ));

  createCategory$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.createCategory),
    exhaustMap(({ request }) =>
      this.assetCategoryService.createCategory(request).pipe(
        map((response) => AssetsActions.createCategorySuccess({ id: response.id })),
        catchError((error) => of(AssetsActions.createCategoryFailure({ error: error?.error?.detail ?? 'Failed to create category' })))
      )
    )
  ));

  createCategorySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.createCategorySuccess),
    tap(() => {
      this.notification.success('Category created successfully');
      this.router.navigate(['/assets/categories']);
    })
  ), { dispatch: false });

  // Assets

  loadAssets$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.loadAssets),
    switchMap(({ categoryId, status, projectId, search, page, pageSize }) =>
      this.assetService.listAssets({ categoryId, status, projectId, search, page, pageSize }).pipe(
        map((response) => AssetsActions.loadAssetsSuccess({ assets: response.items, totalCount: response.totalCount })),
        catchError((error) => of(AssetsActions.loadAssetsFailure({ error: error?.error?.detail ?? 'Failed to load assets' })))
      )
    )
  ));

  loadAsset$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.loadAsset),
    switchMap(({ id }) =>
      this.assetService.getAsset(id).pipe(
        map((asset) => AssetsActions.loadAssetSuccess({ asset })),
        catchError((error) => of(AssetsActions.loadAssetFailure({ error: error?.error?.detail ?? 'Failed to load asset' })))
      )
    )
  ));

  registerAsset$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.registerAsset),
    exhaustMap(({ request }) =>
      this.assetService.registerAsset(request).pipe(
        map((response) => AssetsActions.registerAssetSuccess({ id: response.id })),
        catchError((error) => of(AssetsActions.registerAssetFailure({ error: error?.error?.detail ?? 'Failed to register asset' })))
      )
    )
  ));

  registerAssetSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.registerAssetSuccess),
    tap(() => {
      this.notification.success('Asset registered successfully');
      this.router.navigate(['/assets']);
    })
  ), { dispatch: false });

  // Disposals

  loadDisposals$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.loadDisposals),
    switchMap(({ status, page, pageSize }) =>
      this.disposalService.listDisposals({ status, page, pageSize }).pipe(
        map((response) => AssetsActions.loadDisposalsSuccess({ disposals: response.items, totalCount: response.totalCount })),
        catchError((error) => of(AssetsActions.loadDisposalsFailure({ error: error?.error?.detail ?? 'Failed to load disposals' })))
      )
    )
  ));

  // Maintenance

  loadMaintenance$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.loadMaintenance),
    switchMap(({ assetId, isCompleted }) =>
      this.maintenanceService.listMaintenance({ assetId, isCompleted }).pipe(
        map((maintenance) => AssetsActions.loadMaintenanceSuccess({ maintenance })),
        catchError((error) => of(AssetsActions.loadMaintenanceFailure({ error: error?.error?.detail ?? 'Failed to load maintenance records' })))
      )
    )
  ));

  // Stock Items

  loadStockItems$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.loadStockItems),
    switchMap(({ category, search }) =>
      this.stockService.listStockItems({ category, search }).pipe(
        map((stockItems) => AssetsActions.loadStockItemsSuccess({ stockItems })),
        catchError((error) => of(AssetsActions.loadStockItemsFailure({ error: error?.error?.detail ?? 'Failed to load stock items' })))
      )
    )
  ));

  createStockItem$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.createStockItem),
    exhaustMap(({ request }) =>
      this.stockService.createStockItem(request).pipe(
        map((response) => AssetsActions.createStockItemSuccess({ id: response.id })),
        catchError((error) => of(AssetsActions.createStockItemFailure({ error: error?.error?.detail ?? 'Failed to create stock item' })))
      )
    )
  ));

  createStockItemSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AssetsActions.createStockItemSuccess),
    tap(() => {
      this.notification.success('Stock item created successfully');
      this.router.navigate(['/assets/stock']);
    })
  ), { dispatch: false });
}
