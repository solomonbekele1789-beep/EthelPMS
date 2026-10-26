import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import { selectSelectedAsset, selectAssetsLoading } from '../../store/assets.selectors';
import { AssetService } from '../../services/asset.service';
import {
  UpdateAssetRequest,
  TransferAssetRequest,
  AssignAssetRequest,
  CalculateDepreciationRequest,
} from '../../models/asset.model';

@Component({
  selector: 'ethel-asset-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatChipsModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="asset()?.name ?? ('assets.detail.title' | translate)">
      @if (asset()) {
        <app-status-badge [status]="asset()!.status" [label]="asset()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !asset()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (asset()) {
      <!-- Header Info Cards -->
      <div class="info-cards">
        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.assetCode' | translate }}</div>
            <div class="info-value">{{ asset()!.assetCode }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.categoryName' | translate }}</div>
            <div class="info-value">{{ asset()!.categoryName }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.location' | translate }}</div>
            <div class="info-value">{{ asset()!.location }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.condition' | translate }}</div>
            <div class="info-value"><mat-chip>{{ asset()!.condition }}</mat-chip></div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.purchaseCost' | translate }}</div>
            <div class="info-value">{{ asset()!.purchaseCost | number:'1.2-2' }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="info-label">{{ 'assets.fields.currentBookValue' | translate }}</div>
            <div class="info-value">{{ asset()!.currentBookValue | number:'1.2-2' }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs -->
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'assets.detail.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.name' | translate }}</span>
                <span class="detail-value">{{ asset()!.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.description' | translate }}</span>
                <span class="detail-value">{{ asset()!.description ?? '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.serialNumber' | translate }}</span>
                <span class="detail-value">{{ asset()!.serialNumber ?? '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.modelNumber' | translate }}</span>
                <span class="detail-value">{{ asset()!.modelNumber ?? '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.purchaseDate' | translate }}</span>
                <span class="detail-value">{{ asset()!.purchaseDate | date:'mediumDate' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.depreciationMethod' | translate }}</span>
                <span class="detail-value">{{ asset()!.depreciationMethod }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.usefulLifeYears' | translate }}</span>
                <span class="detail-value">{{ asset()!.usefulLifeYears }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.assignedToName' | translate }}</span>
                <span class="detail-value">{{ asset()!.assignedToName ?? '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.donorGrantId' | translate }}</span>
                <span class="detail-value">{{ asset()!.donorGrantId ?? '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'assets.fields.projectId' | translate }}</span>
                <span class="detail-value">{{ asset()!.projectId ?? '-' }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button mat-flat-button color="primary" *appHasPermission="'assets.register.update'" (click)="showUpdateForm.set(!showUpdateForm())">
                <mat-icon>edit</mat-icon>
                {{ 'assets.actions.update' | translate }}
              </button>
            </div>

            @if (showUpdateForm()) {
              <mat-card class="inline-form-card">
                <mat-card-header><mat-card-title>{{ 'assets.actions.update' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="updateForm" (ngSubmit)="onUpdateSubmit()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'assets.fields.name' | translate }}</mat-label>
                        <input matInput formControlName="name" />
                        @if (updateForm.controls.name.hasError('required')) {
                          <mat-error>Name is required</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'assets.fields.serialNumber' | translate }}</mat-label>
                        <input matInput formControlName="serialNumber" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'assets.fields.modelNumber' | translate }}</mat-label>
                        <input matInput formControlName="modelNumber" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ 'assets.fields.description' | translate }}</mat-label>
                        <textarea matInput formControlName="description" rows="3"></textarea>
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-button type="button" (click)="showUpdateForm.set(false)">{{ 'common.cancel' | translate }}</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="updateForm.invalid">
                        {{ 'common.save' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Transfers Tab -->
        <mat-tab [label]="'assets.detail.transfers' | translate">
          <div class="tab-content">
            <h3>{{ 'assets.actions.transfer' | translate }}</h3>
            <mat-card class="inline-form-card" *appHasPermission="'assets.transfers.create'">
              <mat-card-content>
                <form [formGroup]="transferForm" (ngSubmit)="onTransferSubmit()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.toLocation' | translate }}</mat-label>
                      <input matInput formControlName="toLocation" />
                      @if (transferForm.controls.toLocation.hasError('required')) {
                        <mat-error>Location is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.transferDate' | translate }}</mat-label>
                      <input matInput [matDatepicker]="transferDatePicker" formControlName="transferDate" />
                      <mat-datepicker-toggle matIconSuffix [for]="transferDatePicker"></mat-datepicker-toggle>
                      <mat-datepicker #transferDatePicker></mat-datepicker>
                      @if (transferForm.controls.transferDate.hasError('required')) {
                        <mat-error>Transfer date is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.reason' | translate }}</mat-label>
                      <input matInput formControlName="reason" />
                      @if (transferForm.controls.reason.hasError('required')) {
                        <mat-error>Reason is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.approvedBy' | translate }}</mat-label>
                      <input matInput formControlName="approvedBy" />
                      @if (transferForm.controls.approvedBy.hasError('required')) {
                        <mat-error>Approver is required</mat-error>
                      }
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="transferForm.invalid">
                      {{ 'assets.actions.transfer' | translate }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Assignments Tab -->
        <mat-tab [label]="'assets.detail.assignments' | translate">
          <div class="tab-content">
            @if (asset()!.assignedToName) {
              <mat-card class="info-card">
                <mat-card-content>
                  <div class="info-label">{{ 'assets.fields.assignedToName' | translate }}</div>
                  <div class="info-value">{{ asset()!.assignedToName }}</div>
                </mat-card-content>
              </mat-card>
            }

            <h3>{{ 'assets.actions.assign' | translate }}</h3>
            <mat-card class="inline-form-card" *appHasPermission="'assets.register.update'">
              <mat-card-content>
                <form [formGroup]="assignForm" (ngSubmit)="onAssignSubmit()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.assignedToUserId' | translate }}</mat-label>
                      <input matInput formControlName="assignedToUserId" />
                      @if (assignForm.controls.assignedToUserId.hasError('required')) {
                        <mat-error>User ID is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.assignedToName' | translate }}</mat-label>
                      <input matInput formControlName="assignedToName" />
                      @if (assignForm.controls.assignedToName.hasError('required')) {
                        <mat-error>Name is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.assignmentDate' | translate }}</mat-label>
                      <input matInput [matDatepicker]="assignDatePicker" formControlName="assignmentDate" />
                      <mat-datepicker-toggle matIconSuffix [for]="assignDatePicker"></mat-datepicker-toggle>
                      <mat-datepicker #assignDatePicker></mat-datepicker>
                      @if (assignForm.controls.assignmentDate.hasError('required')) {
                        <mat-error>Assignment date is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'assets.fields.notes' | translate }}</mat-label>
                      <textarea matInput formControlName="notes" rows="2"></textarea>
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="assignForm.invalid">
                      {{ 'assets.actions.assign' | translate }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Depreciation Tab -->
        <mat-tab [label]="'assets.detail.depreciation' | translate">
          <div class="tab-content">
            <div class="depreciation-summary">
              <mat-card>
                <mat-card-content>
                  <div class="info-label">{{ 'assets.fields.annualDepreciation' | translate }}</div>
                  <div class="info-value">{{ asset()!.annualDepreciation | number:'1.2-2' }}</div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-content>
                  <div class="info-label">{{ 'assets.fields.accumulatedDepreciation' | translate }}</div>
                  <div class="info-value">{{ asset()!.accumulatedDepreciation | number:'1.2-2' }}</div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-content>
                  <div class="info-label">{{ 'assets.fields.currentBookValue' | translate }}</div>
                  <div class="info-value">{{ asset()!.currentBookValue | number:'1.2-2' }}</div>
                </mat-card-content>
              </mat-card>
            </div>

            <h3>{{ 'assets.actions.calculate' | translate }}</h3>
            <mat-card class="inline-form-card" *appHasPermission="'assets.register.update'">
              <mat-card-content>
                <form [formGroup]="depreciationForm" (ngSubmit)="onCalculateDepreciation()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'assets.fields.asOfDate' | translate }}</mat-label>
                      <input matInput [matDatepicker]="asOfDatePicker" formControlName="asOfDate" />
                      <mat-datepicker-toggle matIconSuffix [for]="asOfDatePicker"></mat-datepicker-toggle>
                      <mat-datepicker #asOfDatePicker></mat-datepicker>
                      @if (depreciationForm.controls.asOfDate.hasError('required')) {
                        <mat-error>Date is required</mat-error>
                      }
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="depreciationForm.invalid">
                      {{ 'assets.actions.calculate' | translate }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    :host { display: block; }
    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .info-label { font-size: 0.75rem; color: rgba(0, 0, 0, 0.6); margin-bottom: 0.25rem; }
    .info-value { font-size: 1.1rem; font-weight: 500; }
    .info-card { margin-bottom: 1rem; }
    .tab-content { padding: 1.5rem 0; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-label { font-size: 0.75rem; color: rgba(0, 0, 0, 0.6); }
    .detail-value { font-size: 0.95rem; }
    .depreciation-summary {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    h3 { margin: 1.5rem 0 0.75rem; }
    .action-buttons { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.5rem; }
    .inline-form-card { margin-top: 1rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.5rem; }
    .full-width { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
  `,
})
export default class AssetDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly assetService = inject(AssetService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly asset = this.store.selectSignal(selectSelectedAsset);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly activeTab = signal(0);
  readonly showUpdateForm = signal(false);

  // Update Form
  readonly updateForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    serialNumber: [''],
    modelNumber: [''],
  });

  // Transfer Form
  readonly transferForm = this.fb.nonNullable.group({
    toLocation: ['', [Validators.required]],
    transferDate: ['', [Validators.required]],
    reason: ['', [Validators.required]],
    approvedBy: ['', [Validators.required]],
  });

  // Assign Form
  readonly assignForm = this.fb.nonNullable.group({
    assignedToUserId: ['', [Validators.required]],
    assignedToName: ['', [Validators.required]],
    assignmentDate: ['', [Validators.required]],
    notes: [''],
  });

  // Depreciation Form
  readonly depreciationForm = this.fb.nonNullable.group({
    asOfDate: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.store.dispatch(AssetsActions.loadAsset({ id: this.id() }));

    // Pre-fill update form when asset loads
    const asset = this.asset();
    if (asset) {
      this.prefillUpdateForm(asset);
    }
  }

  private prefillUpdateForm(asset: { name: string; description?: string; serialNumber?: string; modelNumber?: string }): void {
    this.updateForm.patchValue({
      name: asset.name,
      description: asset.description ?? '',
      serialNumber: asset.serialNumber ?? '',
      modelNumber: asset.modelNumber ?? '',
    });
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    // Pre-fill update form when switching to overview
    if (index === 0 && this.asset()) {
      this.prefillUpdateForm(this.asset()!);
    }
  }

  onUpdateSubmit(): void {
    if (this.updateForm.invalid) return;
    const value = this.updateForm.getRawValue();
    const request: UpdateAssetRequest = {
      id: this.id(),
      name: value.name,
      description: value.description || undefined,
      serialNumber: value.serialNumber || undefined,
      modelNumber: value.modelNumber || undefined,
    };
    this.assetService.updateAsset(this.id(), request).subscribe({
      next: () => {
        this.notification.success('assets.messages.assetUpdated');
        this.showUpdateForm.set(false);
        this.store.dispatch(AssetsActions.loadAsset({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to update asset'),
    });
  }

  onTransferSubmit(): void {
    if (this.transferForm.invalid) return;
    const value = this.transferForm.getRawValue();
    const request: TransferAssetRequest = {
      assetId: this.id(),
      toLocation: value.toLocation,
      transferDate: typeof value.transferDate === 'string' ? value.transferDate : new Date(value.transferDate).toISOString(),
      reason: value.reason,
      approvedBy: value.approvedBy,
    };
    this.assetService.transferAsset(this.id(), request).subscribe({
      next: () => {
        this.notification.success('assets.messages.assetTransferred');
        this.transferForm.reset();
        this.store.dispatch(AssetsActions.loadAsset({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to transfer asset'),
    });
  }

  onAssignSubmit(): void {
    if (this.assignForm.invalid) return;
    const value = this.assignForm.getRawValue();
    const request: AssignAssetRequest = {
      assetId: this.id(),
      assignedToUserId: value.assignedToUserId,
      assignedToName: value.assignedToName,
      assignmentDate: typeof value.assignmentDate === 'string' ? value.assignmentDate : new Date(value.assignmentDate).toISOString(),
      notes: value.notes || undefined,
    };
    this.assetService.assignAsset(this.id(), request).subscribe({
      next: () => {
        this.notification.success('assets.messages.assetAssigned');
        this.assignForm.reset();
        this.store.dispatch(AssetsActions.loadAsset({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to assign asset'),
    });
  }

  onCalculateDepreciation(): void {
    if (this.depreciationForm.invalid) return;
    const value = this.depreciationForm.getRawValue();
    const request: CalculateDepreciationRequest = {
      assetId: this.id(),
      asOfDate: typeof value.asOfDate === 'string' ? value.asOfDate : new Date(value.asOfDate).toISOString(),
    };
    this.assetService.calculateDepreciation(this.id(), request).subscribe({
      next: () => {
        this.notification.success('assets.messages.depreciationCalculated');
        this.store.dispatch(AssetsActions.loadAsset({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to calculate depreciation'),
    });
  }
}
