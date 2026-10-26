import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProcurementPlanService } from '../../services/procurement-plan.service';
import {
  ProcurementPlanDto,
  ProcurementPlanItemDto,
  AddPlanItemRequest,
  ProcurementMethod,
} from '../../models/procurement-plan.model';

@Component({
  selector: 'ethel-plan-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="plan()?.title ?? ('procurement.plans.detail' | translate)">
      @if (plan()) {
        <app-status-badge [status]="plan()!.status" [label]="plan()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !plan()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (plan()) {
      <div class="detail-grid">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.title' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ plan()!.title }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.referenceNumber' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ plan()!.referenceNumber }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.projectId' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ plan()!.projectId }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.fiscalYear' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ plan()!.fiscalYear }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'common.status' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <app-status-badge [status]="plan()!.status" [label]="plan()!.status"></app-status-badge>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.description' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ plan()!.description || '-' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.totalEstimatedValue' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ plan()!.totalEstimatedValue | number:'1.2-2' }}</mat-card-content>
        </mat-card>
      </div>

      <!-- Items Table -->
      <h3>{{ 'procurement.plans.items' | translate }}</h3>
      @if (plan()!.items.length > 0) {
        <table mat-table [dataSource]="plan()!.items" class="full-width-table">
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.description' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.description }}</td>
          </ng-container>
          <ng-container matColumnDef="estimatedCost">
            <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.estimatedCost' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.estimatedCost | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="method">
            <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.method' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.method }}</td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.quantity' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.quantity }}</td>
          </ng-container>
          <ng-container matColumnDef="unit">
            <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.unit' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.unit || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="plannedQuarter">
            <th mat-header-cell *matHeaderCellDef>{{ 'procurement.fields.plannedQuarter' | translate }}</th>
            <td mat-cell *matCellDef="let row">Q{{ row.plannedQuarter }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
        </table>
      }

      <!-- Workflow Buttons -->
      <div class="action-buttons">
        @if (plan()!.status === 'Draft') {
          <button mat-flat-button color="primary" *appHasPermission="'procurement.plans.update'" (click)="onSubmit()">
            <mat-icon>send</mat-icon>
            {{ 'procurement.actions.submit' | translate }}
          </button>
        }
        @if (plan()!.status === 'Submitted') {
          <button mat-flat-button color="primary" *appHasPermission="'procurement.plans.approve'" (click)="onApprove()">
            <mat-icon>check_circle</mat-icon>
            {{ 'procurement.actions.approve' | translate }}
          </button>
        }
        <button mat-stroked-button *appHasPermission="'procurement.plans.update'" (click)="showItemForm.set(!showItemForm())">
          <mat-icon>add</mat-icon>
          {{ 'procurement.plans.addItem' | translate }}
        </button>
        <button mat-button (click)="goBack()">
          {{ 'common.back' | translate }}
        </button>
      </div>

      <!-- Add Item Form -->
      @if (showItemForm()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'procurement.plans.addItem' | translate }}</mat-card-title></mat-card-header>
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
                  <mat-label>{{ 'procurement.fields.estimatedCost' | translate }}</mat-label>
                  <input matInput formControlName="estimatedCost" type="number" />
                  @if (itemForm.controls.estimatedCost.hasError('required')) {
                    <mat-error>Estimated cost is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.method' | translate }}</mat-label>
                  <mat-select formControlName="method">
                    @for (m of procurementMethods; track m) {
                      <mat-option [value]="m">{{ m }}</mat-option>
                    }
                  </mat-select>
                  @if (itemForm.controls.method.hasError('required')) {
                    <mat-error>Method is required</mat-error>
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
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.plannedQuarter' | translate }} (1-4)</mat-label>
                  <input matInput formControlName="plannedQuarter" type="number" min="1" max="4" />
                  @if (itemForm.controls.plannedQuarter.hasError('required')) {
                    <mat-error>Planned quarter is required</mat-error>
                  }
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
    }
  `,
  styles: `
    :host { display: block; }
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
    .inline-form-card { margin-top: 1.5rem; }
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
export default class PlanDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly planService = inject(ProcurementPlanService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly plan = signal<ProcurementPlanDto | null>(null);
  readonly loading = signal(false);
  readonly showItemForm = signal(false);

  readonly procurementMethods: ProcurementMethod[] = [
    'DirectPurchase', 'RequestForQuotation', 'OpenBidding', 'RestrictedBidding', 'SingleSource',
  ];

  readonly itemColumns = ['description', 'estimatedCost', 'method', 'quantity', 'unit', 'plannedQuarter'];

  readonly itemForm = this.fb.nonNullable.group({
    description: ['', [Validators.required]],
    estimatedCost: [0, [Validators.required]],
    method: ['', [Validators.required]],
    quantity: [0, [Validators.required]],
    unit: [''],
    plannedQuarter: [1, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadPlan();
  }

  loadPlan(): void {
    this.loading.set(true);
    this.planService.getPlan(this.id()).subscribe({
      next: (plan) => {
        this.plan.set(plan);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load procurement plan');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    this.planService.submitPlan(this.id()).subscribe({
      next: () => {
        this.notification.success('Plan submitted successfully');
        this.loadPlan();
      },
      error: () => this.notification.error('Failed to submit plan'),
    });
  }

  onApprove(): void {
    this.planService.approvePlan(this.id()).subscribe({
      next: () => {
        this.notification.success('Plan approved successfully');
        this.loadPlan();
      },
      error: () => this.notification.error('Failed to approve plan'),
    });
  }

  onAddItem(): void {
    if (this.itemForm.invalid) return;
    const value = this.itemForm.getRawValue();
    const request: AddPlanItemRequest = {
      planId: this.id(),
      description: value.description,
      estimatedCost: value.estimatedCost,
      method: value.method as ProcurementMethod,
      quantity: value.quantity,
      unit: value.unit || undefined,
      plannedQuarter: value.plannedQuarter,
    };
    this.planService.addPlanItem(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Item added successfully');
        this.showItemForm.set(false);
        this.itemForm.reset({ estimatedCost: 0, quantity: 0, plannedQuarter: 1 });
        this.loadPlan();
      },
      error: () => this.notification.error('Failed to add item'),
    });
  }

  goBack(): void {
    this.router.navigate(['/procurement/suppliers']);
  }
}
