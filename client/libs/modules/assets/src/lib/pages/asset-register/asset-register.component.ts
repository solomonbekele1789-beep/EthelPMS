import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import {
  selectCategories,
  selectAssetsLoading,
} from '../../store/assets.selectors';
import { RegisterAssetRequest } from '../../models/asset.model';
import { DepreciationMethod } from '../../models/asset-category.model';

@Component({
  selector: 'ethel-asset-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'assets.register.title' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.category' | translate }}</mat-label>
            <mat-select formControlName="assetCategoryId">
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
            @if (form.controls.assetCategoryId.hasError('required')) {
              <mat-error>Category is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.location' | translate }}</mat-label>
            <input matInput formControlName="location" />
            @if (form.controls.location.hasError('required')) {
              <mat-error>Location is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.purchaseDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="purchaseDatePicker" formControlName="purchaseDate" />
            <mat-datepicker-toggle matIconSuffix [for]="purchaseDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #purchaseDatePicker></mat-datepicker>
            @if (form.controls.purchaseDate.hasError('required')) {
              <mat-error>Purchase date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.purchaseCost' | translate }}</mat-label>
            <input matInput type="number" formControlName="purchaseCost" />
            @if (form.controls.purchaseCost.hasError('required')) {
              <mat-error>Purchase cost is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.depreciationMethod' | translate }}</mat-label>
            <mat-select formControlName="depreciationMethod">
              @for (method of depreciationMethods; track method) {
                <mat-option [value]="method">{{ method === 'StraightLine' ? ('assets.types.straightLine' | translate) : ('assets.types.reducingBalance' | translate) }}</mat-option>
              }
            </mat-select>
            @if (form.controls.depreciationMethod.hasError('required')) {
              <mat-error>Depreciation method is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.usefulLifeYears' | translate }}</mat-label>
            <input matInput type="number" formControlName="usefulLifeYears" />
            @if (form.controls.usefulLifeYears.hasError('required')) {
              <mat-error>Useful life is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.residualValue' | translate }}</mat-label>
            <input matInput type="number" formControlName="residualValue" />
            @if (form.controls.residualValue.hasError('required')) {
              <mat-error>Residual value is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.serialNumber' | translate }}</mat-label>
            <input matInput formControlName="serialNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.modelNumber' | translate }}</mat-label>
            <input matInput formControlName="modelNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.donorGrantId' | translate }}</mat-label>
            <input matInput formControlName="donorGrantId" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'assets.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">{{ 'common.cancel' | translate }}</button>
          <button mat-flat-button color="primary" type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'assets.register.create'">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'assets.actions.register' | translate }}
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
export default class AssetRegisterComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly categories = this.store.selectSignal(selectCategories);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly depreciationMethods: DepreciationMethod[] = ['StraightLine', 'ReducingBalance'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    assetCategoryId: ['', [Validators.required]],
    location: ['', [Validators.required]],
    purchaseDate: ['', [Validators.required]],
    purchaseCost: [0, [Validators.required, Validators.min(0)]],
    depreciationMethod: ['' as string, [Validators.required]],
    usefulLifeYears: [0, [Validators.required, Validators.min(1)]],
    residualValue: [0, [Validators.required, Validators.min(0)]],
    serialNumber: [''],
    modelNumber: [''],
    donorGrantId: [''],
    projectId: [''],
    description: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(AssetsActions.loadCategories({}));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: RegisterAssetRequest = {
      name: value.name,
      assetCategoryId: value.assetCategoryId,
      location: value.location,
      purchaseDate: typeof value.purchaseDate === 'string' ? value.purchaseDate : new Date(value.purchaseDate).toISOString(),
      purchaseCost: value.purchaseCost,
      depreciationMethod: value.depreciationMethod,
      usefulLifeYears: value.usefulLifeYears,
      residualValue: value.residualValue,
      serialNumber: value.serialNumber || undefined,
      modelNumber: value.modelNumber || undefined,
      donorGrantId: value.donorGrantId || undefined,
      projectId: value.projectId || undefined,
      description: value.description || undefined,
    };
    this.store.dispatch(AssetsActions.registerAsset({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/assets']);
  }
}
