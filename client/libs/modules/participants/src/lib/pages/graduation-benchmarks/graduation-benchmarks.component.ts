import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ParticipantsActions } from '../../store/participants.actions';
import { selectBenchmarks, selectParticipantsLoading } from '../../store/participants.selectors';
import { GraduationBenchmarkService } from '../../services/graduation-benchmark.service';
import {
  GraduationBenchmarkDto,
  CreateBenchmarkRequest,
  UpdateBenchmarkRequest,
} from '../../models/graduation.model';

@Component({
  selector: 'ethel-graduation-benchmarks',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatCardModule,
    MatChipsModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'participants.graduation.benchmarks' | translate">
      <button mat-button (click)="onBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'participants.title' | translate }}
      </button>
    </app-page-header>

    <div class="page-container">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>{{ 'participants.fields.projectId' | translate }}</mat-label>
        <input matInput [value]="projectIdFilter()" (input)="onProjectIdFilter($event)" />
      </mat-form-field>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (benchmarks().length > 0) {
        <table mat-table [dataSource]="benchmarks()" class="full-width-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'participants.graduation.fields.name' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>
          <ng-container matColumnDef="domain">
            <th mat-header-cell *matHeaderCellDef>{{ 'participants.graduation.fields.domain' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.domain }}</td>
          </ng-container>
          <ng-container matColumnDef="thresholdP2">
            <th mat-header-cell *matHeaderCellDef>P2</th>
            <td mat-cell *matCellDef="let row">{{ row.thresholdP2 }}</td>
          </ng-container>
          <ng-container matColumnDef="thresholdP3">
            <th mat-header-cell *matHeaderCellDef>P3</th>
            <td mat-cell *matCellDef="let row">{{ row.thresholdP3 }}</td>
          </ng-container>
          <ng-container matColumnDef="thresholdP4">
            <th mat-header-cell *matHeaderCellDef>P4</th>
            <td mat-cell *matCellDef="let row">{{ row.thresholdP4 }}</td>
          </ng-container>
          <ng-container matColumnDef="weight">
            <th mat-header-cell *matHeaderCellDef>{{ 'participants.graduation.fields.weight' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.weight }}</td>
          </ng-container>
          <ng-container matColumnDef="requiredForGraduation">
            <th mat-header-cell *matHeaderCellDef>{{ 'participants.graduation.fields.required' | translate }}</th>
            <td mat-cell *matCellDef="let row">
              <mat-icon>{{ row.requiredForGraduation ? 'check_circle' : 'cancel' }}</mat-icon>
            </td>
          </ng-container>
          <ng-container matColumnDef="isActive">
            <th mat-header-cell *matHeaderCellDef>{{ 'common.active' | translate }}</th>
            <td mat-cell *matCellDef="let row">
              <mat-icon>{{ row.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button *appHasPermission="'graduation.tracking.manage'" (click)="onEditBenchmark(row)">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="benchmarkColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: benchmarkColumns;"></tr>
        </table>
      } @else {
        <app-empty-state icon="tune" title="No benchmarks" message="Create graduation benchmarks to track participant progress."></app-empty-state>
      }

      <div class="add-section" *appHasPermission="'graduation.tracking.manage'">
        <button mat-flat-button color="primary" (click)="showCreateForm.set(!showCreateForm())">
          <mat-icon>add</mat-icon>
          {{ 'participants.graduation.addBenchmark' | translate }}
        </button>
      </div>

      <!-- Create Benchmark Form -->
      @if (showCreateForm()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'participants.graduation.addBenchmark' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="createForm" (ngSubmit)="onCreateBenchmark()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.graduation.fields.name' | translate }}</mat-label>
                  <input matInput formControlName="name" />
                  @if (createForm.controls.name.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.graduation.fields.domain' | translate }}</mat-label>
                  <input matInput formControlName="domain" />
                  @if (createForm.controls.domain.hasError('required')) {
                    <mat-error>Domain is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.fields.projectId' | translate }}</mat-label>
                  <input matInput formControlName="projectId" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'participants.fields.description' | translate }}</mat-label>
                  <textarea matInput formControlName="description" rows="2"></textarea>
                </mat-form-field>
                <mat-checkbox formControlName="requiredForGraduation">
                  {{ 'participants.graduation.fields.required' | translate }}
                </mat-checkbox>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="showCreateForm.set(false)">{{ 'common.cancel' | translate }}</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid">{{ 'common.create' | translate }}</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- Edit Benchmark Form -->
      @if (editingBenchmark()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'participants.graduation.editBenchmark' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="editForm" (ngSubmit)="onUpdateBenchmark()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.graduation.fields.name' | translate }}</mat-label>
                  <input matInput formControlName="name" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.graduation.fields.domain' | translate }}</mat-label>
                  <input matInput formControlName="domain" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'participants.fields.description' | translate }}</mat-label>
                  <textarea matInput formControlName="description" rows="2"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>P2 Threshold</mat-label>
                  <input matInput formControlName="thresholdP2" type="number" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>P3 Threshold</mat-label>
                  <input matInput formControlName="thresholdP3" type="number" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>P4 Threshold</mat-label>
                  <input matInput formControlName="thresholdP4" type="number" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'participants.graduation.fields.weight' | translate }}</mat-label>
                  <input matInput formControlName="weight" type="number" />
                </mat-form-field>
                <mat-checkbox formControlName="requiredForGraduation">
                  {{ 'participants.graduation.fields.required' | translate }}
                </mat-checkbox>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="editingBenchmark.set(null)">{{ 'common.cancel' | translate }}</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid">{{ 'common.save' | translate }}</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .page-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-field { max-width: 300px; }
    .full-width-table { width: 100%; }
    .full-width { grid-column: 1 / -1; }
    .inline-form-card { margin-top: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .add-section { margin-top: 1rem; }
    mat-icon { vertical-align: middle; }
  `,
})
export default class GraduationBenchmarksComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly benchmarkService = inject(GraduationBenchmarkService);
  private readonly notification = inject(NotificationService);

  readonly benchmarks = this.store.selectSignal(selectBenchmarks);
  readonly loading = this.store.selectSignal(selectParticipantsLoading);

  readonly projectIdFilter = signal('');
  readonly showCreateForm = signal(false);
  readonly editingBenchmark = signal<GraduationBenchmarkDto | null>(null);

  readonly benchmarkColumns = [
    'name', 'domain', 'thresholdP2', 'thresholdP3', 'thresholdP4',
    'weight', 'requiredForGraduation', 'isActive', 'actions',
  ];

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    domain: ['', [Validators.required]],
    requiredForGraduation: [false],
    projectId: [''],
    description: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    domain: ['', [Validators.required]],
    description: [''],
    thresholdP2: [0],
    thresholdP3: [0],
    thresholdP4: [0],
    requiredForGraduation: [false],
    weight: [1],
  });

  ngOnInit(): void {
    this.loadBenchmarks();
  }

  loadBenchmarks(): void {
    this.store.dispatch(
      ParticipantsActions.loadBenchmarks({
        projectId: this.projectIdFilter() || undefined,
      })
    );
  }

  onProjectIdFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectIdFilter.set(value);
    this.loadBenchmarks();
  }

  onCreateBenchmark(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateBenchmarkRequest = {
      name: value.name,
      domain: value.domain,
      requiredForGraduation: value.requiredForGraduation,
      projectId: value.projectId || undefined,
      description: value.description || undefined,
    };
    this.benchmarkService.createBenchmark(request).subscribe({
      next: () => {
        this.notification.success('Benchmark created successfully');
        this.showCreateForm.set(false);
        this.createForm.reset();
        this.loadBenchmarks();
      },
      error: () => this.notification.error('Failed to create benchmark'),
    });
  }

  onEditBenchmark(benchmark: GraduationBenchmarkDto): void {
    this.editingBenchmark.set(benchmark);
    this.editForm.patchValue({
      name: benchmark.name,
      domain: benchmark.domain,
      description: benchmark.description ?? '',
      thresholdP2: benchmark.thresholdP2,
      thresholdP3: benchmark.thresholdP3,
      thresholdP4: benchmark.thresholdP4,
      requiredForGraduation: benchmark.requiredForGraduation,
      weight: benchmark.weight,
    });
  }

  onUpdateBenchmark(): void {
    if (this.editForm.invalid) return;
    const benchmark = this.editingBenchmark();
    if (!benchmark) return;
    const value = this.editForm.getRawValue();
    const request: UpdateBenchmarkRequest = {
      benchmarkId: benchmark.id,
      name: value.name,
      domain: value.domain,
      description: value.description || undefined,
      thresholdP2: value.thresholdP2,
      thresholdP3: value.thresholdP3,
      thresholdP4: value.thresholdP4,
      requiredForGraduation: value.requiredForGraduation,
      weight: value.weight,
    };
    this.benchmarkService.updateBenchmark(benchmark.id, request).subscribe({
      next: () => {
        this.notification.success('Benchmark updated successfully');
        this.editingBenchmark.set(null);
        this.loadBenchmarks();
      },
      error: () => this.notification.error('Failed to update benchmark'),
    });
  }

  onBack(): void {
    this.router.navigate(['/participants']);
  }
}
