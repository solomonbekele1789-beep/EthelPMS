import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import {
  BreadcrumbNavComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
  ConfirmDialogComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';

import { OfficeType, OfficeListItemDto } from '../../models/office.model';
import { OfficeService } from '../../services/office.service';
import { OfficeDialogComponent, OfficeDialogData } from '../../components/office-dialog/office-dialog.component';

@Component({
  selector: 'ethel-office-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    TranslatePipe,
    BreadcrumbNavComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <div class="office-list-page">
      <app-breadcrumb-nav></app-breadcrumb-nav>

      <div class="tabs-container">
        <mat-tab-group
          [(selectedIndex)]="selectedTabIndex"
          (selectedIndexChange)="onTabChange($event)"
          animationDuration="200ms"
          class="office-tabs"
        >
          <!-- 1. Head Office Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">domain</mat-icon>
              <span>Head Office</span>
              <span class="tab-counter" *ngIf="headOfficeCount() >= 0">{{ headOfficeCount() }}</span>
            </ng-template>
          </mat-tab>

          <!-- 2. Area Office Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">hub</mat-icon>
              <span>Area Office</span>
              <span class="tab-counter" *ngIf="areaOfficeCount() >= 0">{{ areaOfficeCount() }}</span>
            </ng-template>
          </mat-tab>

          <!-- 3. Branch Office Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">account_tree</mat-icon>
              <span>Branch Office</span>
              <span class="tab-counter" *ngIf="branchOfficeCount() >= 0">{{ branchOfficeCount() }}</span>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Single Horizontal Toolbar Row -->
      <div class="header-row">
        <!-- Left: Office Management Title for Current Tab -->
        <div class="header-left">
          <h1 class="page-title">{{ getTabTitle() }}</h1>
        </div>

        <!-- Center: Search Input -->
        <div class="header-center">
          <app-search-input
            [placeholder]="getSearchPlaceholder()"
            (search)="onSearch($event)"
          >
          </app-search-input>
        </div>

        <!-- Right: Create Button for Current Tab -->
        <div class="header-right">
          <button
            mat-flat-button
            color="primary"
            class="create-office-btn"
            *appHasPermission="'identity.offices.create'"
            (click)="onCreateOffice()"
          >
            <mat-icon>add</mat-icon>
            <span>{{ getCreateButtonLabel() }}</span>
          </button>
        </div>
      </div>

      <!-- Data Table Container -->
      <div class="list-container">
        <app-data-table
          [columns]="currentColumns()"
          [data]="offices()"
          [loading]="loading()"
          [totalCount]="totalCount()"
          [page]="page()"
          [pageSize]="pageSize()"
          [emptyTitle]="getEmptyTitle()"
          [emptyMessage]="getEmptyMessage()"
          (pageChange)="onPageChange($event)"
          (rowClick)="onRowClick($event)"
        >
        </app-data-table>
      </div>
    </div>

    <!-- Column Templates -->
    <ng-template #codeTpl let-row>
      <span class="code-badge">{{ row.code }}</span>
    </ng-template>

    <ng-template #parentTpl let-row>
      @if (row.parentOfficeName) {
        <div class="parent-cell">
          <mat-icon class="parent-icon">subdirectory_arrow_right</mat-icon>
          <span class="parent-name">{{ row.parentOfficeName }}</span>
          @if (row.parentOfficeCode) {
            <span class="sub-code">({{ row.parentOfficeCode }})</span>
          }
        </div>
      } @else {
        <span class="text-muted">—</span>
      }
    </ng-template>

    <ng-template #locationTpl let-row>
      @if (row.locationAddress) {
        <div class="location-cell" [matTooltip]="row.locationAddress">
          <mat-icon class="cell-icon">place</mat-icon>
          <span class="location-text">{{ row.locationAddress }}</span>
        </div>
      } @else if (row.latitude != null && row.longitude != null) {
        <div class="location-cell">
          <mat-icon class="cell-icon">my_location</mat-icon>
          <span>{{ row.latitude }}, {{ row.longitude }}</span>
        </div>
      } @else {
        <span class="text-muted">—</span>
      }
    </ng-template>

    <ng-template #descTpl let-row>
      @if (row.description) {
        <span class="desc-text" [matTooltip]="row.description">{{ row.description }}</span>
      } @else {
        <span class="text-muted">—</span>
      }
    </ng-template>

    <ng-template #statusTpl let-row>
      <app-status-badge
        [status]="row.isActive ? 'active' : 'inactive'"
        [label]="row.isActive ? 'Active' : 'Inactive'"
      >
      </app-status-badge>
    </ng-template>

    <ng-template #actionsTpl let-row>
      <div class="actions-wrapper">
        <button
          mat-icon-button
          color="primary"
          matTooltip="Edit Office"
          (click)="onEditOffice(row, $event)"
        >
          <mat-icon>edit</mat-icon>
        </button>
        <button
          mat-icon-button
          color="warn"
          matTooltip="Delete Office"
          (click)="onDeleteOffice(row, $event)"
        >
          <mat-icon>delete_outline</mat-icon>
        </button>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .office-list-page {
      width: 100%;
      padding: 0.75rem 0 1rem;
    }
    .tabs-container {
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .tab-icon {
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .tab-counter {
      margin-left: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e2e8f0;
      color: #334155;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      width: 100%;
      margin-bottom: 1rem;
    }
    .header-left {
      flex: 0 0 auto;
    }
    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.3;
      white-space: nowrap;
    }
    .header-center {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 480px;
    }
    .header-right {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
    }
    .create-office-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.25rem;
      height: 40px;
      font-weight: 500;
      white-space: nowrap;
    }
    .create-office-btn mat-icon {
      margin-right: 4px;
    }
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .code-badge {
      font-family: monospace;
      font-size: 0.8125rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #0f172a;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }
    .parent-cell {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .parent-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #64748b;
    }
    .parent-name {
      font-weight: 500;
      color: #1e293b;
    }
    .sub-code {
      font-size: 0.75rem;
      color: #64748b;
    }
    .location-cell {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      max-width: 260px;
    }
    .cell-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #2563eb;
      flex-shrink: 0;
    }
    .location-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .desc-text {
      display: inline-block;
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #475569;
    }
    .actions-wrapper {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .text-muted {
      color: #94a3b8;
    }
    @media (max-width: 800px) {
      .header-row {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      .header-center {
        max-width: 100%;
      }
      .header-right {
        justify-content: flex-end;
      }
    }
  `,
})
export default class OfficeListComponent implements OnInit {
  private readonly officeService = inject(OfficeService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly selectedTabIndex = signal<number>(0);
  readonly officeTypes: OfficeType[] = ['HeadOffice', 'AreaOffice', 'BranchOffice'];

  readonly currentOfficeType = computed<OfficeType>(() => this.officeTypes[this.selectedTabIndex()]);

  readonly offices = signal<OfficeListItemDto[]>([]);
  readonly totalCount = signal<number>(0);
  readonly loading = signal<boolean>(false);

  readonly headOfficeCount = signal<number>(0);
  readonly areaOfficeCount = signal<number>(0);
  readonly branchOfficeCount = signal<number>(0);

  readonly page = signal<number>(1);
  readonly pageSize = signal<number>(20);
  readonly search = signal<string>('');

  // Column Template References
  readonly codeTpl = viewChild<TemplateRef<unknown>>('codeTpl');
  readonly parentTpl = viewChild<TemplateRef<unknown>>('parentTpl');
  readonly locationTpl = viewChild<TemplateRef<unknown>>('locationTpl');
  readonly descTpl = viewChild<TemplateRef<unknown>>('descTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly currentColumns = computed<TableColumn[]>(() => {
    const type = this.currentOfficeType();
    const commonStart: TableColumn[] = [
      { key: 'name', label: this.getNameColumnLabel(), sortable: true },
      { key: 'code', label: this.getIdColumnLabel(), template: this.codeTpl() },
    ];

    if (type === 'AreaOffice') {
      commonStart.push({
        key: 'parentOfficeName',
        label: 'Head Office',
        template: this.parentTpl(),
      });
    } else if (type === 'BranchOffice') {
      commonStart.push({
        key: 'parentOfficeName',
        label: 'Area Office',
        template: this.parentTpl(),
      });
    }

    const commonEnd: TableColumn[] = [
      { key: 'locationAddress', label: 'Location', template: this.locationTpl() },
      { key: 'description', label: 'Description', template: this.descTpl() },
    ];

    if (type !== 'HeadOffice') {
      commonEnd.push({
        key: 'isActive',
        label: 'Status',
        template: this.statusTpl(),
      });
    }

    commonEnd.push(
      { key: 'userCount', label: 'Staff' },
      { key: 'actions', label: 'Actions', template: this.actionsTpl() }
    );

    return [...commonStart, ...commonEnd];
  });

  ngOnInit(): void {
    this.loadTabOffices();
    this.refreshAllCounts();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    this.page.set(1);
    this.search.set('');
    this.loadTabOffices();
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadTabOffices();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadTabOffices();
  }

  loadTabOffices(): void {
    this.loading.set(true);
    const type = this.currentOfficeType();

    this.officeService.listOffices(
      this.page(),
      this.pageSize(),
      this.search() || undefined,
      type
    ).subscribe({
      next: (res) => {
        this.offices.set(res.items);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);

        // Update active tab badge
        if (type === 'HeadOffice') this.headOfficeCount.set(res.totalCount);
        else if (type === 'AreaOffice') this.areaOfficeCount.set(res.totalCount);
        else if (type === 'BranchOffice') this.branchOfficeCount.set(res.totalCount);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error('Failed to load offices: ' + (err.error?.message || err.message));
      },
    });
  }

  refreshAllCounts(): void {
    // Background fetch counts for other tabs
    this.officeService.listOffices(1, 1, undefined, 'HeadOffice').subscribe({
      next: (r) => this.headOfficeCount.set(r.totalCount),
    });
    this.officeService.listOffices(1, 1, undefined, 'AreaOffice').subscribe({
      next: (r) => this.areaOfficeCount.set(r.totalCount),
    });
    this.officeService.listOffices(1, 1, undefined, 'BranchOffice').subscribe({
      next: (r) => this.branchOfficeCount.set(r.totalCount),
    });
  }

  onCreateOffice(): void {
    const type = this.currentOfficeType();

    if (type === 'HeadOffice') {
      this.openDialog('HeadOffice', undefined, []);
    } else if (type === 'AreaOffice') {
      // Must fetch Head Offices for dropdown
      this.loading.set(true);
      this.officeService.listOffices(1, 100, undefined, 'HeadOffice').subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.items.length === 0) {
            this.notify.warning('Please create a Head Office first before creating an Area Office.');
            return;
          }
          this.openDialog('AreaOffice', undefined, res.items);
        },
        error: () => {
          this.loading.set(false);
          this.notify.error('Failed to load Head Offices.');
        },
      });
    } else if (type === 'BranchOffice') {
      // Must fetch Area Offices for dropdown
      this.loading.set(true);
      this.officeService.listOffices(1, 100, undefined, 'AreaOffice').subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.items.length === 0) {
            this.notify.warning('Please create an Area Office first before creating a Branch Office.');
            return;
          }
          this.openDialog('BranchOffice', undefined, res.items);
        },
        error: () => {
          this.loading.set(false);
          this.notify.error('Failed to load Area Offices.');
        },
      });
    }
  }

  onEditOffice(office: OfficeListItemDto, event?: Event): void {
    if (event) event.stopPropagation();

    const type = office.officeType;

    if (type === 'HeadOffice') {
      this.openDialog('HeadOffice', office, []);
    } else if (type === 'AreaOffice') {
      this.officeService.listOffices(1, 100, undefined, 'HeadOffice').subscribe({
        next: (res) => this.openDialog('AreaOffice', office, res.items),
      });
    } else {
      this.officeService.listOffices(1, 100, undefined, 'AreaOffice').subscribe({
        next: (res) => this.openDialog('BranchOffice', office, res.items),
      });
    }
  }

  private openDialog(
    officeType: OfficeType,
    office: OfficeListItemDto | undefined,
    parentOffices: OfficeListItemDto[]
  ): void {
    const dialogRef = this.dialog.open(OfficeDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        officeType,
        office,
        parentOffices,
      } as OfficeDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.notify.success(
          office
            ? `${this.getOfficeTypeLabel(officeType)} updated successfully!`
            : `${this.getOfficeTypeLabel(officeType)} created successfully!`
        );
        this.loadTabOffices();
        this.refreshAllCounts();
      }
    });
  }

  onDeleteOffice(office: OfficeListItemDto, event?: Event): void {
    if (event) event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Office',
        message: `Are you sure you want to delete "${office.name}" (${office.code})? Any assigned users or child offices must be reassigned first.`,
        confirmText: 'Delete Office',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.officeService.deleteOffice(office.id).subscribe({
          next: () => {
            this.notify.success(`Office "${office.name}" deleted successfully.`);
            this.loadTabOffices();
            this.refreshAllCounts();
          },
          error: (err) => {
            this.notify.error(err.error?.message || err.message || 'Failed to delete office.');
          },
        });
      }
    });
  }

  onRowClick(row: OfficeListItemDto): void {
    this.onEditOffice(row);
  }

  getTabTitle(): string {
    switch (this.currentOfficeType()) {
      case 'HeadOffice': return 'Head Office Management';
      case 'AreaOffice': return 'Area Office Management';
      case 'BranchOffice': return 'Branch Office Management';
    }
  }

  getSearchPlaceholder(): string {
    switch (this.currentOfficeType()) {
      case 'HeadOffice': return 'Search head offices...';
      case 'AreaOffice': return 'Search area offices...';
      case 'BranchOffice': return 'Search branch offices...';
    }
  }

  getCreateButtonLabel(): string {
    switch (this.currentOfficeType()) {
      case 'HeadOffice': return 'Create Head Office';
      case 'AreaOffice': return 'Create New Area Office';
      case 'BranchOffice': return 'Add New Branch Office';
    }
  }

  getNameColumnLabel(): string {
    switch (this.currentOfficeType()) {
      case 'HeadOffice': return 'Head Office Name';
      case 'AreaOffice': return 'Area Office Name';
      case 'BranchOffice': return 'Branch Office Name';
    }
  }

  getIdColumnLabel(): string {
    switch (this.currentOfficeType()) {
      case 'HeadOffice': return 'Head Office ID';
      case 'AreaOffice': return 'Area Office ID';
      case 'BranchOffice': return 'Branch Office ID';
    }
  }

  getEmptyTitle(): string {
    switch (this.currentOfficeType()) {
      case 'HeadOffice': return 'No head offices found';
      case 'AreaOffice': return 'No area offices found';
      case 'BranchOffice': return 'No branch offices found';
    }
  }

  getEmptyMessage(): string {
    switch (this.currentOfficeType()) {
      case 'HeadOffice': return 'Get started by creating your primary Head Office.';
      case 'AreaOffice': return 'Create regional Area Offices linked to your Head Office.';
      case 'BranchOffice': return 'Create field Branch Offices linked to an Area Office.';
    }
  }

  getOfficeTypeLabel(type: OfficeType): string {
    switch (type) {
      case 'HeadOffice': return 'Head Office';
      case 'AreaOffice': return 'Area Office';
      case 'BranchOffice': return 'Branch Office';
    }
  }
}
