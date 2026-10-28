import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, exhaustMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SupplierService } from '../services/supplier.service';
import { PurchaseRequestService } from '../services/purchase-request.service';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { NotificationService } from '@ethelpms/shared/ui';
import { ProcurementActions } from './procurement.actions';

@Injectable()
export class ProcurementEffects {
  private readonly actions$ = inject(Actions);
  private readonly supplierService = inject(SupplierService);
  private readonly purchaseRequestService = inject(PurchaseRequestService);
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Suppliers

  loadSuppliers$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.loadSuppliers),
    switchMap(({ status, search }) =>
      this.supplierService.listSuppliers({ status, search }).pipe(
        map((suppliers) => ProcurementActions.loadSuppliersSuccess({ suppliers })),
        catchError((error) => of(ProcurementActions.loadSuppliersFailure({ error: error?.error?.detail ?? 'Failed to load suppliers' })))
      )
    )
  ));

  loadSupplier$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.loadSupplier),
    switchMap(({ id }) =>
      this.supplierService.getSupplier(id).pipe(
        map((supplier) => ProcurementActions.loadSupplierSuccess({ supplier })),
        catchError((error) => of(ProcurementActions.loadSupplierFailure({ error: error?.error?.detail ?? 'Failed to load supplier' })))
      )
    )
  ));

  createSupplier$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.createSupplier),
    exhaustMap(({ request }) =>
      this.supplierService.createSupplier(request).pipe(
        map((response) => ProcurementActions.createSupplierSuccess({ id: response.id })),
        catchError((error) => of(ProcurementActions.createSupplierFailure({ error: error?.error?.detail ?? 'Failed to create supplier' })))
      )
    )
  ));

  createSupplierSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.createSupplierSuccess),
    tap(() => {
      this.notification.success('Supplier created successfully');
      this.router.navigate(['/procurement/suppliers']);
    })
  ), { dispatch: false });

  // Purchase Requests

  loadPurchaseRequests$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.loadPurchaseRequests),
    switchMap(({ projectId, status, page, pageSize }) =>
      this.purchaseRequestService.listRequests({ projectId, status, page, pageSize }).pipe(
        map((response) => ProcurementActions.loadPurchaseRequestsSuccess({ requests: response.items, totalCount: response.totalCount })),
        catchError((error) => of(ProcurementActions.loadPurchaseRequestsFailure({ error: error?.error?.detail ?? 'Failed to load purchase requests' })))
      )
    )
  ));

  createPurchaseRequest$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.createPurchaseRequest),
    exhaustMap(({ request }) =>
      this.purchaseRequestService.createRequest(request).pipe(
        map((response) => ProcurementActions.createPurchaseRequestSuccess({ id: response.id })),
        catchError((error) => of(ProcurementActions.createPurchaseRequestFailure({ error: error?.error?.detail ?? 'Failed to create purchase request' })))
      )
    )
  ));

  createPurchaseRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.createPurchaseRequestSuccess),
    tap(() => {
      this.notification.success('Purchase request created successfully');
      this.router.navigate(['/procurement/requests']);
    })
  ), { dispatch: false });

  // Purchase Orders

  loadPurchaseOrders$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.loadPurchaseOrders),
    switchMap(({ supplierId, status, page, pageSize }) =>
      this.purchaseOrderService.listOrders({ supplierId, status, page, pageSize }).pipe(
        map((response) => ProcurementActions.loadPurchaseOrdersSuccess({ orders: response.items, totalCount: response.totalCount })),
        catchError((error) => of(ProcurementActions.loadPurchaseOrdersFailure({ error: error?.error?.detail ?? 'Failed to load purchase orders' })))
      )
    )
  ));

  loadPurchaseOrder$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.loadPurchaseOrder),
    switchMap(({ id }) =>
      this.purchaseOrderService.getOrder(id).pipe(
        map((order) => ProcurementActions.loadPurchaseOrderSuccess({ order })),
        catchError((error) => of(ProcurementActions.loadPurchaseOrderFailure({ error: error?.error?.detail ?? 'Failed to load purchase order' })))
      )
    )
  ));

  createPurchaseOrder$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.createPurchaseOrder),
    exhaustMap(({ request }) =>
      this.purchaseOrderService.createOrder(request).pipe(
        map((response) => ProcurementActions.createPurchaseOrderSuccess({ id: response.id })),
        catchError((error) => of(ProcurementActions.createPurchaseOrderFailure({ error: error?.error?.detail ?? 'Failed to create purchase order' })))
      )
    )
  ));

  createPurchaseOrderSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ProcurementActions.createPurchaseOrderSuccess),
    tap(() => {
      this.notification.success('Purchase order created successfully');
      this.router.navigate(['/procurement/orders']);
    })
  ), { dispatch: false });
}
