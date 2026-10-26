import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { FeedbackActions } from '../../store/feedback.actions';
import { selectCategories, selectFeedbackLoading } from '../../store/feedback.selectors';
import {
  FeedbackCategoryDto,
  CreateFeedbackCategoryRequest,
  UpdateFeedbackCategoryRequest,
} from '../../models/feedback-category.model';
import { FeedbackType } from '../../models/feedback.model';
import { FeedbackCategoryService } from '../../services/feedback-category.service';

@Component({
  selector: 'ethel-category-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'feedback.categories.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'feedback.categories.create'"
              (click)="onToggleCreate()">
        <mat-icon>add</mat-icon>
        {{ 'feedback.categories.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <!-- Create Inline Form -->
      @if (showCreateForm()) {
        <div class="inline-form">
          <h4>{{ 'feedback.categories.create' | translate }}</h4>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (createForm.controls.name.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.defaultType' | translate }}</mat-label>
                <mat-select formControlName="defaultType">
                  @for (t of feedbackTypes; track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'feedback.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.slaResponseDays' | translate }}</mat-label>
                <input matInput formControlName="slaResponseDays" type="number" min="1" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.slaResolutionDays' | translate }}</mat-label>
                <input matInput formControlName="slaResolutionDays" type="number" min="1" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.sortOrder' | translate }}</mat-label>
                <input matInput formControlName="sortOrder" type="number" min="0" />
              </mat-form-field>

              <div class="checkbox-cell">
                <mat-checkbox formControlName="requiresEscalation">
                  {{ 'feedback.fields.requiresEscalation' | translate }}
                </mat-checkbox>
              </div>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showCreateForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="createForm.invalid || formSubmitting()">
                @if (formSubmitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.create' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Edit Inline Form -->
      @if (editingCategory()) {
        <div class="inline-form">
          <h4>{{ 'feedback.categories.edit' | translate }}: {{ editingCategory()!.name }}</h4>
          <form [formGroup]="editForm" (ngSubmit)="onEditSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (editForm.controls.name.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.defaultType' | translate }}</mat-label>
                <mat-select formControlName="defaultType">
                  @for (t of feedbackTypes; track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'feedback.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.slaResponseDays' | translate }}</mat-label>
                <input matInput formControlName="slaResponseDays" type="number" min="1" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.slaResolutionDays' | translate }}</mat-label>
                <input matInput formControlName="slaResolutionDays" type="number" min="1" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'feedback.fields.sortOrder' | translate }}</mat-label>
                <input matInput formControlName="sortOrder" type="number" min="0" />
              </mat-form-field>

              <div class="checkbox-cell">
                <mat-checkbox formControlName="requiresEscalation">
                  {{ 'feedback.fields.requiresEscalation' | translate }}
                </mat-checkbox>
              </div>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="onCancelEdit()">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="editForm.invalid || formSubmitting()">
                @if (formSubmitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.save' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      }

      <app-data-table
        [columns]="columns()"
        [data]="categories()"
        [loading]="loading()"
        emptyTitle="No categories found"
        emptyMessage="Create your first feedback category."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #defaultTypeTpl let-row>
      <mat-chip>{{ row.defaultType }}</mat-chip>
    </ng-template>

    <ng-template #escalationTpl let-row>
      <mat-chip [class.escalation-yes]="row.requiresEscalation"
                [class.escalation-no]="!row.requiresEscalation">
        {{ row.requiresEscalation ? 'Yes' : 'No' }}
      </mat-chip>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .inline-form {
      padding: 1.5rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .inline-form h4 { margin: 0 0 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .checkbox-cell { display: flex; align-items: center; margin-bottom: 1rem; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .escalation-yes { --mdc-chip-elevated-container-color: #ffe0b2; }
    .escalation-no { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class CategoryListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(FeedbackCategoryService);
  private readonly notification = inject(NotificationService);

  readonly categories = this.store.selectSignal(selectCategories);
  readonly loading = this.store.selectSignal(selectFeedbackLoading);

  readonly showCreateForm = signal(false);
  readonly editingCategory = signal<FeedbackCategoryDto | null>(null);
  readonly formSubmitting = signal(false);

  readonly feedbackTypes: FeedbackType[] = ['Complaint', 'Suggestion', 'Positive', 'Safeguarding', 'Query'];

  readonly defaultTypeTpl = viewChild<TemplateRef<unknown>>('defaultTypeTpl');
  readonly escalationTpl = viewChild<TemplateRef<unknown>>('escalationTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'defaultType', label: 'Default Type', template: this.defaultTypeTpl() },
    { key: 'slaResponseDays', label: 'SLA Response (days)' },
    { key: 'slaResolutionDays', label: 'SLA Resolution (days)' },
    { key: 'requiresEscalation', label: 'Requires Escalation', template: this.escalationTpl() },
    { key: 'sortOrder', label: 'Sort Order' },
  ]);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    defaultType: ['Complaint' as string, [Validators.required]],
    slaResponseDays: [3, [Validators.required, Validators.min(1)]],
    slaResolutionDays: [14, [Validators.required, Validators.min(1)]],
    requiresEscalation: [false],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    defaultType: ['Complaint' as string, [Validators.required]],
    slaResponseDays: [3, [Validators.required, Validators.min(1)]],
    slaResolutionDays: [14, [Validators.required, Validators.min(1)]],
    requiresEscalation: [false],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.store.dispatch(FeedbackActions.loadCategories());
  }

  onToggleCreate(): void {
    this.editingCategory.set(null);
    this.showCreateForm.set(!this.showCreateForm());
    this.createForm.reset({
      name: '',
      description: '',
      defaultType: 'Complaint',
      slaResponseDays: 3,
      slaResolutionDays: 14,
      requiresEscalation: false,
      sortOrder: 0,
    });
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) return;
    this.formSubmitting.set(true);
    const value = this.createForm.getRawValue();
    const request: CreateFeedbackCategoryRequest = {
      name: value.name,
      description: value.description || undefined,
      defaultType: value.defaultType as FeedbackType,
      slaResponseDays: value.slaResponseDays,
      slaResolutionDays: value.slaResolutionDays,
      requiresEscalation: value.requiresEscalation,
      sortOrder: value.sortOrder,
    };
    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.showCreateForm.set(false);
        this.createForm.reset();
        this.notification.success('Category created successfully');
        this.store.dispatch(FeedbackActions.loadCategories());
      },
      error: () => {
        this.formSubmitting.set(false);
        this.notification.error('Failed to create category');
      },
    });
  }

  onRowClick(row: FeedbackCategoryDto): void {
    this.showCreateForm.set(false);
    this.editingCategory.set(row);
    this.editForm.patchValue({
      name: row.name,
      description: row.description ?? '',
      defaultType: row.defaultType,
      slaResponseDays: row.slaResponseDays,
      slaResolutionDays: row.slaResolutionDays,
      requiresEscalation: row.requiresEscalation,
      sortOrder: row.sortOrder,
    });
  }

  onCancelEdit(): void {
    this.editingCategory.set(null);
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || !this.editingCategory()) return;
    this.formSubmitting.set(true);
    const value = this.editForm.getRawValue();
    const request: UpdateFeedbackCategoryRequest = {
      id: this.editingCategory()!.id,
      name: value.name,
      description: value.description || undefined,
      defaultType: value.defaultType as FeedbackType,
      slaResponseDays: value.slaResponseDays,
      slaResolutionDays: value.slaResolutionDays,
      requiresEscalation: value.requiresEscalation,
      sortOrder: value.sortOrder,
    };
    this.categoryService.updateCategory(this.editingCategory()!.id, request).subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.editingCategory.set(null);
        this.notification.success('Category updated successfully');
        this.store.dispatch(FeedbackActions.loadCategories());
      },
      error: () => {
        this.formSubmitting.set(false);
        this.notification.error('Failed to update category');
      },
    });
  }
}
