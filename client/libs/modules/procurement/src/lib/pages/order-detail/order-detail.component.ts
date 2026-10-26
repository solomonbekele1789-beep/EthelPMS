import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProcurementActions } from '../../store/procurement.actions';
import { selectSelectedOrder, selectProcurementLoading } from '../../store/procurement.selectors';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { FulfillmentService } from '../../services/fulfillment.service';
import {
  CreateGoodsReceiptRequest,
  CreateSupplierInvoiceRequest,
  CreatePaymentRequestRequest,
} from '../../models/fulfillment.model';

@Component({
  selector: 'ethel-order-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="order()?.referenceNumber ?? ('procurement.orders.detail' | translate)">
      @if (order()) {
        <app-status-badge [status]="order()!.status" [label]="order()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !order()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (order()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Details Tab -->
        <mat-tab [label]="'procurement.orders.detail' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.referenceNumber' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ order()!.referenceNumber }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.purchaseRequestId' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ order()!.purchaseRequestId }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.supplierId' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ order()!.supplierId }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'common.status' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="order()!.status" [label]="order()!.status"></app-status-badge>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.totalAmount' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ order()!.totalAmount | number:'1.2-2' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.expectedDeliveryDate' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ order()!.expectedDeliveryDate ? (order()!.expectedDeliveryDate | date:'mediumDate') : '-' }}</mat-card-content>
              </mat-card>
            </div>

            <!-- Issue button -->
            @if (order()!.status === 'Draft') {
              <div class="action-buttons">
                <button mat-flat-button color="primary" *appHasPermission="'procurement.orders.issue'" (click)="onIssueOrder()">
                  <mat-icon>send</mat-icon>
                  {{ 'procurement.orders.issue' | translate }}
                </button>
                <button mat-button (click)="goBack()">
                  {{ 'common.back' | translate }}
                </button>
              </div>
            } @else {
              <div class="action-buttons">
                <button mat-button (click)="goBack()">
                  {{ 'common.back' | translate }}
                </button>
              </div>
            }

            <!-- Items Table -->
            <h3>{{ 'procurement.orders.items' | translate }}</h3>
            @if (order()!.items.length > 0) {
              <table mat-table [dataSource]="order()!.items" class="full-width-table">
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.description' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.description }}</td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.quantity' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.quantity }}</td>
                </ng-container>
                <ng-container matColumnDef="unit">
                  <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.unit' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.unit }}</td>
                </ng-container>
                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.unitPrice' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.unitPrice | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="receivedQuantity">
                  <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.receivedQuantity' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.receivedQuantity }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="orderItemColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: orderItemColumns;"></tr>
              </table>
            }
          </div>
        </mat-tab>

        <!-- Goods Receipt Tab (when Issued or PartiallyReceived) -->
        @if (order()!.status === 'Issued' || order()!.status === 'PartiallyReceived') {
          <mat-tab [label]="'procurement.grn.title' | translate">
            <div class="tab-content">
              <h3>{{ 'procurement.grn.create' | translate }}</h3>
              <mat-card class="inline-form-card" *appHasPermission="'procurement.receipts.create'">
                <mat-card-content>
                  <form [formGroup]="grnForm" (ngSubmit)="onCreateGrn()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.referenceNumber' | translate }}</mat-label>
                        <input matInput formControlName="referenceNumber" />
                        @if (grnForm.controls.referenceNumber.hasError('required')) {
                          <mat-error>Reference number is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.receivedDate' | translate }}</mat-label>
                        <input matInput [matDatepicker]="grnDatePicker" formControlName="receivedDate" />
                        <mat-datepicker-toggle matIconSuffix [for]="grnDatePicker"></mat-datepicker-toggle>
                        <mat-datepicker #grnDatePicker></mat-datepicker>
                        @if (grnForm.controls.receivedDate.hasError('required')) {
                          <mat-error>Received date is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.receivedBy' | translate }}</mat-label>
                        <input matInput formControlName="receivedBy" />
                        @if (grnForm.controls.receivedBy.hasError('required')) {
                          <mat-error>Received by is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.deliveryNoteNumber' | translate }}</mat-label>
                        <input matInput formControlName="deliveryNoteNumber" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.remarks' | translate }}</mat-label>
                        <input matInput formControlName="remarks" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-flat-button color="primary" type="submit" [disabled]="grnForm.invalid">
                        {{ 'procurement.grn.create' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        }

        <!-- Invoice & Payment Tab -->
        <mat-tab [label]="'procurement.invoicePayment.title' | translate">
          <div class="tab-content">
            <!-- Create Invoice -->
            <h3>{{ 'procurement.invoicePayment.createInvoice' | translate }}</h3>
            <mat-card class="inline-form-card" *appHasPermission="'procurement.invoices.create'">
              <mat-card-content>
                <form [formGroup]="invoiceForm" (ngSubmit)="onCreateInvoice()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.invoiceNumber' | translate }}</mat-label>
                      <input matInput formControlName="invoiceNumber" />
                      @if (invoiceForm.controls.invoiceNumber.hasError('required')) {
                        <mat-error>Invoice number is required</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.invoiceAmount' | translate }}</mat-label>
                      <input matInput formControlName="invoiceAmount" type="number" />
                      @if (invoiceForm.controls.invoiceAmount.hasError('required')) {
                        <mat-error>Invoice amount is required</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.invoiceDate' | translate }}</mat-label>
                      <input matInput [matDatepicker]="invDatePicker" formControlName="invoiceDate" />
                      <mat-datepicker-toggle matIconSuffix [for]="invDatePicker"></mat-datepicker-toggle>
                      <mat-datepicker #invDatePicker></mat-datepicker>
                      @if (invoiceForm.controls.invoiceDate.hasError('required')) {
                        <mat-error>Invoice date is required</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.dueDate' | translate }}</mat-label>
                      <input matInput [matDatepicker]="dueDatePicker" formControlName="dueDate" />
                      <mat-datepicker-toggle matIconSuffix [for]="dueDatePicker"></mat-datepicker-toggle>
                      <mat-datepicker #dueDatePicker></mat-datepicker>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.grnId' | translate }}</mat-label>
                      <input matInput formControlName="grnId" />
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="invoiceForm.invalid">
                      {{ 'procurement.invoicePayment.createInvoice' | translate }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Create Payment -->
            <h3>{{ 'procurement.invoicePayment.createPayment' | translate }}</h3>
            <mat-card class="inline-form-card" *appHasPermission="'procurement.payments.create'">
              <mat-card-content>
                <form [formGroup]="paymentForm" (ngSubmit)="onCreatePayment()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.referenceNumber' | translate }}</mat-label>
                      <input matInput formControlName="referenceNumber" />
                      @if (paymentForm.controls.referenceNumber.hasError('required')) {
                        <mat-error>Reference number is required</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.amount' | translate }}</mat-label>
                      <input matInput formControlName="amount" type="number" />
                      @if (paymentForm.controls.amount.hasError('required')) {
                        <mat-error>Amount is required</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.paymentMethod' | translate }}</mat-label>
                      <input matInput formControlName="paymentMethod" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'procurement.fields.bankDetails' | translate }}</mat-label>
                      <input matInput formControlName="bankDetails" />
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="paymentForm.invalid">
                      {{ 'procurement.invoicePayment.createPayment' | translate }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    :host { display: block; }
    .tab-content { padding: 1.5rem 0; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    h3 { margin: 1.5rem 0 0.75rem; }
    .full-width-table { width: 100%; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .inline-form-card { margin-top: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `,
})
export default class OrderDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(PurchaseOrderService);
  private readonly fulfillmentService = inject(FulfillmentService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly order = this.store.selectSignal(selectSelectedOrder);
  readonly loading = this.store.selectSignal(selectProcurementLoading);

  readonly activeTab = signal(0);

  // Created invoice ID for linking payment
  readonly createdInvoiceId = signal<string | null>(null);

  readonly orderItemColumns = ['description', 'quantity', 'unit', 'unitPrice', 'receivedQuantity'];

  // GRN Form
  readonly grnForm = this.fb.nonNullable.group({
    referenceNumber: ['', [Validators.required]],
    receivedDate: ['', [Validators.required]],
    receivedBy: ['', [Validators.required]],
    deliveryNoteNumber: [''],
    remarks: [''],
  });

  // Invoice Form
  readonly invoiceForm = this.fb.nonNullable.group({
    invoiceNumber: ['', [Validators.required]],
    invoiceAmount: [0, [Validators.required]],
    invoiceDate: ['', [Validators.required]],
    dueDate: [''],
    grnId: [''],
  });

  // Payment Form
  readonly paymentForm = this.fb.nonNullable.group({
    referenceNumber: ['', [Validators.required]],
    amount: [0, [Validators.required]],
    paymentMethod: [''],
    bankDetails: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(ProcurementActions.loadPurchaseOrder({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  // --- Issue ---
  onIssueOrder(): void {
    this.orderService.issueOrder(this.id()).subscribe({
      next: () => {
        this.notification.success('Order issued successfully');
        this.store.dispatch(ProcurementActions.loadPurchaseOrder({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to issue order'),
    });
  }

  // --- Goods Receipt ---
  onCreateGrn(): void {
    if (this.grnForm.invalid) return;
    const value = this.grnForm.getRawValue();
    const request: CreateGoodsReceiptRequest = {
      referenceNumber: value.referenceNumber,
      purchaseOrderId: this.id(),
      receivedDate: value.receivedDate,
      receivedBy: value.receivedBy,
      deliveryNoteNumber: value.deliveryNoteNumber || undefined,
      remarks: value.remarks || undefined,
    };
    this.fulfillmentService.createGoodsReceipt(request).subscribe({
      next: () => {
        this.notification.success('Goods receipt created successfully');
        this.grnForm.reset();
        this.store.dispatch(ProcurementActions.loadPurchaseOrder({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to create goods receipt'),
    });
  }

  // --- Invoice ---
  onCreateInvoice(): void {
    if (this.invoiceForm.invalid) return;
    const o = this.order();
    if (!o) return;
    const value = this.invoiceForm.getRawValue();
    const request: CreateSupplierInvoiceRequest = {
      invoiceNumber: value.invoiceNumber,
      supplierId: o.supplierId,
      purchaseOrderId: this.id(),
      invoiceAmount: value.invoiceAmount,
      invoiceDate: value.invoiceDate,
      dueDate: value.dueDate || undefined,
      grnId: value.grnId || undefined,
    };
    this.fulfillmentService.createInvoice(request).subscribe({
      next: (res) => {
        this.notification.success('Invoice created successfully');
        this.createdInvoiceId.set(res.id);
        this.invoiceForm.reset({ invoiceAmount: 0 });
      },
      error: () => this.notification.error('Failed to create invoice'),
    });
  }

  // --- Payment ---
  onCreatePayment(): void {
    if (this.paymentForm.invalid) return;
    const invoiceId = this.createdInvoiceId();
    if (!invoiceId) {
      this.notification.error('Create an invoice first');
      return;
    }
    const o = this.order();
    if (!o) return;
    const value = this.paymentForm.getRawValue();
    const request: CreatePaymentRequestRequest = {
      referenceNumber: value.referenceNumber,
      supplierInvoiceId: invoiceId,
      projectId: o.purchaseRequestId, // project is typically linked via the request
      amount: value.amount,
      paymentMethod: value.paymentMethod || undefined,
      bankDetails: value.bankDetails || undefined,
    };
    this.fulfillmentService.createPaymentRequest(request).subscribe({
      next: () => {
        this.notification.success('Payment request created successfully');
        this.paymentForm.reset({ amount: 0 });
      },
      error: () => this.notification.error('Failed to create payment request'),
    });
  }

  goBack(): void {
    this.router.navigate(['/procurement/orders']);
  }
}
