import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import {
  selectStockItems,
  selectAssetsLoading,
} from '../../store/assets.selectors';
import { StockService } from '../../services/stock.service';
import {
  StockItemDto,
  StockMovementType,
  RecordStockMovementRequest,
} from '../../models/stock.model';

@Component({
  selector: 'ethel-stock-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatChipsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="stockItem()?.name ?? ('assets.stock.detail' | translate)"></app-page-header>

    @if (loading() && !stockItem()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (stockItem()) {
      <!-- Stock Item Details -->
      <div class="detail-cards">
        <mat-card class="quantity-card">
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.quantityOnHand' | translate }}</div>
            <div class="quantity-value" [class.low-stock]="stockItem()!.quantityOnHand <= stockItem()!.reorderLevel">
              {{ stockItem()!.quantityOnHand }}
            </div>
            @if (stockItem()!.quantityOnHand <= stockItem()!.reorderLevel) {
              <mat-chip class="low-stock-chip">{{ 'assets.messages.lowStock' | translate }}</mat-chip>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.itemCode' | translate }}</div>
            <div class="info-value">{{ stockItem()!.itemCode }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.category' | translate }}</div>
            <div class="info-value">{{ stockItem()!.category }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.unit' | translate }}</div>
            <div class="info-value">{{ stockItem()!.unit }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.unitCost' | translate }}</div>
            <div class="info-value">{{ stockItem()!.unitCost | number:'1.2-2' }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.reorderLevel' | translate }}</div>
            <div class="info-value">{{ stockItem()!.reorderLevel }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.storageLocation' | translate }}</div>
            <div class="info-value">{{ stockItem()!.storageLocation ?? '-' }}</div>
          </mat-card-content>
        </mat-card>

        @if (stockItem()!.description) {
          <mat-card class="full-width-card">
            <mat-card-content>
              <div class="info-label">{{ 'assets.fields.description' | translate }}</div>
              <div class="info-value">{{ stockItem()!.description }}</div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Record Movement Form -->
      <h3>{{ 'assets.stock.recordMovement' | translate }}</h3>
      <mat-card class="inline-form-card" *appHasPermission="'assets.stock.issue'">
        <mat-card-content>
          <form [formGroup]="movementForm" (ngSubmit)="onRecordMovement()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.movementType' | translate }}</mat-label>
                <mat-select formControlName="movementType">
                  @for (type of movementTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
                @if (movementForm.controls.movementType.hasError('required')) {
                  <mat-error>Movement type is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.quantity' | translate }}</mat-label>
                <input matInput type="number" formControlName="quantity" />
                @if (movementForm.controls.quantity.hasError('required')) {
                  <mat-error>Quantity is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.unitCost' | translate }}</mat-label>
                <input matInput type="number" formControlName="unitCost" />
                @if (movementForm.controls.unitCost.hasError('required')) {
                  <mat-error>Unit cost is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.movementDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="movementDatePicker" formControlName="movementDate" />
                <mat-datepicker-toggle matIconSuffix [for]="movementDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #movementDatePicker></mat-datepicker>
                @if (movementForm.controls.movementDate.hasError('required')) {
                  <mat-error>Movement date is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.referenceNumber' | translate }}</mat-label>
                <input matInput formControlName="referenceNumber" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.projectId' | translate }}</mat-label>
                <input matInput formControlName="projectId" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'assets.fields.notes' | translate }}</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="movementForm.invalid">
                {{ 'assets.actions.record' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .quantity-card { grid-column: span 2; }
    .full-width-card { grid-column: 1 / -1; }
    .info-label { font-size: 0.75rem; color: rgba(0, 0, 0, 0.6); margin-bottom: 0.25rem; }
    .info-value { font-size: 1.1rem; font-weight: 500; }
    .quantity-value { font-size: 2rem; font-weight: 600; }
    .low-stock { color: #e65100; }
    .low-stock-chip { --mdc-chip-elevated-container-color: #fff3e0; margin-top: 0.5rem; }
    h3 { margin: 1.5rem 0 0.75rem; }
    .inline-form-card { margin-top: 0; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `,
})
export default class StockDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly stockService = inject(StockService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly allStockItems = this.store.selectSignal(selectStockItems);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly stockItem = computed<StockItemDto | undefined>(() => {
    return this.allStockItems().find((item) => item.id === this.id());
  });

  readonly movementTypes: StockMovementType[] = ['Receipt', 'Issue', 'Return', 'Adjustment', 'Transfer'];

  readonly movementForm = this.fb.nonNullable.group({
    movementType: ['' as StockMovementType | '', [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(1)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    movementDate: ['', [Validators.required]],
    referenceNumber: [''],
    notes: [''],
    projectId: [''],
  });

  ngOnInit(): void {
    // Ensure stock items are loaded (for find by id)
    if (this.allStockItems().length === 0) {
      this.store.dispatch(AssetsActions.loadStockItems({}));
    }
  }

  onRecordMovement(): void {
    if (this.movementForm.invalid) return;
    const value = this.movementForm.getRawValue();
    const request: RecordStockMovementRequest = {
      stockItemId: this.id(),
      movementType: value.movementType as StockMovementType,
      quantity: value.quantity,
      unitCost: value.unitCost,
      movementDate: typeof value.movementDate === 'string' ? value.movementDate : new Date(value.movementDate).toISOString(),
      referenceNumber: value.referenceNumber || undefined,
      notes: value.notes || undefined,
      projectId: value.projectId || undefined,
    };
    this.stockService.recordMovement(this.id(), request).subscribe({
      next: () => {
        this.notification.success('assets.messages.movementRecorded');
        this.movementForm.reset();
        // Reload stock items to update quantityOnHand
        this.store.dispatch(AssetsActions.loadStockItems({}));
      },
      error: () => this.notification.error('Failed to record movement'),
    });
  }
}
