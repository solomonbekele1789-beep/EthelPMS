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
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectPartnershipsLoading } from '../../store/partnerships.selectors';
import { RegisterSubGranteeRequest, PartnerType } from '../../models/sub-grantee.model';

@Component({
  selector: 'ethel-partner-register',
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
    <app-page-header [title]="'partnerships.partners.register' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.partnerType' | translate }}</mat-label>
            <mat-select formControlName="partnerType">
              @for (type of partnerTypes; track type) {
                <mat-option [value]="type">{{ type }}</mat-option>
              }
            </mat-select>
            @if (form.controls.partnerType.hasError('required')) {
              <mat-error>Partner type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.contactPerson' | translate }}</mat-label>
            <input matInput formControlName="contactPerson" />
            @if (form.controls.contactPerson.hasError('required')) {
              <mat-error>Contact person is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.contactEmail' | translate }}</mat-label>
            <input matInput formControlName="contactEmail" type="email" />
            @if (form.controls.contactEmail.hasError('required')) {
              <mat-error>Email is required</mat-error>
            } @else if (form.controls.contactEmail.hasError('email')) {
              <mat-error>Invalid email address</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.contactPhone' | translate }}</mat-label>
            <input matInput formControlName="contactPhone" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.country' | translate }}</mat-label>
            <input matInput formControlName="country" />
            @if (form.controls.country.hasError('required')) {
              <mat-error>Country is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.registrationNumber' | translate }}</mat-label>
            <input matInput formControlName="registrationNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'partnerships.fields.address' | translate }}</mat-label>
            <input matInput formControlName="address" />
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
            *appHasPermission="'partnerships.subgrantees.create'">
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
export default class PartnerRegisterComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  readonly partnerTypes: PartnerType[] = ['LocalNGO', 'InternationalNGO', 'CommunityOrg', 'GovernmentBody', 'AcademicInstitution', 'PrivateSector'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    partnerType: ['', [Validators.required]],
    contactPerson: ['', [Validators.required]],
    contactEmail: ['', [Validators.required, Validators.email]],
    contactPhone: [''],
    country: ['', [Validators.required]],
    registrationNumber: [''],
    address: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: RegisterSubGranteeRequest = {
      name: value.name,
      contactPerson: value.contactPerson,
      contactEmail: value.contactEmail,
      contactPhone: value.contactPhone || undefined,
      country: value.country,
      partnerType: value.partnerType as PartnerType,
      registrationNumber: value.registrationNumber || undefined,
      address: value.address || undefined,
    };
    this.store.dispatch(PartnershipsActions.registerSubGrantee({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/partnerships/partners']);
  }
}
