import { createActionGroup, props } from '@ngrx/store';
import {
  SupplierDto,
  CreateSupplierRequest,
} from '../models/supplier.model';
import { PurchaseRequestDto, CreatePurchaseRequestRequest } from '../models/purchase-request.model';
import { PurchaseOrderDto, CreatePurchaseOrderRequest } from '../models/purchase-order.model';

export const ProcurementActions = createActionGroup({
  source: 'Procurement',
  events: {
    // Suppliers
    'Load Suppliers': props<{ status?: string; search?: string }>(),
    'Load Suppliers Success': props<{ suppliers: SupplierDto[] }>(),
    'Load Suppliers Failure': props<{ error: string }>(),
    'Load Supplier': props<{ id: string }>(),
    'Load Supplier Success': props<{ supplier: SupplierDto }>(),
    'Load Supplier Failure': props<{ error: string }>(),
    'Create Supplier': props<{ request: CreateSupplierRequest }>(),
    'Create Supplier Success': props<{ id: string }>(),
    'Create Supplier Failure': props<{ error: string }>(),

    // Purchase Requests
    'Load Purchase Requests': props<{ projectId?: string; status?: string; page?: number; pageSize?: number }>(),
    'Load Purchase Requests Success': props<{ requests: PurchaseRequestDto[]; totalCount: number }>(),
    'Load Purchase Requests Failure': props<{ error: string }>(),
    'Create Purchase Request': props<{ request: CreatePurchaseRequestRequest }>(),
    'Create Purchase Request Success': props<{ id: string }>(),
    'Create Purchase Request Failure': props<{ error: string }>(),

    // Purchase Orders
    'Load Purchase Orders': props<{ supplierId?: string; status?: string; page?: number; pageSize?: number }>(),
    'Load Purchase Orders Success': props<{ orders: PurchaseOrderDto[]; totalCount: number }>(),
    'Load Purchase Orders Failure': props<{ error: string }>(),
    'Load Purchase Order': props<{ id: string }>(),
    'Load Purchase Order Success': props<{ order: PurchaseOrderDto }>(),
    'Load Purchase Order Failure': props<{ error: string }>(),
    'Create Purchase Order': props<{ request: CreatePurchaseOrderRequest }>(),
    'Create Purchase Order Success': props<{ id: string }>(),
    'Create Purchase Order Failure': props<{ error: string }>(),
  }
});
