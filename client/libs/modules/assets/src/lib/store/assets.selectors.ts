import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssetsState, ASSETS_FEATURE_KEY } from './assets.reducer';

export const selectAssetsState = createFeatureSelector<AssetsState>(ASSETS_FEATURE_KEY);
export const selectCategories = createSelector(selectAssetsState, (state) => state.categories);
export const selectAssets = createSelector(selectAssetsState, (state) => state.assets);
export const selectAssetsTotalCount = createSelector(selectAssetsState, (state) => state.assetsTotalCount);
export const selectSelectedAsset = createSelector(selectAssetsState, (state) => state.selectedAsset);
export const selectDisposals = createSelector(selectAssetsState, (state) => state.disposals);
export const selectDisposalsTotalCount = createSelector(selectAssetsState, (state) => state.disposalsTotalCount);
export const selectMaintenance = createSelector(selectAssetsState, (state) => state.maintenance);
export const selectStockItems = createSelector(selectAssetsState, (state) => state.stockItems);
export const selectAssetsLoading = createSelector(selectAssetsState, (state) => state.loading);
export const selectAssetsError = createSelector(selectAssetsState, (state) => state.error);
