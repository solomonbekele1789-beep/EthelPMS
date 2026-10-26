import { createActionGroup, props } from '@ngrx/store';
import {
  AssetCategoryDto,
  CreateAssetCategoryRequest,
} from '../models/asset-category.model';
import { AssetDto, RegisterAssetRequest } from '../models/asset.model';
import { AssetDisposalDto } from '../models/disposal.model';
import { AssetMaintenanceDto } from '../models/maintenance.model';
import { StockItemDto, CreateStockItemRequest } from '../models/stock.model';

export const AssetsActions = createActionGroup({
  source: 'Assets',
  events: {
    // Asset Categories
    'Load Categories': props<{ search?: string }>(),
    'Load Categories Success': props<{ categories: AssetCategoryDto[] }>(),
    'Load Categories Failure': props<{ error: string }>(),
    'Create Category': props<{ request: CreateAssetCategoryRequest }>(),
    'Create Category Success': props<{ id: string }>(),
    'Create Category Failure': props<{ error: string }>(),

    // Assets
    'Load Assets': props<{ categoryId?: string; status?: string; projectId?: string; search?: string; page?: number; pageSize?: number }>(),
    'Load Assets Success': props<{ assets: AssetDto[]; totalCount: number }>(),
    'Load Assets Failure': props<{ error: string }>(),
    'Load Asset': props<{ id: string }>(),
    'Load Asset Success': props<{ asset: AssetDto }>(),
    'Load Asset Failure': props<{ error: string }>(),
    'Register Asset': props<{ request: RegisterAssetRequest }>(),
    'Register Asset Success': props<{ id: string }>(),
    'Register Asset Failure': props<{ error: string }>(),

    // Disposals
    'Load Disposals': props<{ status?: string; page?: number; pageSize?: number }>(),
    'Load Disposals Success': props<{ disposals: AssetDisposalDto[]; totalCount: number }>(),
    'Load Disposals Failure': props<{ error: string }>(),

    // Maintenance
    'Load Maintenance': props<{ assetId?: string; isCompleted?: boolean }>(),
    'Load Maintenance Success': props<{ maintenance: AssetMaintenanceDto[] }>(),
    'Load Maintenance Failure': props<{ error: string }>(),

    // Stock Items
    'Load Stock Items': props<{ category?: string; search?: string }>(),
    'Load Stock Items Success': props<{ stockItems: StockItemDto[] }>(),
    'Load Stock Items Failure': props<{ error: string }>(),
    'Create Stock Item': props<{ request: CreateStockItemRequest }>(),
    'Create Stock Item Success': props<{ id: string }>(),
    'Create Stock Item Failure': props<{ error: string }>(),
  }
});
