import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
import { AssetsActions } from '../../store/assets.actions';
import { selectAssetsLoading } from '../../store/assets.selectors';
import { CreateStockItemRequest } from '../../models/stock.model';

@Component({
  selector: 'ethel-stock-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    <app-page-header [title]="'assets.stock.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.itemCode' | translate }}</mat-label>
            <input matInput formControlName="itemCode" />
            @if (form.controls.itemCode.hasError('required')) {
              <mat-error>Item code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.category' | translate }}</mat-label>
            <input matInput formControlName="category" />
            @if (form.controls.category.hasError('required')) {
              <mat-error>Category is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.unit' | translate }}</mat-label>
            <input matInput formControlName="unit" />
            @if (form.controls.unit.hasError('required')) {
              <mat-error>Unit is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.reorderLevel' | translate }}</mat-label>
            <input matInput type="number" formControlName="reorderLevel" />
            @if (form.controls.reorderLevel.hasError('required')) {
              <mat-error>Reorder level is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.unitCost' | translate }}</mat-label>
            <input matInput type="number" formControlName="unitCost" />
            @if (form.controls.unitCost.hasError('required')) {
              <mat-error>Unit cost is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'assets.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'assets.fields.storageLocation' | translate }}</mat-label>
            <input matInput formControlName="storageLocation" />
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">{{ 'common.cancel' | translate }}</button>
          <button mat-flat-button color="primary" type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'assets.stock.create'">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'assets.actions.create' | translate }}
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
export default class StockCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly form = this.fb.nonNullable.group({
    itemCode: ['', [Validators.required]],
    name: ['', [Validators.required]],
    category: ['', [Validators.required]],
    unit: ['', [Validators.required]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    storageLocation: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateStockItemRequest = {
      itemCode: value.itemCode,
      name: value.name,
      category: value.category,
      unit: value.unit,
      reorderLevel: value.reorderLevel,
      unitCost: value.unitCost,
      description: value.description || undefined,
      storageLocation: value.storageLocation || undefined,
    };
    this.store.dispatch(AssetsActions.createStockItem({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/assets/stock']);
  }
}
