import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { KnowledgeActions } from '../../store/knowledge.actions';
import { selectCategories, selectKnowledgeLoading } from '../../store/knowledge.selectors';
import { KbCategoryDto } from '../../models/category.model';

@Component({
  selector: 'ethel-category-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'knowledge.categories.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'knowledge.categories.create'" (click)="toggleCreateForm()">
        <mat-icon>{{ showCreateForm() ? 'close' : 'add' }}</mat-icon>
        {{ showCreateForm() ? ('common.cancel' | translate) : ('knowledge.categories.create' | translate) }}
      </button>
    </app-page-header>

    @if (showCreateForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="onCreateCategory()" class="edit-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'knowledge.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (createForm.controls.name.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'knowledge.fields.sortOrder' | translate }}</mat-label>
                <input matInput formControlName="sortOrder" type="number" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'knowledge.fields.parentCategory' | translate }}</mat-label>
                <mat-select formControlName="parentCategoryId">
                  <mat-option [value]="''">{{ 'common.none' | translate }}</mat-option>
                  @for (cat of categories(); track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'knowledge.fields.description' | translate }}</mat-label>
                <textarea matInput formControlName="description" rows="2"></textarea>
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="toggleCreateForm()">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.save' | translate }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    @if (loading() && categories().length === 0) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (categories().length === 0) {
      <app-empty-state
        icon="category"
        title="No categories found"
        message="Create your first knowledge base category to get started.">
      </app-empty-state>
    } @else {
      <div class="categories-list">
        @for (cat of rootCategories(); track cat.id) {
          <mat-card class="category-card">
            @if (editingId() === cat.id) {
              <mat-card-content>
                <form [formGroup]="editForm" (ngSubmit)="onUpdateCategory(cat.id)" class="edit-form">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'knowledge.fields.name' | translate }}</mat-label>
                      <input matInput formControlName="name" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'knowledge.fields.sortOrder' | translate }}</mat-label>
                      <input matInput formControlName="sortOrder" type="number" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'knowledge.fields.description' | translate }}</mat-label>
                      <textarea matInput formControlName="description" rows="2"></textarea>
                    </mat-form-field>
                  </div>
                  <div class="inline-form-actions">
                    <mat-slide-toggle formControlName="isActive">{{ 'knowledge.fields.isActive' | translate }}</mat-slide-toggle>
                    <span class="spacer"></span>
                    <button mat-button type="button" (click)="cancelEdit()">{{ 'common.cancel' | translate }}</button>
                    <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || loading()">
                      {{ 'common.save' | translate }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            } @else {
              <mat-card-header>
                <mat-card-title>
                  {{ cat.name }}
                  <mat-chip class="sort-chip">{{ cat.sortOrder }}</mat-chip>
                  @if (!cat.isActive) {
                    <mat-chip class="inactive-chip">Inactive</mat-chip>
                  }
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (cat.description) {
                  <p class="category-description">{{ cat.description }}</p>
                }
                <span class="child-count">{{ cat.childCount }} {{ 'knowledge.categories.children' | translate }}</span>
              </mat-card-content>
              <mat-card-actions align="end">
                <button mat-icon-button *appHasPermission="'knowledge.categories.update'" (click)="startEdit(cat)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" *appHasPermission="'knowledge.categories.delete'" (click)="onDeleteCategory(cat.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            }
          </mat-card>

          @for (child of getChildren(cat.id); track child.id) {
            <mat-card class="category-card child-card">
              @if (editingId() === child.id) {
                <mat-card-content>
                  <form [formGroup]="editForm" (ngSubmit)="onUpdateCategory(child.id)" class="edit-form">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'knowledge.fields.name' | translate }}</mat-label>
                        <input matInput formControlName="name" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'knowledge.fields.sortOrder' | translate }}</mat-label>
                        <input matInput formControlName="sortOrder" type="number" />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ 'knowledge.fields.description' | translate }}</mat-label>
                        <textarea matInput formControlName="description" rows="2"></textarea>
                      </mat-form-field>
                    </div>
                    <div class="inline-form-actions">
                      <mat-slide-toggle formControlName="isActive">{{ 'knowledge.fields.isActive' | translate }}</mat-slide-toggle>
                      <span class="spacer"></span>
                      <button mat-button type="button" (click)="cancelEdit()">{{ 'common.cancel' | translate }}</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || loading()">
                        {{ 'common.save' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              } @else {
                <mat-card-header>
                  <mat-card-title>
                    {{ child.name }}
                    <mat-chip class="sort-chip">{{ child.sortOrder }}</mat-chip>
                    @if (!child.isActive) {
                      <mat-chip class="inactive-chip">Inactive</mat-chip>
                    }
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (child.description) {
                    <p class="category-description">{{ child.description }}</p>
                  }
                  <span class="child-count">{{ child.childCount }} {{ 'knowledge.categories.children' | translate }}</span>
                </mat-card-content>
                <mat-card-actions align="end">
                  <button mat-icon-button *appHasPermission="'knowledge.categories.update'" (click)="startEdit(child)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" *appHasPermission="'knowledge.categories.delete'" (click)="onDeleteCategory(child.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-card-actions>
              }
            </mat-card>
          }
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .form-card { margin-bottom: 1.5rem; }
    .categories-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .category-card { }
    .child-card { margin-left: 2rem; }
    .category-description { margin: 0; color: var(--mat-sys-on-surface-variant); }
    .child-count { font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
    .sort-chip { --mdc-chip-elevated-container-color: #e3f2fd; margin-left: 0.5rem; font-size: 0.75rem; }
    .inactive-chip { --mdc-chip-elevated-container-color: #ffcdd2; margin-left: 0.5rem; font-size: 0.75rem; }
    .edit-form { margin-bottom: 0; }
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
    .inline-form-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .spacer { flex: 1; }
  `,
})
export default class CategoryListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly categories = this.store.selectSignal(selectCategories);
  readonly loading = this.store.selectSignal(selectKnowledgeLoading);

  readonly showCreateForm = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    parentCategoryId: [''],
    sortOrder: [0],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    sortOrder: [0],
    isActive: [true],
  });

  ngOnInit(): void {
    this.store.dispatch(KnowledgeActions.loadCategories());
  }

  rootCategories(): KbCategoryDto[] {
    return this.categories().filter((c) => !c.parentCategoryId).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getChildren(parentId: string): KbCategoryDto[] {
    return this.categories().filter((c) => c.parentCategoryId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
    if (this.showCreateForm()) {
      this.createForm.reset({ sortOrder: 0 });
    }
  }

  onCreateCategory(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    this.store.dispatch(
      KnowledgeActions.createCategory({
        request: {
          name: value.name,
          description: value.description || undefined,
          parentCategoryId: value.parentCategoryId || undefined,
          sortOrder: value.sortOrder,
        },
      })
    );
    this.showCreateForm.set(false);
  }

  startEdit(cat: KbCategoryDto): void {
    this.editingId.set(cat.id);
    this.editForm.patchValue({
      name: cat.name,
      description: cat.description ?? '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  onUpdateCategory(id: string): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    this.store.dispatch(
      KnowledgeActions.updateCategory({
        id,
        request: {
          id,
          name: value.name,
          description: value.description || undefined,
          sortOrder: value.sortOrder,
          isActive: value.isActive,
        },
      })
    );
    this.editingId.set(null);
  }

  onDeleteCategory(id: string): void {
    this.store.dispatch(KnowledgeActions.deleteCategory({ id }));
  }
}
