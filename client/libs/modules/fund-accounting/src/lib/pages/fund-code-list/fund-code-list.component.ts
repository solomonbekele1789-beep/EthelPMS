import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { DecimalPipe, DatePipe } from '@angular/common';
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
import { FundAccountingActions } from '../../store/fund-accounting.actions';
import {
  selectFundCodes,
  selectFundAccountingLoading,
} from '../../store/fund-accounting.selectors';
import { FundCodeService } from '../../services/fund-code.service';
import {
  FundType,
  FundCodeDto,
  FundRestrictionDto,
  CreateFundCodeRequest,
  CreateFundRestrictionRequest,
  ReleaseFundRestrictionRequest,
} from '../../models/fund-code.model';

@Component({
  selector: 'ethel-fund-code-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatExpansionModule,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'finance.fundCodes.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'fundacct.funds.create'" (click)="showCreateForm.set(!showCreateForm())">
        <mat-icon>add</mat-icon>
        {{ 'finance.fundCodes.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!typeFilter()"
            (click)="onTypeFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (type of fundTypes; track type) {
            <mat-chip
              [highlighted]="typeFilter() === type"
              (click)="onTypeFilter(type)">
              {{ type }}
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="fundCodes()"
        [loading]="loading()"
        emptyTitle="No fund codes found"
        emptyMessage="Get started by adding your first fund code."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #typeTpl let-row>
      <mat-chip>{{ row.fundType }}</mat-chip>
    </ng-template>

    <ng-template #activeTpl let-row>
      <mat-chip [highlighted]="row.isActive" [class.active-chip]="row.isActive" [class.inactive-chip]="!row.isActive">
        {{ row.isActive ? ('common.active' | translate) : ('common.inactive' | translate) }}
      </mat-chip>
    </ng-template>

    <!-- Expanded Fund Code Detail -->
    @if (selectedFundCode()) {
      <mat-card class="detail-card">
        <mat-card-header>
          <mat-card-title>{{ selectedFundCode()!.name }} ({{ selectedFundCode()!.code }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-info">
            <span><strong>{{ 'finance.fields.fundType' | translate }}:</strong> {{ selectedFundCode()!.fundType }}</span>
            <span><strong>{{ 'common.status' | translate }}:</strong> {{ selectedFundCode()!.isActive ? 'Active' : 'Inactive' }}</span>
            @if (selectedFundCode()!.description) {
              <span><strong>{{ 'finance.fields.description' | translate }}:</strong> {{ selectedFundCode()!.description }}</span>
            }
          </div>

          <!-- Restrictions Section -->
          @if (selectedFundCode()!.fundType !== 'Unrestricted') {
            <h3>{{ 'finance.restrictions.title' | translate }}</h3>

            @if (restrictions().length === 0) {
              <p class="no-data">{{ 'finance.restrictions.none' | translate }}</p>
            } @else {
              <mat-accordion>
                @for (restriction of restrictions(); track restriction.id) {
                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>{{ restriction.description }}</mat-panel-title>
                      <mat-panel-description>
                        <app-status-badge [status]="restriction.status" [label]="restriction.status"></app-status-badge>
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    <div class="restriction-detail">
                      <div class="restriction-amounts">
                        <span><strong>{{ 'finance.fields.originalAmount' | translate }}:</strong> {{ restriction.originalAmount | number:'1.2-2' }}</span>
                        <span><strong>{{ 'finance.fields.releasedAmount' | translate }}:</strong> {{ restriction.releasedAmount | number:'1.2-2' }}</span>
                        <span><strong>{{ 'finance.fields.remainingAmount' | translate }}:</strong> {{ restriction.remainingAmount | number:'1.2-2' }}</span>
                      </div>
                      @if (restriction.conditionDescription) {
                        <p><strong>{{ 'finance.fields.condition' | translate }}:</strong> {{ restriction.conditionDescription }}</p>
                      }
                      @if (restriction.expiryDate) {
                        <p><strong>{{ 'finance.fields.expiryDate' | translate }}:</strong> {{ restriction.expiryDate | date:'mediumDate' }}</p>
                      }

                      @if (restriction.status === 'Active' || restriction.status === 'PartiallyReleased') {
                        <div class="release-row">
                          <mat-form-field appearance="outline" class="release-input">
                            <mat-label>{{ 'finance.fields.releaseAmount' | translate }}</mat-label>
                            <input matInput type="number" [(ngModel)]="releaseAmount" />
                          </mat-form-field>
                          <button mat-stroked-button color="primary" *appHasPermission="'fundacct.restrictions.release'" (click)="onReleaseRestriction(restriction)">
                            {{ 'finance.restrictions.release' | translate }}
                          </button>
                        </div>
                      }
                    </div>
                  </mat-expansion-panel>
                }
              </mat-accordion>
            }

            <!-- Add Restriction Form -->
            <button mat-stroked-button color="primary" class="add-restriction-btn"
                    *appHasPermission="'fundacct.restrictions.create'"
                    (click)="showRestrictionForm.set(!showRestrictionForm())">
              <mat-icon>add</mat-icon>
              {{ 'finance.restrictions.add' | translate }}
            </button>

            @if (showRestrictionForm()) {
              <div class="restriction-form">
                <form [formGroup]="restrictionForm" (ngSubmit)="onCreateRestriction()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'finance.fields.description' | translate }}</mat-label>
                      <input matInput formControlName="description" />
                      @if (restrictionForm.controls.description.hasError('required')) {
                        <mat-error>Description is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'finance.fields.originalAmount' | translate }}</mat-label>
                      <input matInput type="number" formControlName="originalAmount" />
                      @if (restrictionForm.controls.originalAmount.hasError('required')) {
                        <mat-error>Amount is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'finance.fields.condition' | translate }}</mat-label>
                      <input matInput formControlName="conditionDescription" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'finance.fields.expiryDate' | translate }}</mat-label>
                      <input matInput type="date" formControlName="expiryDate" />
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-button type="button" (click)="showRestrictionForm.set(false)">{{ 'common.cancel' | translate }}</button>
                    <button mat-flat-button color="primary" type="submit" [disabled]="restrictionForm.invalid">
                      {{ 'common.create' | translate }}
                    </button>
                  </div>
                </form>
              </div>
            }
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="selectedFundCode.set(null)">{{ 'common.close' | translate }}</button>
        </mat-card-actions>
      </mat-card>
    }

    <!-- Create Fund Code Form -->
    @if (showCreateForm()) {
      <mat-card class="inline-form-card">
        <mat-card-header><mat-card-title>{{ 'finance.fundCodes.create' | translate }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.code' | translate }}</mat-label>
                <input matInput formControlName="code" />
                @if (createForm.controls.code.hasError('required')) {
                  <mat-error>Code is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.name' | translate }}</mat-label>
                <input matInput formControlName="name" />
                @if (createForm.controls.name.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.fundType' | translate }}</mat-label>
                <mat-select formControlName="fundType">
                  @for (type of fundTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
                @if (createForm.controls.fundType.hasError('required')) {
                  <mat-error>Fund type is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.description' | translate }}</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'finance.fields.donorGrantId' | translate }}</mat-label>
                <input matInput formControlName="donorGrantId" />
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="showCreateForm.set(false)">{{ 'common.cancel' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid">
                {{ 'common.create' | translate }}
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
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .detail-card { margin-top: 1.5rem; }
    .detail-info { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .restriction-detail { padding: 0.5rem 0; }
    .restriction-amounts { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .release-row { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
    .release-input { width: 200px; }
    .add-restriction-btn { margin-top: 1rem; }
    .restriction-form { margin-top: 1rem; }
    .no-data { color: rgba(0, 0, 0, 0.54); font-style: italic; }
    .inline-form-card { margin-top: 1.5rem; }
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
    .active-chip { --mdc-chip-elevated-container-color: #c8e6c9; }
    .inactive-chip { --mdc-chip-elevated-container-color: #e0e0e0; }
  `,
})
export default class FundCodeListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly fundCodeService = inject(FundCodeService);
  private readonly notification = inject(NotificationService);

  readonly fundCodes = this.store.selectSignal(selectFundCodes);
  readonly loading = this.store.selectSignal(selectFundAccountingLoading);

  readonly typeFilter = signal<FundType | undefined>(undefined);
  readonly selectedFundCode = signal<FundCodeDto | null>(null);
  readonly restrictions = signal<FundRestrictionDto[]>([]);
  readonly showCreateForm = signal(false);
  readonly showRestrictionForm = signal(false);
  releaseAmount: number | null = null;

  readonly fundTypes: FundType[] = ['Unrestricted', 'TemporarilyRestricted', 'PermanentlyRestricted'];

  readonly typeTpl = viewChild<TemplateRef<unknown>>('typeTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'fundType', label: 'Fund Type', template: this.typeTpl() },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
  ]);

  readonly createForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    fundType: ['' as FundType | '', [Validators.required]],
    description: [''],
    donorGrantId: [''],
  });

  readonly restrictionForm = this.fb.nonNullable.group({
    description: ['', [Validators.required]],
    originalAmount: [0, [Validators.required, Validators.min(0.01)]],
    conditionDescription: [''],
    expiryDate: [''],
  });

  ngOnInit(): void {
    this.loadFundCodes();
  }

  loadFundCodes(): void {
    this.store.dispatch(
      FundAccountingActions.loadFundCodes({
        fundType: this.typeFilter(),
      })
    );
  }

  onTypeFilter(type: FundType | undefined): void {
    this.typeFilter.set(type);
    this.loadFundCodes();
  }

  onRowClick(row: FundCodeDto): void {
    this.selectedFundCode.set(row);
    this.restrictions.set([]);
    this.showRestrictionForm.set(false);
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateFundCodeRequest = {
      code: value.code,
      name: value.name,
      fundType: value.fundType as FundType,
      description: value.description || undefined,
      donorGrantId: value.donorGrantId || undefined,
    };
    this.fundCodeService.createFundCode(request).subscribe({
      next: () => {
        this.notification.success('Fund code created successfully');
        this.showCreateForm.set(false);
        this.createForm.reset();
        this.loadFundCodes();
      },
      error: () => this.notification.error('Failed to create fund code'),
    });
  }

  onCreateRestriction(): void {
    if (this.restrictionForm.invalid || !this.selectedFundCode()) return;
    const value = this.restrictionForm.getRawValue();
    const request: CreateFundRestrictionRequest = {
      fundCodeId: this.selectedFundCode()!.id,
      description: value.description,
      originalAmount: value.originalAmount,
      conditionDescription: value.conditionDescription || undefined,
      expiryDate: value.expiryDate || undefined,
    };
    this.fundCodeService.createRestriction(this.selectedFundCode()!.id, request).subscribe({
      next: () => {
        this.notification.success('Restriction created successfully');
        this.showRestrictionForm.set(false);
        this.restrictionForm.reset();
      },
      error: () => this.notification.error('Failed to create restriction'),
    });
  }

  onReleaseRestriction(restriction: FundRestrictionDto): void {
    if (!this.releaseAmount || this.releaseAmount <= 0) {
      this.notification.error('Please enter a valid release amount');
      return;
    }
    const request: ReleaseFundRestrictionRequest = {
      fundRestrictionId: restriction.id,
      amount: this.releaseAmount,
    };
    this.fundCodeService.releaseRestriction(restriction.id, request).subscribe({
      next: () => {
        this.notification.success('Restriction released successfully');
        this.releaseAmount = null;
      },
      error: () => this.notification.error('Failed to release restriction'),
    });
  }
}
