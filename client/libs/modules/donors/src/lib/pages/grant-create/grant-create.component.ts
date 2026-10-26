import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DonorsActions } from '../../store/donors.actions';
import { selectDonorsLoading } from '../../store/donors.selectors';
import { CreateGrantRequest, GrantStatus } from '../../models/grant.model';

@Component({
  selector: 'ethel-grant-create',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'donors.grants.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.donorId' | translate }}</mat-label>
            <input matInput formControlName="donorId" />
            @if (form.controls.donorId.hasError('required')) {
              <mat-error>Donor is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.grantNumber' | translate }}</mat-label>
            <input matInput formControlName="grantNumber" />
            @if (form.controls.grantNumber.hasError('required')) {
              <mat-error>Grant number is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.status' | translate }}</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
            @if (form.controls.status.hasError('required')) {
              <mat-error>Status is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.totalAmount' | translate }}</mat-label>
            <input matInput formControlName="totalAmount" type="number" />
            @if (form.controls.totalAmount.hasError('required')) {
              <mat-error>Amount is required</mat-error>
            } @else if (form.controls.totalAmount.hasError('min')) {
              <mat-error>Amount must be greater than 0</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.currencyCode' | translate }}</mat-label>
            <input matInput formControlName="currencyCode" />
            @if (form.controls.currencyCode.hasError('required')) {
              <mat-error>Currency is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.startDate' | translate }}</mat-label>
            <input matInput formControlName="startDate" type="date" />
            @if (form.controls.startDate.hasError('required')) {
              <mat-error>Start date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.endDate' | translate }}</mat-label>
            <input matInput formControlName="endDate" type="date" />
            @if (form.controls.endDate.hasError('required')) {
              <mat-error>End date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'donors.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'donors.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
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
            *appHasPermission="'donors.grants.create'">
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
export default class GrantCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly actions$ = inject(Actions);

  readonly loading = this.store.selectSignal(selectDonorsLoading);

  readonly statuses: GrantStatus[] = ['Draft', 'Active', 'Suspended', 'Completed', 'Terminated'];

  readonly form = this.fb.nonNullable.group({
    donorId: ['', [Validators.required]],
    grantNumber: ['', [Validators.required]],
    title: ['', [Validators.required]],
    status: ['Draft' as string, [Validators.required]],
    totalAmount: [0, [Validators.required, Validators.min(0.01)]],
    currencyCode: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    description: [''],
    projectId: [''],
  });

  constructor() {
    this.actions$.pipe(
      ofType(DonorsActions.createGrantSuccess),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.router.navigate(['/donors/grants']);
    });
  }

  ngOnInit(): void {
    const donorId = this.route.snapshot.queryParamMap.get('donorId');
    if (donorId) {
      this.form.controls.donorId.setValue(donorId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateGrantRequest = {
      donorId: value.donorId,
      grantNumber: value.grantNumber,
      title: value.title,
      status: value.status as GrantStatus,
      totalAmount: value.totalAmount,
      currencyCode: value.currencyCode,
      startDate: value.startDate,
      endDate: value.endDate,
      description: value.description || undefined,
      projectId: value.projectId || undefined,
    };
    this.store.dispatch(DonorsActions.createGrant({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/donors/grants']);
  }
}
