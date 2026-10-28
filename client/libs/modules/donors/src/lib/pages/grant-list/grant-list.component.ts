import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DonorsActions } from '../../store/donors.actions';
import {
  selectGrants,
  selectGrantsTotalCount,
  selectDonorsLoading,
} from '../../store/donors.selectors';
import { GrantStatus } from '../../models/grant.model';

@Component({
  selector: 'ethel-grant-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'donors.grants.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'donors.grants.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'donors.grants.create' | translate }}
      </button>
      <button mat-stroked-button (click)="onComplianceDashboard()">
        <mat-icon>dashboard</mat-icon>
        {{ 'donors.compliance.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'donors.fields.status' | translate }}</mat-label>
          <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilter($event.value)">
            <mat-option [value]="undefined">{{ 'common.all' | translate }}</mat-option>
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ s }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'donors.fields.donorId' | translate }}</mat-label>
          <input matInput [value]="donorIdFilter()" (keyup.enter)="onDonorIdFilter($any($event.target).value)" placeholder="Donor ID..." />
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="grants()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No grants found"
        emptyMessage="Get started by creating your first grant."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #amountTpl let-row>
      {{ row.totalAmount | currency:row.currencyCode:'symbol':'1.0-0' }}
    </ng-template>

    <ng-template #complianceTpl let-row>
      <mat-chip [class.compliance-green]="row.complianceStatus === 'Green'"
                [class.compliance-amber]="row.complianceStatus === 'Amber'"
                [class.compliance-red]="row.complianceStatus === 'Red'">
        {{ row.complianceStatus }}
      </mat-chip>
    </ng-template>

    <ng-template #startDateTpl let-row>
      {{ row.startDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #endDateTpl let-row>
      {{ row.endDate | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 200px; }
    .compliance-green { --mdc-chip-elevated-container-color: #c8e6c9; }
    .compliance-amber { --mdc-chip-elevated-container-color: #ffe0b2; }
    .compliance-red { --mdc-chip-elevated-container-color: #ffcdd2; }
  `,
})
export default class GrantListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly grants = this.store.selectSignal(selectGrants);
  readonly totalCount = this.store.selectSignal(selectGrantsTotalCount);
  readonly loading = this.store.selectSignal(selectDonorsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly statusFilter = signal<GrantStatus | undefined>(undefined);
  readonly donorIdFilter = signal<string>('');

  readonly statuses: GrantStatus[] = ['Draft', 'Active', 'Suspended', 'Completed', 'Terminated'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly amountTpl = viewChild<TemplateRef<unknown>>('amountTpl');
  readonly complianceTpl = viewChild<TemplateRef<unknown>>('complianceTpl');
  readonly startDateTpl = viewChild<TemplateRef<unknown>>('startDateTpl');
  readonly endDateTpl = viewChild<TemplateRef<unknown>>('endDateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'grantNumber', label: 'Grant Number', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'donorId', label: 'Donor' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'totalAmount', label: 'Amount', template: this.amountTpl() },
    { key: 'complianceStatus', label: 'Compliance', template: this.complianceTpl() },
    { key: 'startDate', label: 'Start Date', template: this.startDateTpl() },
    { key: 'endDate', label: 'End Date', template: this.endDateTpl() },
  ]);

  ngOnInit(): void {
    this.loadGrants();
  }

  loadGrants(): void {
    this.store.dispatch(
      DonorsActions.loadGrants({
        page: this.page(),
        pageSize: this.pageSize(),
        status: this.statusFilter() || undefined,
        donorId: this.donorIdFilter() || undefined,
      })
    );
  }

  onStatusFilter(status: GrantStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadGrants();
  }

  onDonorIdFilter(donorId: string): void {
    this.donorIdFilter.set(donorId);
    this.page.set(1);
    this.loadGrants();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadGrants();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/donors/grants', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/donors/grants/create']);
  }

  onComplianceDashboard(): void {
    this.router.navigate(['/donors/compliance']);
  }
}
