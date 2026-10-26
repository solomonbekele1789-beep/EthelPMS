import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DonorsActions } from '../../store/donors.actions';
import { selectDonorsLoading } from '../../store/donors.selectors';
import { CreateDonorRequest } from '../../models/donor.model';

@Component({
  selector: 'ethel-donor-create',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'donors.donors.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.acronym' | translate }}</mat-label>
            <input matInput formControlName="acronym" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.country' | translate }}</mat-label>
            <input matInput formControlName="country" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.website' | translate }}</mat-label>
            <input matInput formControlName="website" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.email' | translate }}</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.phone' | translate }}</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'donors.fields.address' | translate }}</mat-label>
            <textarea matInput formControlName="address" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'donors.fields.notes' | translate }}</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
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
            *appHasPermission="'donors.donors.create'">
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
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class DonorCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly actions$ = inject(Actions);

  readonly loading = this.store.selectSignal(selectDonorsLoading);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    acronym: [''],
    country: [''],
    website: [''],
    email: [''],
    phone: [''],
    address: [''],
    notes: [''],
  });

  constructor() {
    this.actions$.pipe(
      ofType(DonorsActions.createDonorSuccess),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.router.navigate(['/donors']);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateDonorRequest = {
      name: value.name,
      acronym: value.acronym || undefined,
      country: value.country || undefined,
      website: value.website || undefined,
      email: value.email || undefined,
      phone: value.phone || undefined,
      address: value.address || undefined,
      notes: value.notes || undefined,
    };
    this.store.dispatch(DonorsActions.createDonor({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/donors']);
  }
}
