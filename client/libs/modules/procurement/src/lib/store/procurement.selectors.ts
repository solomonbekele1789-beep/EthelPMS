import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProcurementState, PROCUREMENT_FEATURE_KEY } from './procurement.reducer';

export const selectProcurementState = createFeatureSelector<ProcurementState>(PROCUREMENT_FEATURE_KEY);
export const selectSuppliers = createSelector(selectProcurementState, (state) => state.suppliers);
export const selectSelectedSupplier = createSelector(selectProcurementState, (state) => state.selectedSupplier);
export const selectPurchaseRequests = createSelector(selectProcurementState, (state) => state.purchaseRequests);
export const selectRequestTotalCount = createSelector(selectProcurementState, (state) => state.requestTotalCount);
export const selectPurchaseOrders = createSelector(selectProcurementState, (state) => state.purchaseOrders);
export const selectOrderTotalCount = createSelector(selectProcurementState, (state) => state.orderTotalCount);
export const selectSelectedOrder = createSelector(selectProcurementState, (state) => state.selectedOrder);
export const selectProcurementLoading = createSelector(selectProcurementState, (state) => state.loading);
export const selectProcurementError = createSelector(selectProcurementState, (state) => state.error);
