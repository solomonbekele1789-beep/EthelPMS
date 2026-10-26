import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PurchaseRequestService } from '../../services/purchase-request.service';
import { RfqService } from '../../services/rfq.service';
import {
  PurchaseRequestDto,
  AddPurchaseRequestItemRequest,
} from '../../models/purchase-request.model';
import {
  CreateRfqRequest,
  SubmitRfqResponseRequest,
  EvaluateBidRequest,
} from '../../models/purchase-order.model';

@Component({
  selector: 'ethel-request-detail',
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
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="request()?.referenceNumber ?? ('procurement.requests.detail' | translate)">
      @if (request()) {
        <app-status-badge [status]="request()!.status" [label]="request()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !request()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (request()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Details Tab -->
        <mat-tab [label]="'procurement.requests.detail' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.referenceNumber' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ request()!.referenceNumber }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.projectId' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ request()!.projectId }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'common.status' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="request()!.status" [label]="request()!.status"></app-status-badge>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.totalAmount' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ request()!.totalAmount | number:'1.2-2' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.method' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ request()!.method }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.approvedBy' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ request()!.approvedBy || '-' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'procurement.fields.approvalDate' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ request()!.approvalDate ? (request()!.approvalDate | date:'mediumDate') : '-' }}</mat-card-content>
              </mat-card>
            </div>

            <mat-card class="full-width-card">
              <mat-card-header><mat-card-title>{{ 'procurement.fields.justification' | translate }}</mat-card-title></mat-card-header>
              <mat-card-content>{{ request()!.justification }}</mat-card-content>
            </mat-card>

            <!-- Workflow Buttons -->
            <div class="action-buttons">
              @if (request()!.status === 'Draft') {
                <button mat-flat-button color="primary" *appHasPermission="'procurement.requests.update'" (click)="onSubmitRequest()">
                  <mat-icon>send</mat-icon>
                  {{ 'procurement.actions.submit' | translate }}
                </button>
              }
              @if (request()!.status === 'Submitted') {
                <button mat-flat-button color="primary" *appHasPermission="'procurement.requests.approve'" (click)="onApproveRequest()">
                  <mat-icon>check_circle</mat-icon>
                  {{ 'procurement.actions.approve' | translate }}
                </button>
              }
              <button mat-button (click)="goBack()">
                {{ 'common.back' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Items Tab -->
        <mat-tab [label]="'procurement.requests.items' | translate">
          <div class="tab-content">
            @if (request()!.items.length > 0) {
              <table mat-table [dataSource]="request()!.items" class="full-width-table">
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
                <ng-container matColumnDef="estimatedUnitCost">
                  <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.estimatedUnitCost' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.estimatedUnitCost | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="specification">
                  <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.specification' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.specification || '-' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
              </table>
            } @else {
              <app-empty-state icon="list" title="No items" message="Add items to this purchase request."></app-empty-state>
            }

            <div class="add-section" *appHasPermission="'procurement.requests.update'">
              <button mat-flat-button color="primary" (click)="showItemForm.set(!showItemForm())">
                <mat-icon>add</mat-icon>
                {{ 'procurement.requests.addItem' | translate }}
              </button>
            </div>

            @if (showItemForm()) {
              <mat-card class="inline-form-card">
                <mat-card-header><mat-card-title>{{ 'procurement.requests.addItem' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="itemForm" (ngSubmit)="onAddItem()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.description' | translate }}</mat-label>
                        <input matInput formControlName="description" />
                        @if (itemForm.controls.description.hasError('required')) {
                          <mat-error>Description is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.quantity' | translate }}</mat-label>
                        <input matInput formControlName="quantity" type="number" />
                        @if (itemForm.controls.quantity.hasError('required')) {
                          <mat-error>Quantity is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.unit' | translate }}</mat-label>
                        <input matInput formControlName="unit" />
                        @if (itemForm.controls.unit.hasError('required')) {
                          <mat-error>Unit is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.estimatedUnitCost' | translate }}</mat-label>
                        <input matInput formControlName="estimatedUnitCost" type="number" />
                        @if (itemForm.controls.estimatedUnitCost.hasError('required')) {
                          <mat-error>Estimated unit cost is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.specification' | translate }}</mat-label>
                        <input matInput formControlName="specification" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-button type="button" (click)="showItemForm.set(false)">{{ 'common.cancel' | translate }}</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="itemForm.invalid">{{ 'common.save' | translate }}</button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- RFQ Tab (only when Approved) -->
        @if (request()!.status === 'Approved') {
          <mat-tab [label]="'procurement.rfq.title' | translate">
            <div class="tab-content">
              <!-- Create RFQ -->
              <h3>{{ 'procurement.rfq.create' | translate }}</h3>
              <mat-card class="inline-form-card" *appHasPermission="'procurement.rfqs.create'">
                <mat-card-content>
                  <form [formGroup]="rfqForm" (ngSubmit)="onCreateRfq()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.referenceNumber' | translate }}</mat-label>
                        <input matInput formControlName="referenceNumber" />
                        @if (rfqForm.controls.referenceNumber.hasError('required')) {
                          <mat-error>Reference number is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.deadline' | translate }}</mat-label>
                        <input matInput [matDatepicker]="deadlinePicker" formControlName="deadline" />
                        <mat-datepicker-toggle matIconSuffix [for]="deadlinePicker"></mat-datepicker-toggle>
                        <mat-datepicker #deadlinePicker></mat-datepicker>
                        @if (rfqForm.controls.deadline.hasError('required')) {
                          <mat-error>Deadline is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.termsAndConditions' | translate }}</mat-label>
                        <input matInput formControlName="termsAndConditions" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.minimumResponses' | translate }}</mat-label>
                        <input matInput formControlName="minimumResponses" type="number" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-flat-button color="primary" type="submit" [disabled]="rfqForm.invalid">
                        {{ 'procurement.rfq.create' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>

              <!-- Submit RFQ Response -->
              <h3>{{ 'procurement.rfq.submitResponse' | translate }}</h3>
              <mat-card class="inline-form-card" *appHasPermission="'procurement.rfqs.create'">
                <mat-card-content>
                  <form [formGroup]="responseForm" (ngSubmit)="onSubmitResponse()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.supplierId' | translate }}</mat-label>
                        <input matInput formControlName="supplierId" />
                        @if (responseForm.controls.supplierId.hasError('required')) {
                          <mat-error>Supplier ID is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.totalQuotedAmount' | translate }}</mat-label>
                        <input matInput formControlName="totalQuotedAmount" type="number" />
                        @if (responseForm.controls.totalQuotedAmount.hasError('required')) {
                          <mat-error>Quoted amount is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.deliveryDays' | translate }}</mat-label>
                        <input matInput formControlName="deliveryDays" type="number" />
                        @if (responseForm.controls.deliveryDays.hasError('required')) {
                          <mat-error>Delivery days is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.notes' | translate }}</mat-label>
                        <input matInput formControlName="notes" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-flat-button color="primary" type="submit" [disabled]="responseForm.invalid">
                        {{ 'procurement.rfq.submitResponse' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>

              <!-- Evaluate Bid -->
              <h3>{{ 'procurement.rfq.evaluateBid' | translate }}</h3>
              <mat-card class="inline-form-card" *appHasPermission="'procurement.rfqs.create'">
                <mat-card-content>
                  <form [formGroup]="bidForm" (ngSubmit)="onEvaluateBid()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.rfqResponseId' | translate }}</mat-label>
                        <input matInput formControlName="rfqResponseId" />
                        @if (bidForm.controls.rfqResponseId.hasError('required')) {
                          <mat-error>RFQ Response ID is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.supplierId' | translate }}</mat-label>
                        <input matInput formControlName="supplierId" />
                        @if (bidForm.controls.supplierId.hasError('required')) {
                          <mat-error>Supplier ID is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.technicalScore' | translate }}</mat-label>
                        <input matInput formControlName="technicalScore" type="number" />
                        @if (bidForm.controls.technicalScore.hasError('required')) {
                          <mat-error>Technical score is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.financialScore' | translate }}</mat-label>
                        <input matInput formControlName="financialScore" type="number" />
                        @if (bidForm.controls.financialScore.hasError('required')) {
                          <mat-error>Financial score is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.technicalWeight' | translate }}</mat-label>
                        <input matInput formControlName="technicalWeight" type="number" />
                        @if (bidForm.controls.technicalWeight.hasError('required')) {
                          <mat-error>Technical weight is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.financialWeight' | translate }}</mat-label>
                        <input matInput formControlName="financialWeight" type="number" />
                        @if (bidForm.controls.financialWeight.hasError('required')) {
                          <mat-error>Financial weight is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'procurement.fields.notes' | translate }}</mat-label>
                        <input matInput formControlName="bidNotes" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-flat-button color="primary" type="submit" [disabled]="bidForm.invalid">
                        {{ 'procurement.rfq.evaluateBid' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        }
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
    .full-width-card { margin-bottom: 1.5rem; }
    h3 { margin: 1.5rem 0 0.75rem; }
    .full-width-table { width: 100%; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .add-section { margin-top: 1.5rem; }
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
export default class RequestDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly requestService = inject(PurchaseRequestService);
  private readonly rfqService = inject(RfqService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly request = signal<PurchaseRequestDto | null>(null);
  readonly loading = signal(false);
  readonly activeTab = signal(0);
  readonly showItemForm = signal(false);

  // RFQ state - track the created RFQ id for responses/evaluations
  readonly createdRfqId = signal<string | null>(null);

  readonly itemColumns = ['description', 'quantity', 'unit', 'estimatedUnitCost', 'specification'];

  // Add Item form
  readonly itemForm = this.fb.nonNullable.group({
    description: ['', [Validators.required]],
    quantity: [0, [Validators.required]],
    unit: ['', [Validators.required]],
    estimatedUnitCost: [0, [Validators.required]],
    specification: [''],
  });

  // Create RFQ form
  readonly rfqForm = this.fb.nonNullable.group({
    referenceNumber: ['', [Validators.required]],
    deadline: ['', [Validators.required]],
    termsAndConditions: [''],
    minimumResponses: [null as number | null],
  });

  // Submit RFQ Response form
  readonly responseForm = this.fb.nonNullable.group({
    supplierId: ['', [Validators.required]],
    totalQuotedAmount: [0, [Validators.required]],
    deliveryDays: [0, [Validators.required]],
    notes: [''],
  });

  // Evaluate Bid form
  readonly bidForm = this.fb.nonNullable.group({
    rfqResponseId: ['', [Validators.required]],
    supplierId: ['', [Validators.required]],
    technicalScore: [0, [Validators.required]],
    financialScore: [0, [Validators.required]],
    technicalWeight: [0, [Validators.required]],
    financialWeight: [0, [Validators.required]],
    bidNotes: [''],
  });

  ngOnInit(): void {
    this.loadRequest();
  }

  loadRequest(): void {
    this.loading.set(true);
    this.requestService.listRequests({ page: 1, pageSize: 1 }).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.requestService.getRequest(this.id()).subscribe({
      next: (result) => {
        this.request.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load purchase request');
        this.loading.set(false);
      },
    });
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  // --- Workflow ---
  onSubmitRequest(): void {
    this.requestService.submitRequest(this.id()).subscribe({
      next: () => {
        this.notification.success('Request submitted successfully');
        this.loadRequest();
      },
      error: () => this.notification.error('Failed to submit request'),
    });
  }

  onApproveRequest(): void {
    this.requestService.approveRequest(this.id()).subscribe({
      next: () => {
        this.notification.success('Request approved successfully');
        this.loadRequest();
      },
      error: () => this.notification.error('Failed to approve request'),
    });
  }

  // --- Items ---
  onAddItem(): void {
    if (this.itemForm.invalid) return;
    const value = this.itemForm.getRawValue();
    const request: AddPurchaseRequestItemRequest = {
      requestId: this.id(),
      description: value.description,
      quantity: value.quantity,
      unit: value.unit,
      estimatedUnitCost: value.estimatedUnitCost,
      specification: value.specification || undefined,
    };
    this.requestService.addRequestItem(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Item added successfully');
        this.showItemForm.set(false);
        this.itemForm.reset({ quantity: 0, estimatedUnitCost: 0 });
        this.loadRequest();
      },
      error: () => this.notification.error('Failed to add item'),
    });
  }

  // --- RFQ ---
  onCreateRfq(): void {
    if (this.rfqForm.invalid) return;
    const value = this.rfqForm.getRawValue();
    const request: CreateRfqRequest = {
      referenceNumber: value.referenceNumber,
      purchaseRequestId: this.id(),
      deadline: value.deadline,
      termsAndConditions: value.termsAndConditions || undefined,
      minimumResponses: value.minimumResponses ?? undefined,
    };
    this.rfqService.createRfq(request).subscribe({
      next: (res) => {
        this.notification.success('RFQ created successfully');
        this.createdRfqId.set(res.id);
        this.rfqForm.reset();
      },
      error: () => this.notification.error('Failed to create RFQ'),
    });
  }

  onSubmitResponse(): void {
    if (this.responseForm.invalid) return;
    const rfqId = this.createdRfqId();
    if (!rfqId) {
      this.notification.error('Create an RFQ first');
      return;
    }
    const value = this.responseForm.getRawValue();
    const request: SubmitRfqResponseRequest = {
      rfqId,
      supplierId: value.supplierId,
      totalQuotedAmount: value.totalQuotedAmount,
      deliveryDays: value.deliveryDays,
      notes: value.notes || undefined,
    };
    this.rfqService.submitResponse(request).subscribe({
      next: () => {
        this.notification.success('Response submitted successfully');
        this.responseForm.reset({ totalQuotedAmount: 0, deliveryDays: 0 });
      },
      error: () => this.notification.error('Failed to submit response'),
    });
  }

  onEvaluateBid(): void {
    if (this.bidForm.invalid) return;
    const rfqId = this.createdRfqId();
    if (!rfqId) {
      this.notification.error('Create an RFQ first');
      return;
    }
    const value = this.bidForm.getRawValue();
    const request: EvaluateBidRequest = {
      rfqId,
      rfqResponseId: value.rfqResponseId,
      supplierId: value.supplierId,
      technicalScore: value.technicalScore,
      financialScore: value.financialScore,
      technicalWeight: value.technicalWeight,
      financialWeight: value.financialWeight,
      notes: value.bidNotes || undefined,
    };
    this.rfqService.evaluateBid(rfqId, request).subscribe({
      next: () => {
        this.notification.success('Bid evaluated successfully');
        this.bidForm.reset({ technicalScore: 0, financialScore: 0, technicalWeight: 0, financialWeight: 0 });
      },
      error: () => this.notification.error('Failed to evaluate bid'),
    });
  }

  goBack(): void {
    this.router.navigate(['/procurement/requests']);
  }
}
