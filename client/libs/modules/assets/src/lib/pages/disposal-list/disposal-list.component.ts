import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { AssetsActions } from '../../store/assets.actions';
import {
  selectDisposals,
  selectDisposalsTotalCount,
  selectAssetsLoading,
} from '../../store/assets.selectors';
import { DisposalService } from '../../services/disposal.service';
import {
  AssetDisposalDto,
  DisposalStatus,
  InitiateDisposalRequest,
  CompleteDisposalRequest,
} from '../../models/disposal.model';

@Component({
  selector: 'ethel-disposal-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatChipsModule,
    MatSlideToggleModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'assets.disposals.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'assets.disposals.create'" (click)="showInitiateForm.set(!showInitiateForm())">
        <mat-icon>add</mat-icon>
        {{ 'assets.disposals.initiate' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <div class="status-chips">
          @for (status of statusFilters; track status.value) {
            <mat-chip-option
              [selected]="statusFilter() === status.value"
              (selectionChange)="onStatusFilter(status.value)">
              {{ status.label }}
            </mat-chip-option>
          }
        </div>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="disposals()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No disposals found"
        emptyMessage="No asset disposals have been initiated yet."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #bookValueTpl let-row>
      {{ row.bookValueAtDisposal | number:'1.2-2' }}
    </ng-template>

    <ng-template #disposalValueTpl let-row>
      {{ row.disposalValue != null ? (row.disposalValue | number:'1.2-2') : '-' }}
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.disposalDate ? (row.disposalDate | date:'mediumDate') : '-' }}
    </ng-template>

    <ng-template #actionsTpl let-row>
      @if (row.status === 'Pending' || row.status === 'DonorApproved') {
        <button mat-stroked-button color="primary" (click)="onCompleteClick(row); $event.stopPropagation()">
          {{ 'assets.actions.complete' | translate }}
        </button>
      }
    </ng-template>

    <!-- Initiate Disposal Form -->
    @if (showInitiateForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'assets.disposals.initiate' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="initiateForm" (ngSubmit)="onInitiateSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Asset ID</mat-label>
                <input matInput formControlName="assetId" />
                @if (initiateForm.controls.assetId.hasError('required')) {
                  <mat-error>Asset ID is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.reason' | translate }}</mat-label>
                <input matInput formControlName="reason" />
                @if (initiateForm.controls.reason.hasError('required')) {
                  <mat-error>Reason is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.disposalMethod' | translate }}</mat-label>
                <input matInput formControlName="disposalMethod" />
                @if (initiateForm.controls.disposalMethod.hasError('required')) {
                  <mat-error>Disposal method is required</mat-error>
                }
              </mat-form-field>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="requiresDonorApproval">
                  {{ 'assets.fields.requiresDonorApproval' | translate }}
                </mat-slide-toggle>
              </div>

              @if (initiateForm.controls.requiresDonorApproval.value) {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'assets.fields.donorGrantId' | translate }}</mat-label>
                  <input matInput formControlName="donorGrantId" />
                </mat-form-field>
              }
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showInitiateForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="initiateForm.invalid">
                {{ 'assets.actions.initiate' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <!-- Complete Disposal Form -->
    @if (showCompleteForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'assets.disposals.complete' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="completeForm" (ngSubmit)="onCompleteSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.disposalValue' | translate }}</mat-label>
                <input matInput type="number" formControlName="disposalValue" />
                @if (completeForm.controls.disposalValue.hasError('required')) {
                  <mat-error>Disposal value is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'assets.fields.disposalDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="disposalDatePicker" formControlName="disposalDate" />
                <mat-datepicker-toggle matIconSuffix [for]="disposalDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #disposalDatePicker></mat-datepicker>
                @if (completeForm.controls.disposalDate.hasError('required')) {
                  <mat-error>Disposal date is required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showCompleteForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="completeForm.invalid">
                {{ 'assets.actions.complete' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .status-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .inline-form-card { margin-top: 1.5rem; }
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
  `,
})
export default class DisposalListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly disposalService = inject(DisposalService);
  private readonly notification = inject(NotificationService);

  readonly disposals = this.store.selectSignal(selectDisposals);
  readonly totalCount = this.store.selectSignal(selectDisposalsTotalCount);
  readonly loading = this.store.selectSignal(selectAssetsLoading);

  readonly statusFilter = signal<string | undefined>(undefined);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly showInitiateForm = signal(false);
  readonly showCompleteForm = signal(false);
  readonly completingDisposalId = signal<string | null>(null);

  readonly statusFilters: { value: string | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'DonorApprovalRequested', label: 'Donor Approval Requested' },
    { value: 'DonorApproved', label: 'Donor Approved' },
    { value: 'DonorRejected', label: 'Donor Rejected' },
    { value: 'Disposed', label: 'Disposed' },
  ];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly bookValueTpl = viewChild<TemplateRef<unknown>>('bookValueTpl');
  readonly disposalValueTpl = viewChild<TemplateRef<unknown>>('disposalValueTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'assetName', label: 'Asset', sortable: true },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'reason', label: 'Reason' },
    { key: 'disposalMethod', label: 'Method' },
    { key: 'bookValueAtDisposal', label: 'Book Value', template: this.bookValueTpl() },
    { key: 'disposalValue', label: 'Disposal Value', template: this.disposalValueTpl() },
    { key: 'disposalDate', label: 'Date', template: this.dateTpl() },
    { key: 'actions', label: '', template: this.actionsTpl() },
  ]);

  readonly initiateForm = this.fb.nonNullable.group({
    assetId: ['', [Validators.required]],
    reason: ['', [Validators.required]],
    disposalMethod: ['', [Validators.required]],
    requiresDonorApproval: [false],
    donorGrantId: [''],
  });

  readonly completeForm = this.fb.nonNullable.group({
    disposalValue: [0, [Validators.required, Validators.min(0)]],
    disposalDate: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadDisposals();
  }

  loadDisposals(): void {
    this.store.dispatch(
      AssetsActions.loadDisposals({
        status: this.statusFilter(),
        page: this.page(),
        pageSize: this.pageSize(),
      })
    );
  }

  onStatusFilter(status: string | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadDisposals();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadDisposals();
  }

  onRowClick(row: AssetDisposalDto): void {
    // Toggle complete form for actionable rows
    if (row.status === 'Pending' || row.status === 'DonorApproved') {
      this.onCompleteClick(row);
    }
  }

  onCompleteClick(row: AssetDisposalDto): void {
    this.completingDisposalId.set(row.id);
    this.showCompleteForm.set(true);
    this.showInitiateForm.set(false);
  }

  onInitiateSubmit(): void {
    if (this.initiateForm.invalid) return;
    const value = this.initiateForm.getRawValue();
    const request: InitiateDisposalRequest = {
      assetId: value.assetId,
      reason: value.reason,
      disposalMethod: value.disposalMethod,
      requiresDonorApproval: value.requiresDonorApproval,
      donorGrantId: value.donorGrantId || undefined,
    };
    this.disposalService.initiateDisposal(request).subscribe({
      next: () => {
        this.notification.success('assets.messages.disposalInitiated');
        this.showInitiateForm.set(false);
        this.initiateForm.reset();
        this.loadDisposals();
      },
      error: () => this.notification.error('Failed to initiate disposal'),
    });
  }

  onCompleteSubmit(): void {
    if (this.completeForm.invalid || !this.completingDisposalId()) return;
    const value = this.completeForm.getRawValue();
    const request: CompleteDisposalRequest = {
      disposalId: this.completingDisposalId()!,
      disposalValue: value.disposalValue,
      disposalDate: typeof value.disposalDate === 'string' ? value.disposalDate : new Date(value.disposalDate).toISOString(),
    };
    this.disposalService.completeDisposal(this.completingDisposalId()!, request).subscribe({
      next: () => {
        this.notification.success('assets.messages.disposalCompleted');
        this.showCompleteForm.set(false);
        this.completingDisposalId.set(null);
        this.completeForm.reset();
        this.loadDisposals();
      },
      error: () => this.notification.error('Failed to complete disposal'),
    });
  }
}
