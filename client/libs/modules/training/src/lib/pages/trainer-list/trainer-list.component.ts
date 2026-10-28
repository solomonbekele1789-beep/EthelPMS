import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { TrainingActions } from '../../store/training.actions';
import { selectTrainers, selectTrainersTotalCount, selectTrainingLoading } from '../../store/training.selectors';
import { CreateTrainerRequest } from '../../models/trainer.model';

@Component({
  selector: 'ethel-trainer-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
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
    <app-page-header [title]="'training.trainers.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'training.trainers.create'" (click)="toggleCreateForm()">
        <mat-icon>{{ showCreateForm() ? 'close' : 'add' }}</mat-icon>
        {{ showCreateForm() ? ('common.cancel' | translate) : ('training.trainers.createButton' | translate) }}
      </button>
    </app-page-header>

    <div class="list-container">
      @if (showCreateForm()) {
        <div class="create-form-container">
          <form [formGroup]="createForm" (ngSubmit)="onCreateTrainer()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'training.fields.fullName' | translate }}</mat-label>
                <input matInput formControlName="fullName" />
                @if (createForm.controls.fullName.hasError('required')) {
                  <mat-error>Full name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'training.fields.email' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'training.fields.phone' | translate }}</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'training.fields.specialization' | translate }}</mat-label>
                <input matInput formControlName="specialization" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'training.fields.organization' | translate }}</mat-label>
                <input matInput formControlName="organization" />
              </mat-form-field>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="isInternal">
                  {{ 'training.fields.isInternal' | translate }}
                </mat-slide-toggle>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="toggleCreateForm()">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.create' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      }

      <app-data-table
        [columns]="columns()"
        [data]="trainers()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No trainers found"
        emptyMessage="Get started by creating your first trainer."
        (pageChange)="onPageChange($event)">
      </app-data-table>
    </div>

    <ng-template #internalTpl let-row>
      <mat-chip [highlighted]="row.isInternal" [class.internal-chip]="row.isInternal">
        {{ row.isInternal ? 'Internal' : 'External' }}
      </mat-chip>
    </ng-template>

    <ng-template #activeTpl let-row>
      <mat-chip [highlighted]="row.isActive" [class.active-chip]="row.isActive">
        {{ row.isActive ? 'Active' : 'Inactive' }}
      </mat-chip>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .create-form-container {
      padding: 1.5rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .toggle-field {
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .internal-chip { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .active-chip { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
  `,
})
export default class TrainerListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly trainers = this.store.selectSignal(selectTrainers);
  readonly totalCount = this.store.selectSignal(selectTrainersTotalCount);
  readonly loading = this.store.selectSignal(selectTrainingLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly showCreateForm = signal(false);

  readonly internalTpl = viewChild<TemplateRef<unknown>>('internalTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'organization', label: 'Organization' },
    { key: 'isInternal', label: 'Type', template: this.internalTpl() },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
  ]);

  readonly createForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    isInternal: [false],
    email: [''],
    phone: [''],
    specialization: [''],
    organization: [''],
  });

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.store.dispatch(
      TrainingActions.loadTrainers({
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
    if (this.showCreateForm()) {
      this.createForm.reset({ isInternal: false });
    }
  }

  onCreateTrainer(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateTrainerRequest = {
      fullName: value.fullName,
      isInternal: value.isInternal,
      email: value.email || undefined,
      phone: value.phone || undefined,
      specialization: value.specialization || undefined,
      organization: value.organization || undefined,
    };
    this.store.dispatch(TrainingActions.createTrainer({ request }));
    this.showCreateForm.set(false);
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadTrainers();
  }
}
