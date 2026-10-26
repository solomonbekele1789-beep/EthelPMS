import { createReducer, on } from '@ngrx/store';
import { SupplierDto } from '../models/supplier.model';
import { PurchaseRequestDto } from '../models/purchase-request.model';
import { PurchaseOrderDto } from '../models/purchase-order.model';
import { ProcurementActions } from './procurement.actions';

export const PROCUREMENT_FEATURE_KEY = 'procurement';

export interface ProcurementState {
  suppliers: SupplierDto[];
  selectedSupplier: SupplierDto | null;
  purchaseRequests: PurchaseRequestDto[];
  requestTotalCount: number;
  purchaseOrders: PurchaseOrderDto[];
  orderTotalCount: number;
  selectedOrder: PurchaseOrderDto | null;
  loading: boolean;
  error: string | null;
}

export const initialProcurementState: ProcurementState = {
  suppliers: [],
  selectedSupplier: null,
  purchaseRequests: [],
  requestTotalCount: 0,
  purchaseOrders: [],
  orderTotalCount: 0,
  selectedOrder: null,
  loading: false,
  error: null,
};

export const procurementReducer = createReducer(
  initialProcurementState,

  // Suppliers
  on(ProcurementActions.loadSuppliers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProcurementActions.loadSuppliersSuccess, (state, { suppliers }) => ({
    ...state,
    suppliers,
    loading: false,
  })),
  on(ProcurementActions.loadSuppliersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProcurementActions.loadSupplier, (state) => ({
    ...state,
    loading: true,
    selectedSupplier: null,
  })),
  on(ProcurementActions.loadSupplierSuccess, (state, { supplier }) => ({
    ...state,
    selectedSupplier: supplier,
    loading: false,
  })),
  on(ProcurementActions.loadSupplierFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProcurementActions.createSupplier, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProcurementActions.createSupplierSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProcurementActions.createSupplierFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Purchase Requests
  on(ProcurementActions.loadPurchaseRequests, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProcurementActions.loadPurchaseRequestsSuccess, (state, { requests, totalCount }) => ({
    ...state,
    purchaseRequests: requests,
    requestTotalCount: totalCount,
    loading: false,
  })),
  on(ProcurementActions.loadPurchaseRequestsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProcurementActions.createPurchaseRequest, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProcurementActions.createPurchaseRequestSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProcurementActions.createPurchaseRequestFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Purchase Orders
  on(ProcurementActions.loadPurchaseOrders, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProcurementActions.loadPurchaseOrdersSuccess, (state, { orders, totalCount }) => ({
    ...state,
    purchaseOrders: orders,
    orderTotalCount: totalCount,
    loading: false,
  })),
  on(ProcurementActions.loadPurchaseOrdersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProcurementActions.loadPurchaseOrder, (state) => ({
    ...state,
    loading: true,
    selectedOrder: null,
  })),
  on(ProcurementActions.loadPurchaseOrderSuccess, (state, { order }) => ({
    ...state,
    selectedOrder: order,
    loading: false,
  })),
  on(ProcurementActions.loadPurchaseOrderFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(ProcurementActions.createPurchaseOrder, (state) => ({
    ...state,
    loading: true,
  })),
  on(ProcurementActions.createPurchaseOrderSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(ProcurementActions.createPurchaseOrderFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
