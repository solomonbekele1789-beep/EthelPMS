import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProcurementActions } from '../../store/procurement.actions';
import { selectSelectedSupplier, selectProcurementLoading } from '../../store/procurement.selectors';
import { SupplierService } from '../../services/supplier.service';
import { UpdateSupplierRequest } from '../../models/supplier.model';

@Component({
  selector: 'ethel-supplier-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="supplier()?.name ?? ('procurement.suppliers.detail' | translate)">
      @if (supplier()) {
        <app-status-badge [status]="supplier()!.status" [label]="supplier()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !supplier()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (supplier()) {
      <div class="detail-grid">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.name' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ supplier()!.name }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.contactPerson' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ supplier()!.contactPerson }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.email' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ supplier()!.email }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.phone' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ supplier()!.phone || '-' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.address' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ supplier()!.address || '-' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.taxIdNumber' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ supplier()!.taxIdNumber || '-' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'common.status' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <app-status-badge [status]="supplier()!.status" [label]="supplier()!.status"></app-status-badge>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'procurement.fields.rating' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ supplier()!.rating | number:'1.1-1' }}</mat-card-content>
        </mat-card>
      </div>

      <!-- Actions for Active suppliers -->
      @if (supplier()!.status === 'Active') {
        <div class="action-buttons">
          <button mat-stroked-button *appHasPermission="'procurement.suppliers.update'" (click)="showRateForm.set(!showRateForm())">
            <mat-icon>star</mat-icon>
            {{ 'procurement.suppliers.rate' | translate }}
          </button>
          <button mat-stroked-button color="warn" *appHasPermission="'procurement.suppliers.update'" (click)="onBlacklist()">
            <mat-icon>block</mat-icon>
            {{ 'procurement.suppliers.blacklist' | translate }}
          </button>
          <button mat-stroked-button *appHasPermission="'procurement.suppliers.update'" (click)="showEditForm.set(!showEditForm())">
            <mat-icon>edit</mat-icon>
            {{ 'common.edit' | translate }}
          </button>
          <button mat-button (click)="goBack()">
            {{ 'common.back' | translate }}
          </button>
        </div>
      } @else {
        <div class="action-buttons">
          <button mat-stroked-button *appHasPermission="'procurement.suppliers.update'" (click)="showEditForm.set(!showEditForm())">
            <mat-icon>edit</mat-icon>
            {{ 'common.edit' | translate }}
          </button>
          <button mat-button (click)="goBack()">
            {{ 'common.back' | translate }}
          </button>
        </div>
      }

      <!-- Rate Supplier Form -->
      @if (showRateForm()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'procurement.suppliers.rate' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'procurement.fields.score' | translate }} (1-5)</mat-label>
                <input matInput type="number" min="1" max="5" [(ngModel)]="rateScore" />
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button (click)="showRateForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" [disabled]="!rateScore || rateScore < 1 || rateScore > 5" (click)="onRate()">
                {{ 'common.save' | translate }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Edit Supplier Form -->
      @if (showEditForm()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'common.edit' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="editForm" (ngSubmit)="onUpdate()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.name' | translate }}</mat-label>
                  <input matInput formControlName="name" />
                  @if (editForm.controls.name.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.contactPerson' | translate }}</mat-label>
                  <input matInput formControlName="contactPerson" />
                  @if (editForm.controls.contactPerson.hasError('required')) {
                    <mat-error>Contact person is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.email' | translate }}</mat-label>
                  <input matInput formControlName="email" type="email" />
                  @if (editForm.controls.email.hasError('required')) {
                    <mat-error>Email is required</mat-error>
                  } @else if (editForm.controls.email.hasError('email')) {
                    <mat-error>Invalid email address</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.phone' | translate }}</mat-label>
                  <input matInput formControlName="phone" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.address' | translate }}</mat-label>
                  <input matInput formControlName="address" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'procurement.fields.taxIdNumber' | translate }}</mat-label>
                  <input matInput formControlName="taxIdNumber" />
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="showEditForm.set(false)">{{ 'common.cancel' | translate }}</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid">{{ 'common.save' | translate }}</button>
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
export default class SupplierDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly supplierService = inject(SupplierService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly supplier = this.store.selectSignal(selectSelectedSupplier);
  readonly loading = this.store.selectSignal(selectProcurementLoading);

  readonly showRateForm = signal(false);
  readonly showEditForm = signal(false);
  rateScore: number | null = null;

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    contactPerson: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    taxIdNumber: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(ProcurementActions.loadSupplier({ id: this.id() }));
    this.patchEditForm();
  }

  private patchEditForm(): void {
    const s = this.supplier();
    if (s) {
      this.editForm.patchValue({
        name: s.name,
        contactPerson: s.contactPerson,
        email: s.email,
        phone: s.phone ?? '',
        address: s.address ?? '',
        taxIdNumber: s.taxIdNumber ?? '',
      });
    }
  }

  onRate(): void {
    if (!this.rateScore || this.rateScore < 1 || this.rateScore > 5) return;
    this.supplierService.rateSupplier(this.id(), this.rateScore).subscribe({
      next: () => {
        this.notification.success('Supplier rated successfully');
        this.showRateForm.set(false);
        this.rateScore = null;
        this.store.dispatch(ProcurementActions.loadSupplier({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to rate supplier'),
    });
  }

  onBlacklist(): void {
    if (!confirm('Are you sure you want to blacklist this supplier?')) return;
    this.supplierService.blacklistSupplier(this.id()).subscribe({
      next: () => {
        this.notification.success('Supplier blacklisted successfully');
        this.store.dispatch(ProcurementActions.loadSupplier({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to blacklist supplier'),
    });
  }

  onUpdate(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateSupplierRequest = {
      id: this.id(),
      name: value.name,
      contactPerson: value.contactPerson,
      email: value.email,
      phone: value.phone || undefined,
      address: value.address || undefined,
      taxIdNumber: value.taxIdNumber || undefined,
    };
    this.supplierService.updateSupplier(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Supplier updated successfully');
        this.showEditForm.set(false);
        this.store.dispatch(ProcurementActions.loadSupplier({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to update supplier'),
    });
  }

  goBack(): void {
    this.router.navigate(['/procurement/suppliers']);
  }
}
