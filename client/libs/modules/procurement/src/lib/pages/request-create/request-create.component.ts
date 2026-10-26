import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProcurementActions } from '../../store/procurement.actions';
import { selectProcurementLoading } from '../../store/procurement.selectors';
import { CreatePurchaseRequestRequest } from '../../models/purchase-request.model';
import { ProcurementMethod } from '../../models/procurement-plan.model';

@Component({
  selector: 'ethel-request-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'procurement.requests.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'procurement.fields.referenceNumber' | translate }}</mat-label>
            <input matInput formControlName="referenceNumber" />
            @if (form.controls.referenceNumber.hasError('required')) {
              <mat-error>Reference number is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'procurement.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project ID is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'procurement.fields.method' | translate }}</mat-label>
            <mat-select formControlName="method">
              @for (m of procurementMethods; track m) {
                <mat-option [value]="m">{{ m }}</mat-option>
              }
            </mat-select>
            @if (form.controls.method.hasError('required')) {
              <mat-error>Method is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'procurement.fields.procurementPlanItemId' | translate }}</mat-label>
            <input matInput formControlName="procurementPlanItemId" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'procurement.fields.justification' | translate }}</mat-label>
          <textarea matInput formControlName="justification" rows="4"></textarea>
          @if (form.controls.justification.hasError('required')) {
            <mat-error>Justification is required</mat-error>
          }
        </mat-form-field>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'procurement.requests.create'">
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
    .full-width { width: 100%; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class RequestCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectProcurementLoading);

  readonly procurementMethods: ProcurementMethod[] = [
    'DirectPurchase', 'RequestForQuotation', 'OpenBidding', 'RestrictedBidding', 'SingleSource',
  ];

  readonly form = this.fb.nonNullable.group({
    referenceNumber: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    justification: ['', [Validators.required]],
    method: ['', [Validators.required]],
    procurementPlanItemId: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreatePurchaseRequestRequest = {
      referenceNumber: value.referenceNumber,
      projectId: value.projectId,
      justification: value.justification,
      method: value.method as ProcurementMethod,
      procurementPlanItemId: value.procurementPlanItemId || undefined,
    };
    this.store.dispatch(ProcurementActions.createPurchaseRequest({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/procurement/requests']);
  }
}
