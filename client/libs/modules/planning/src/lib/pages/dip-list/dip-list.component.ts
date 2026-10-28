import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DipService } from '../../services/dip.service';
import {
  DipItemDto,
  CreateDipItemRequest,
  UpdateDipItemRequest,
  CreateDipMilestoneRequest,
} from '../../models/dip.model';

@Component({
  selector: 'ethel-dip-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatListModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'planning.dip.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'planning.annual.create'" (click)="onAddItem()">
        <mat-icon>add</mat-icon>
        {{ 'planning.dip.addItem' | translate }}
      </button>
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (dipItems().length === 0 && !showItemForm()) {
      <app-empty-state
        icon="list_alt"
        title="No DIP items"
        message="Add detailed implementation plan items for this activity.">
      </app-empty-state>
    } @else {
      <mat-accordion class="dip-accordion">
        @for (item of dipItems(); track item.id) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <span class="sort-order">#{{ item.sortOrder }}</span>
                {{ item.title }}
              </mat-panel-title>
              <mat-panel-description>
                <app-status-badge [status]="item.status" [label]="item.status"></app-status-badge>
                <span class="item-budget">{{ item.budgetAllocated | currency:'USD':'symbol':'1.0-0' }}</span>
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="item-details">
              @if (item.description) {
                <p class="item-description">{{ item.description }}</p>
              }
              <div class="item-dates">
                <span>Start: {{ item.plannedStartDate | date:'mediumDate' }}</span>
                <span>End: {{ item.plannedEndDate | date:'mediumDate' }}</span>
              </div>

              <div class="milestones-section">
                <h4>{{ 'planning.dip.milestones' | translate }}</h4>
                @if (item.milestones && item.milestones.length > 0) {
                  <mat-chip-set>
                    @for (milestone of item.milestones; track milestone.id) {
                      <mat-chip>
                        {{ milestone.title }} ({{ milestone.dueDate | date:'shortDate' }})
                      </mat-chip>
                    }
                  </mat-chip-set>
                } @else {
                  <p class="no-milestones">No milestones yet.</p>
                }

                @if (addingMilestoneForId() === item.id) {
                  <form [formGroup]="milestoneForm" (ngSubmit)="onSubmitMilestone(item.id)" class="milestone-form">
                    <mat-form-field appearance="outline">
                      <mat-label>Title</mat-label>
                      <input matInput formControlName="title" />
                      @if (milestoneForm.controls.title.hasError('required')) {
                        <mat-error>Title is required</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Due Date</mat-label>
                      <input matInput [matDatepicker]="msPicker" formControlName="dueDate" />
                      <mat-datepicker-toggle matIconSuffix [for]="msPicker"></mat-datepicker-toggle>
                      <mat-datepicker #msPicker></mat-datepicker>
                      @if (milestoneForm.controls.dueDate.hasError('required')) {
                        <mat-error>Due date is required</mat-error>
                      }
                    </mat-form-field>
                    <div class="form-actions-inline">
                      <button mat-button type="button" (click)="onCancelMilestone()">
                        {{ 'common.cancel' | translate }}
                      </button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="milestoneForm.invalid">
                        {{ 'common.add' | translate }}
                      </button>
                    </div>
                  </form>
                } @else {
                  <button mat-stroked-button (click)="onAddMilestone(item.id)" class="add-milestone-btn">
                    <mat-icon>add</mat-icon>
                    {{ 'planning.dip.addMilestone' | translate }}
                  </button>
                }
              </div>

              <div class="item-actions">
                <button mat-stroked-button *appHasPermission="'planning.annual.update'" (click)="onEditItem(item)">
                  <mat-icon>edit</mat-icon>
                  {{ 'common.edit' | translate }}
                </button>
              </div>
            </div>
          </mat-expansion-panel>
        }
      </mat-accordion>
    }

    @if (showItemForm()) {
      <div class="inline-form">
        <h3>{{ editingItemId() ? ('common.edit' | translate) : ('common.add' | translate) }} DIP Item</h3>
        <form [formGroup]="itemForm" (ngSubmit)="onSubmitItem()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'planning.dip.fields.title' | translate }}</mat-label>
              <input matInput formControlName="title" />
              @if (itemForm.controls.title.hasError('required')) {
                <mat-error>Title is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'planning.dip.fields.sortOrder' | translate }}</mat-label>
              <input matInput formControlName="sortOrder" type="number" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'planning.dip.fields.description' | translate }}</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'planning.dip.fields.plannedStartDate' | translate }}</mat-label>
              <input matInput [matDatepicker]="dipStartPicker" formControlName="plannedStartDate" />
              <mat-datepicker-toggle matIconSuffix [for]="dipStartPicker"></mat-datepicker-toggle>
              <mat-datepicker #dipStartPicker></mat-datepicker>
              @if (itemForm.controls.plannedStartDate.hasError('required')) {
                <mat-error>Start date is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'planning.dip.fields.plannedEndDate' | translate }}</mat-label>
              <input matInput [matDatepicker]="dipEndPicker" formControlName="plannedEndDate" />
              <mat-datepicker-toggle matIconSuffix [for]="dipEndPicker"></mat-datepicker-toggle>
              <mat-datepicker #dipEndPicker></mat-datepicker>
              @if (itemForm.controls.plannedEndDate.hasError('required')) {
                <mat-error>End date is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'planning.dip.fields.budget' | translate }}</mat-label>
              <input matInput formControlName="budgetAllocated" type="number" />
              @if (itemForm.controls.budgetAllocated.hasError('min')) {
                <mat-error>Budget must be zero or greater</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="onCancelItem()">
              {{ 'common.cancel' | translate }}
            </button>
            <button mat-flat-button color="primary" type="submit" [disabled]="itemForm.invalid">
              {{ editingItemId() ? ('common.save' | translate) : ('common.create' | translate) }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
    .dip-accordion {
      margin-top: 1rem;
    }
    .sort-order {
      font-weight: 600;
      color: var(--primary-color, #1565c0);
      margin-right: 0.5rem;
    }
    .item-budget {
      margin-left: auto;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }
    .item-details {
      padding: 0.5rem 0;
    }
    .item-description {
      color: var(--text-secondary, #666);
      margin: 0 0 1rem;
    }
    .item-dates {
      display: flex;
      gap: 2rem;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .milestones-section {
      margin: 1rem 0;
    }
    .milestones-section h4 {
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .no-milestones {
      font-size: 0.8125rem;
      color: var(--text-secondary, #666);
      margin: 0.25rem 0;
    }
    .milestone-form {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    .form-actions-inline {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      padding-top: 0.5rem;
    }
    .add-milestone-btn {
      margin-top: 0.5rem;
    }
    .item-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-color, #e0e0e0);
    }
    .inline-form {
      margin-top: 2rem;
      padding: 1.5rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      max-width: 800px;
    }
    .inline-form h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 500; }
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
      margin-top: 0.5rem;
    }
  `,
})
export default class DipListComponent implements OnInit {
  private readonly dipService = inject(DipService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly activityId = input.required<string>();

  readonly dipItems = signal<DipItemDto[]>([]);
  readonly loading = signal(false);
  readonly showItemForm = signal(false);
  readonly editingItemId = signal<string | null>(null);
  readonly addingMilestoneForId = signal<string | null>(null);

  readonly itemForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    plannedStartDate: ['', [Validators.required]],
    plannedEndDate: ['', [Validators.required]],
    budgetAllocated: [0, [Validators.min(0)]],
    sortOrder: [0],
  });

  readonly milestoneForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    dueDate: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.dipService.listDipItems(this.activityId()).subscribe({
      next: (items) => {
        this.dipItems.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onAddItem(): void {
    this.editingItemId.set(null);
    this.itemForm.reset({ title: '', description: '', plannedStartDate: '', plannedEndDate: '', budgetAllocated: 0, sortOrder: 0 });
    this.showItemForm.set(true);
  }

  onEditItem(item: DipItemDto): void {
    this.editingItemId.set(item.id);
    this.itemForm.patchValue({
      title: item.title,
      description: item.description ?? '',
      plannedStartDate: item.plannedStartDate,
      plannedEndDate: item.plannedEndDate,
      budgetAllocated: item.budgetAllocated,
      sortOrder: item.sortOrder,
    });
    this.showItemForm.set(true);
  }

  onCancelItem(): void {
    this.showItemForm.set(false);
    this.editingItemId.set(null);
    this.itemForm.reset();
  }

  onSubmitItem(): void {
    if (this.itemForm.invalid) return;
    const value = this.itemForm.getRawValue();

    if (this.editingItemId()) {
      const request: UpdateDipItemRequest = {
        dipItemId: this.editingItemId()!,
        title: value.title,
        description: value.description || undefined,
        plannedStartDate: value.plannedStartDate,
        plannedEndDate: value.plannedEndDate,
        budgetAllocated: value.budgetAllocated,
        sortOrder: value.sortOrder,
      };
      this.dipService.updateDipItem(this.activityId(), this.editingItemId()!, request).subscribe(() => {
        this.onCancelItem();
        this.loadItems();
      });
    } else {
      const request: CreateDipItemRequest = {
        activityId: this.activityId(),
        projectId: '',
        title: value.title,
        description: value.description || undefined,
        plannedStartDate: value.plannedStartDate,
        plannedEndDate: value.plannedEndDate,
        budgetAllocated: value.budgetAllocated,
        sortOrder: value.sortOrder,
      };
      this.dipService.createDipItem(this.activityId(), request).subscribe(() => {
        this.onCancelItem();
        this.loadItems();
      });
    }
  }

  onAddMilestone(dipItemId: string): void {
    this.addingMilestoneForId.set(dipItemId);
    this.milestoneForm.reset({ title: '', dueDate: '' });
  }

  onCancelMilestone(): void {
    this.addingMilestoneForId.set(null);
    this.milestoneForm.reset();
  }

  onSubmitMilestone(dipItemId: string): void {
    if (this.milestoneForm.invalid) return;
    const value = this.milestoneForm.getRawValue();
    const request: CreateDipMilestoneRequest = {
      dipItemId,
      title: value.title,
      dueDate: value.dueDate,
    };
    this.dipService.addMilestone(this.activityId(), dipItemId, request).subscribe(() => {
      this.onCancelMilestone();
      this.loadItems();
    });
  }

  goBack(): void {
    this.router.navigate(['/planning']);
  }
}
