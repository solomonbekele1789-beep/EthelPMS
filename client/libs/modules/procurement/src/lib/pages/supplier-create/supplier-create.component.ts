import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProcurementActions } from '../../store/procurement.actions';
import { selectProcurementLoading } from '../../store/procurement.selectors';
import { CreateSupplierRequest } from '../../models/supplier.model';

@Component({
  selector: 'ethel-supplier-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'procurement.suppliers.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'procurement.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'procurement.fields.contactPerson' | translate }}</mat-label>
            <input matInput formControlName="contactPerson" />
            @if (form.controls.contactPerson.hasError('required')) {
              <mat-error>Contact person is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'procurement.fields.email' | translate }}</mat-label>
            <input matInput formControlName="email" type="email" />
            @if (form.controls.email.hasError('required')) {
              <mat-error>Email is required</mat-error>
            } @else if (form.controls.email.hasError('email')) {
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
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'procurement.suppliers.create'">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 800px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class SupplierCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectProcurementLoading);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    contactPerson: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    taxIdNumber: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateSupplierRequest = {
      name: value.name,
      contactPerson: value.contactPerson,
      email: value.email,
      phone: value.phone || undefined,
      address: value.address || undefined,
      taxIdNumber: value.taxIdNumber || undefined,
    };
    this.store.dispatch(ProcurementActions.createSupplier({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/procurement/suppliers']);
  }
}
