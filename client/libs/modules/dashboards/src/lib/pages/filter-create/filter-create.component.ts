import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { DashboardActions } from '../../store/dashboards.actions';
import { selectDashboardsLoading } from '../../store/dashboards.selectors';
import { CreateSavedFilterRequest } from '../../models/saved-filter.model';

@Component({
  selector: 'ethel-filter-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'dashboards.filters.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'dashboards.fields.filterName' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'dashboards.fields.module' | translate }}</mat-label>
            <mat-select formControlName="module">
              @for (mod of modules; track mod) {
                <mat-option [value]="mod">{{ mod }}</mat-option>
              }
            </mat-select>
            @if (form.controls.module.hasError('required')) {
              <mat-error>Module is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'dashboards.fields.filterJson' | translate }}</mat-label>
            <textarea matInput formControlName="filterJson" rows="6" placeholder='{"status": "Active", "dateRange": "last30days"}'></textarea>
          </mat-form-field>

          <div class="toggle-row">
            <mat-slide-toggle formControlName="isDefault">
              {{ 'dashboards.fields.isDefault' | translate }}
            </mat-slide-toggle>
          </div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
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
    .toggle-row {
      grid-column: 1 / -1;
      margin-bottom: 1rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class FilterCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectDashboardsLoading);

  readonly modules: string[] = [
    'Projects', 'Planning', 'Reporting', 'MEAL', 'Participants',
    'Procurement', 'FundAccounting', 'Assets', 'Training', 'Tasks',
    'Risk', 'Donors', 'Documents', 'Feedback', 'Dashboards',
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    module: ['' as string, [Validators.required]],
    filterJson: [''],
    isDefault: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateSavedFilterRequest = {
      name: value.name,
      module: value.module,
      filterJson: value.filterJson || undefined,
      isDefault: value.isDefault,
    };
    this.store.dispatch(DashboardActions.createFilter({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/dashboards/filters']);
  }
}
