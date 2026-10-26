import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { RiskActions } from '../../store/risk.actions';
import { selectCategories, selectRiskLoading } from '../../store/risk.selectors';
import { RiskCategoryService } from '../../services/risk-category.service';
import { CreateRiskCategoryRequest } from '../../models/risk-category.model';

@Component({
  selector: 'ethel-category-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'risk.categories.title' | translate"></app-page-header>

    <div class="list-container">
      <!-- Data Table -->
      <app-data-table
        [columns]="columns()"
        [data]="categories()"
        [loading]="loading()"
        [totalCount]="categories().length"
        [page]="1"
        [pageSize]="100"
        emptyTitle="No categories found"
        emptyMessage="Get started by creating your first risk category.">
      </app-data-table>

      <ng-template #colorTpl let-row>
        @if (row.color) {
          <div class="color-swatch" [style.background-color]="row.color"></div>
        } @else {
          <span class="text-muted">--</span>
        }
      </ng-template>

      <ng-template #dateTpl let-row>
        {{ row.createdAt | date:'mediumDate' }}
      </ng-template>

      <!-- Inline Create Form -->
      <div class="create-section" *appHasPermission="'risk.categories.create'">
        <h3>{{ 'risk.categories.create' | translate }}</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="create-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.description' | translate }}</mat-label>
            <input matInput formControlName="description" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.color' | translate }}</mat-label>
            <input matInput formControlName="color" placeholder="#3f51b5" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.sortOrder' | translate }}</mat-label>
            <input matInput formControlName="sortOrder" type="number" />
          </mat-form-field>

          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            @if (saving()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | translate }}
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--mat-sys-outline-variant);
    }
    .text-muted { color: var(--mat-sys-outline); }
    .create-section {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: var(--mat-sys-surface-container-low);
      border-radius: 8px;
    }
    .create-form {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
  `,
})
export default class CategoryListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(RiskCategoryService);
  private readonly notification = inject(NotificationService);

  readonly categories = this.store.selectSignal(selectCategories);
  readonly loading = this.store.selectSignal(selectRiskLoading);

  readonly saving = signal(false);

  readonly colorTpl = viewChild<TemplateRef<unknown>>('colorTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'color', label: 'Color', template: this.colorTpl() },
    { key: 'sortOrder', label: 'Sort Order' },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
  ]);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    color: [''],
    sortOrder: [0],
  });

  ngOnInit(): void {
    this.store.dispatch(RiskActions.loadCategories());
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateRiskCategoryRequest = {
      name: value.name,
      description: value.description || undefined,
      color: value.color || undefined,
      sortOrder: value.sortOrder || undefined,
    };
    this.saving.set(true);
    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.notification.success('risk.messages.categoryCreated');
        this.saving.set(false);
        this.form.reset({ name: '', description: '', color: '', sortOrder: 0 });
        this.store.dispatch(RiskActions.loadCategories());
      },
      error: () => {
        this.notification.error('Failed to create category');
        this.saving.set(false);
      },
    });
  }
}
