import { createFeature, createReducer, on } from '@ngrx/store';
import { AssetCategoryDto } from '../models/asset-category.model';
import { AssetDto } from '../models/asset.model';
import { AssetDisposalDto } from '../models/disposal.model';
import { AssetMaintenanceDto } from '../models/maintenance.model';
import { StockItemDto } from '../models/stock.model';
import { AssetsActions } from './assets.actions';

export const ASSETS_FEATURE_KEY = 'assets';

export interface AssetsState {
  categories: AssetCategoryDto[];
  assets: AssetDto[];
  assetsTotalCount: number;
  selectedAsset: AssetDto | null;
  disposals: AssetDisposalDto[];
  disposalsTotalCount: number;
  maintenance: AssetMaintenanceDto[];
  stockItems: StockItemDto[];
  loading: boolean;
  error: string | null;
}

export const initialAssetsState: AssetsState = {
  categories: [],
  assets: [],
  assetsTotalCount: 0,
  selectedAsset: null,
  disposals: [],
  disposalsTotalCount: 0,
  maintenance: [],
  stockItems: [],
  loading: false,
  error: null,
};

export const assetsFeature = createFeature({
  name: ASSETS_FEATURE_KEY,
  reducer: createReducer(
    initialAssetsState,

    // Asset Categories
    on(AssetsActions.loadCategories, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AssetsActions.loadCategoriesSuccess, (state, { categories }) => ({
      ...state,
      categories,
      loading: false,
    })),
    on(AssetsActions.loadCategoriesFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AssetsActions.createCategory, (state) => ({
      ...state,
      loading: true,
    })),
    on(AssetsActions.createCategorySuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(AssetsActions.createCategoryFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Assets
    on(AssetsActions.loadAssets, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AssetsActions.loadAssetsSuccess, (state, { assets, totalCount }) => ({
      ...state,
      assets,
      assetsTotalCount: totalCount,
      loading: false,
    })),
    on(AssetsActions.loadAssetsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AssetsActions.loadAsset, (state) => ({
      ...state,
      loading: true,
      selectedAsset: null,
    })),
    on(AssetsActions.loadAssetSuccess, (state, { asset }) => ({
      ...state,
      selectedAsset: asset,
      loading: false,
    })),
    on(AssetsActions.loadAssetFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AssetsActions.registerAsset, (state) => ({
      ...state,
      loading: true,
    })),
    on(AssetsActions.registerAssetSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(AssetsActions.registerAssetFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Disposals
    on(AssetsActions.loadDisposals, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AssetsActions.loadDisposalsSuccess, (state, { disposals, totalCount }) => ({
      ...state,
      disposals,
      disposalsTotalCount: totalCount,
      loading: false,
    })),
    on(AssetsActions.loadDisposalsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Maintenance
    on(AssetsActions.loadMaintenance, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AssetsActions.loadMaintenanceSuccess, (state, { maintenance }) => ({
      ...state,
      maintenance,
      loading: false,
    })),
    on(AssetsActions.loadMaintenanceFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    // Stock Items
    on(AssetsActions.loadStockItems, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AssetsActions.loadStockItemsSuccess, (state, { stockItems }) => ({
      ...state,
      stockItems,
      loading: false,
    })),
    on(AssetsActions.loadStockItemsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AssetsActions.createStockItem, (state) => ({
      ...state,
      loading: true,
    })),
    on(AssetsActions.createStockItemSuccess, (state) => ({
      ...state,
      loading: false,
      error: null,
    })),
    on(AssetsActions.createStockItemFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
  ),
});

export const assetsReducer = assetsFeature.reducer;
