import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { RiskActions } from '../../store/risk.actions';
import { selectRiskLoading, selectCategories } from '../../store/risk.selectors';
import { CreateRiskRequest, Likelihood, Impact } from '../../models/risk.model';

@Component({
  selector: 'ethel-risk-create',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'risk.risks.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.projectId' | translate }}</mat-label>
            <input matInput formControlName="projectId" />
            @if (form.controls.projectId.hasError('required')) {
              <mat-error>Project ID is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.likelihood' | translate }}</mat-label>
            <mat-select formControlName="likelihood">
              @for (l of likelihoods; track l) {
                <mat-option [value]="l">{{ l }}</mat-option>
              }
            </mat-select>
            @if (form.controls.likelihood.hasError('required')) {
              <mat-error>Likelihood is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.impact' | translate }}</mat-label>
            <mat-select formControlName="impact">
              @for (i of impacts; track i) {
                <mat-option [value]="i">{{ i }}</mat-option>
              }
            </mat-select>
            @if (form.controls.impact.hasError('required')) {
              <mat-error>Impact is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.riskCategoryId' | translate }}</mat-label>
            <mat-select formControlName="riskCategoryId">
              <mat-option value="">{{ 'common.none' | translate }}</mat-option>
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.owner' | translate }}</mat-label>
            <input matInput formControlName="owner" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.ownerUserId' | translate }}</mat-label>
            <input matInput formControlName="ownerUserId" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'risk.fields.location' | translate }}</mat-label>
            <input matInput formControlName="location" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'risk.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
            @if (form.controls.description.hasError('required')) {
              <mat-error>Description is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'risk.fields.residualRiskNotes' | translate }}</mat-label>
            <textarea matInput formControlName="residualRiskNotes" rows="3"></textarea>
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class RiskCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectRiskLoading);
  readonly categories = this.store.selectSignal(selectCategories);

  readonly likelihoods: Likelihood[] = ['VeryLow', 'Low', 'Medium', 'High', 'VeryHigh'];
  readonly impacts: Impact[] = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

  readonly form = this.fb.nonNullable.group({
    projectId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    likelihood: ['' as string, [Validators.required]],
    impact: ['' as string, [Validators.required]],
    riskCategoryId: [''],
    owner: [''],
    ownerUserId: [''],
    location: [''],
    residualRiskNotes: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(RiskActions.loadCategories());
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateRiskRequest = {
      projectId: value.projectId,
      title: value.title,
      description: value.description,
      likelihood: value.likelihood as Likelihood,
      impact: value.impact as Impact,
      riskCategoryId: value.riskCategoryId || undefined,
      owner: value.owner || undefined,
      ownerUserId: value.ownerUserId || undefined,
      location: value.location || undefined,
      residualRiskNotes: value.residualRiskNotes || undefined,
    };
    this.store.dispatch(RiskActions.createRisk({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/risk']);
  }
}
