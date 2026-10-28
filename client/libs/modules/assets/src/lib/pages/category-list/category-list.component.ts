import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import {
  selectCategories,
  selectAssetsLoading,
} from '../../store/assets.selectors';
import { AssetCategoryService } from '../../services/asset-category.service';
import {
  DepreciationMethod,
  AssetCategoryDto,
  CreateAssetCategoryRequest,
  UpdateAssetCategoryRequest,
} from '../../models/asset-category.model';

@Component({
  selector: 'ethel-category-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'assets.categories.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'assets.categories.create'" (click)="showCreateForm.set(!showCreateForm())">
        <mat-icon>add</mat-icon>
        {{ 'assets.categories.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <app-search-input placeholder="Search categories..." (search)="onSearch($event)"></app-search-input>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="categories()"
        [loading]="loading()"
        emptyTitle="No categories found"
        emptyMessage="Get started by creating your first asset category."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #methodTpl let-row>
      <mat-chip>{{ row.defaultDepreciationMethod === 'StraightLine' ? ('assets.types.straightLine' | translate) : ('assets.types.reducingBalance' | translate) }}</mat-chip>
    </ng-template>

    <ng-template #lifeTpl let-row>
      {{ row.defaultUsefulLifeYears }} {{ 'assets.fields.usefulLifeYears' | translate }}
    </ng-template>

    <ng-template #residualTpl let-row>
      {{ row.defaultResidualValuePercent | number:'1.1-2' }}%
    </ng-template>

    <ng-template #activeTpl let-row>
      <mat-chip [highlighted]="row.isActive" [class.active-chip]="row.isActive" [class.inactive-chip]="!row.isActive">
        {{ row.isActive ? ('common.active' | translate) : ('common.inactive' | translate) }}
      </mat-chip>
    </ng-template>

    <!-- Create Category Form -->
    @if (showCreateForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'assets.categories.create' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.code' | translate }}</mat-label>
                <input matInput formControlName="code" />
                @if (createForm.controls.code.hasError('required')) {
                  <mat-error>Code is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (createForm.controls.name.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.defaultDepreciationMethod' | translate }}</mat-label>
                <mat-select formControlName="defaultDepreciationMethod">
                  @for (method of depreciationMethods; track method) {
                    <mat-option [value]="method">{{ method === 'StraightLine' ? ('assets.types.straightLine' | translate) : ('assets.types.reducingBalance' | translate) }}</mat-option>
                  }
                </mat-select>
                @if (createForm.controls.defaultDepreciationMethod.hasError('required')) {
                  <mat-error>Depreciation method is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.defaultUsefulLifeYears' | translate }}</mat-label>
                <input matInput type="number" formControlName="defaultUsefulLifeYears" />
                @if (createForm.controls.defaultUsefulLifeYears.hasError('required')) {
                  <mat-error>Useful life is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.defaultResidualValuePercent' | translate }}</mat-label>
                <input matInput type="number" formControlName="defaultResidualValuePercent" />
                @if (createForm.controls.defaultResidualValuePercent.hasError('required')) {
                  <mat-error>Residual value % is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'assets.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showCreateForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid">
                {{ 'common.create' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <!-- Edit Category Form -->
    @if (showEditForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'assets.categories.edit' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="editForm" (ngSubmit)="onEditSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (editForm.controls.name.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.defaultDepreciationMethod' | translate }}</mat-label>
                <mat-select formControlName="defaultDepreciationMethod">
                  @for (method of depreciationMethods; track method) {
                    <mat-option [value]="method">{{ method === 'StraightLine' ? ('assets.types.straightLine' | translate) : ('assets.types.reducingBalance' | translate) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.defaultUsefulLifeYears' | translate }}</mat-label>
                <input matInput type="number" formControlName="defaultUsefulLifeYears" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.defaultResidualValuePercent' | translate }}</mat-label>
                <input matInput type="number" formControlName="defaultResidualValuePercent" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'assets.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showEditForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid">
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; }
    .inline-form-card { margin-top: 1.5rem; }
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
    .active-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
    .inactive-chip { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class CategoryListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(AssetCategoryService);
  private readonly notification = inject(NotificationService);

  readonly categories = this.store.selectSignal(selectCategories);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly search = signal('');
  readonly showCreateForm = signal(false);
  readonly showEditForm = signal(false);
  readonly editingCategoryId = signal<string | null>(null);

  readonly depreciationMethods: DepreciationMethod[] = ['StraightLine', 'ReducingBalance'];

  readonly methodTpl = viewChild<TemplateRef<unknown>>('methodTpl');
  readonly lifeTpl = viewChild<TemplateRef<unknown>>('lifeTpl');
  readonly residualTpl = viewChild<TemplateRef<unknown>>('residualTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'defaultDepreciationMethod', label: 'Depreciation Method', template: this.methodTpl() },
    { key: 'defaultUsefulLifeYears', label: 'Useful Life (Years)', template: this.lifeTpl() },
    { key: 'defaultResidualValuePercent', label: 'Residual Value %', template: this.residualTpl() },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
  ]);

  readonly createForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    defaultDepreciationMethod: ['' as DepreciationMethod | '', [Validators.required]],
    defaultUsefulLifeYears: [0, [Validators.required, Validators.min(1)]],
    defaultResidualValuePercent: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    defaultDepreciationMethod: ['' as DepreciationMethod | '', [Validators.required]],
    defaultUsefulLifeYears: [0, [Validators.required, Validators.min(1)]],
    defaultResidualValuePercent: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.store.dispatch(
      AssetsActions.loadCategories({
        search: this.search() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.loadCategories();
  }

  onRowClick(row: AssetCategoryDto): void {
    this.editingCategoryId.set(row.id);
    this.editForm.patchValue({
      name: row.name,
      defaultDepreciationMethod: row.defaultDepreciationMethod,
      defaultUsefulLifeYears: row.defaultUsefulLifeYears,
      defaultResidualValuePercent: row.defaultResidualValuePercent,
      description: row.description ?? '',
    });
    this.showEditForm.set(true);
    this.showCreateForm.set(false);
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateAssetCategoryRequest = {
      code: value.code,
      name: value.name,
      defaultDepreciationMethod: value.defaultDepreciationMethod as DepreciationMethod,
      defaultUsefulLifeYears: value.defaultUsefulLifeYears,
      defaultResidualValuePercent: value.defaultResidualValuePercent,
      description: value.description || undefined,
    };
    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.notification.success('assets.messages.categoryCreated');
        this.showCreateForm.set(false);
        this.createForm.reset();
        this.loadCategories();
      },
      error: () => this.notification.error('Failed to create category'),
    });
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || !this.editingCategoryId()) return;
    const value = this.editForm.getRawValue();
    const request: UpdateAssetCategoryRequest = {
      id: this.editingCategoryId()!,
      name: value.name,
      defaultDepreciationMethod: value.defaultDepreciationMethod as DepreciationMethod,
      defaultUsefulLifeYears: value.defaultUsefulLifeYears,
      defaultResidualValuePercent: value.defaultResidualValuePercent,
      description: value.description || undefined,
    };
    this.categoryService.updateCategory(this.editingCategoryId()!, request).subscribe({
      next: () => {
        this.notification.success('assets.messages.categoryUpdated');
        this.showEditForm.set(false);
        this.editingCategoryId.set(null);
        this.loadCategories();
      },
      error: () => this.notification.error('Failed to update category'),
    });
  }
}
