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
import { CreateDashboardRequest, DashboardType } from '../../models/dashboard.model';

@Component({
  selector: 'ethel-dashboard-create',
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
    <app-page-header [title]="'dashboards.dashboards.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'dashboards.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'dashboards.fields.dashboardType' | translate }}</mat-label>
            <mat-select formControlName="dashboardType">
              @for (type of dashboardTypes; track type) {
                <mat-option [value]="type">{{ type }}</mat-option>
              }
            </mat-select>
            @if (form.controls.dashboardType.hasError('required')) {
              <mat-error>Dashboard type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'dashboards.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <div class="toggle-row">
            <mat-slide-toggle formControlName="isShared">
              {{ 'dashboards.fields.isShared' | translate }}
            </mat-slide-toggle>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'dashboards.fields.layoutJson' | translate }}</mat-label>
            <textarea matInput formControlName="layoutJson" rows="4" placeholder='{"columns": 3, "rows": 4}'></textarea>
          </mat-form-field>
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
export default class DashboardCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectDashboardsLoading);

  readonly dashboardTypes: DashboardType[] = [
    'Executive', 'ProjectPortfolio', 'Finance', 'MEAL',
    'Participant', 'Risk', 'Procurement', 'Performance', 'Custom',
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    dashboardType: ['' as string, [Validators.required]],
    description: [''],
    isShared: [false],
    layoutJson: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateDashboardRequest = {
      name: value.name,
      dashboardType: value.dashboardType as DashboardType,
      description: value.description || undefined,
      isShared: value.isShared,
      layoutJson: value.layoutJson || undefined,
    };
    this.store.dispatch(DashboardActions.createDashboard({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/dashboards']);
  }
}
