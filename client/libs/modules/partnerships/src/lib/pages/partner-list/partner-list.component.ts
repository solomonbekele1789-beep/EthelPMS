import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectSubGrantees, selectPartnershipsLoading } from '../../store/partnerships.selectors';
import { PartnerStatus, PartnerType, PartnerRiskRating } from '../../models/sub-grantee.model';

@Component({
  selector: 'ethel-partner-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'partnerships.partners.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'partnerships.subgrantees.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'partnerships.partners.register' | translate }}
      </button>
      <button mat-stroked-button (click)="onDisbursements()">
        <mat-icon>payments</mat-icon>
        {{ 'partnerships.disbursements.title' | translate }}
      </button>
      <button mat-stroked-button (click)="onReports()">
        <mat-icon>description</mat-icon>
        {{ 'partnerships.reports.title' | translate }}
      </button>
      <button mat-stroked-button (click)="onCompliance()">
        <mat-icon>verified</mat-icon>
        {{ 'partnerships.compliance.title' | translate }}
      </button>
      <button mat-stroked-button (click)="onDashboard()">
        <mat-icon>dashboard</mat-icon>
        {{ 'partnerships.dashboard.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!statusFilter()"
            (click)="onStatusFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (status of statuses; track status) {
            <mat-chip
              [highlighted]="statusFilter() === status"
              (click)="onStatusFilter(status)">
              <app-status-badge [status]="status" [label]="status"></app-status-badge>
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!typeFilter()"
            (click)="onTypeFilter(undefined)">
            {{ 'common.allTypes' | translate }}
          </mat-chip>
          @for (type of partnerTypes; track type) {
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
        [data]="subGrantees()"
        [loading]="loading()"
        emptyTitle="No partners found"
        emptyMessage="Get started by registering your first partner."
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #riskTpl let-row>
      <mat-chip [class.risk-low]="row.riskRating === 'Low'"
                [class.risk-medium]="row.riskRating === 'Medium'"
                [class.risk-high]="row.riskRating === 'High'"
                [class.risk-critical]="row.riskRating === 'Critical'">
        {{ row.riskRating }}
      </mat-chip>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .risk-low { --mdc-chip-elevated-container-color: #c8e6c9; }
    .risk-medium { --mdc-chip-elevated-container-color: #ffe0b2; }
    .risk-high { --mdc-chip-elevated-container-color: #ffcdd2; }
    .risk-critical { --mdc-chip-elevated-container-color: #f8bbd0; }
  `,
})
export default class PartnerListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly subGrantees = this.store.selectSignal(selectSubGrantees);
  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  readonly statusFilter = signal<PartnerStatus | undefined>(undefined);
  readonly typeFilter = signal<PartnerType | undefined>(undefined);

  readonly statuses: PartnerStatus[] = ['Prospect', 'Active', 'Suspended', 'Inactive', 'Blacklisted'];
  readonly partnerTypes: PartnerType[] = ['LocalNGO', 'InternationalNGO', 'CommunityOrg', 'GovernmentBody', 'AcademicInstitution', 'PrivateSector'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly riskTpl = viewChild<TemplateRef<unknown>>('riskTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'partnerType', label: 'Type' },
    { key: 'country', label: 'Country' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'riskRating', label: 'Risk', template: this.riskTpl() },
    { key: 'capacityScore', label: 'Capacity Score' },
  ]);

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners(): void {
    this.store.dispatch(
      PartnershipsActions.loadSubGrantees({
        status: this.statusFilter(),
        partnerType: this.typeFilter(),
      })
    );
  }

  onStatusFilter(status: PartnerStatus | undefined): void {
    this.statusFilter.set(status);
    this.loadPartners();
  }

  onTypeFilter(type: PartnerType | undefined): void {
    this.typeFilter.set(type);
    this.loadPartners();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/partnerships/partners', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/partnerships/partners/register']);
  }

  onDisbursements(): void {
    this.router.navigate(['/partnerships/disbursements']);
  }

  onReports(): void {
    this.router.navigate(['/partnerships/reports']);
  }

  onCompliance(): void {
    this.router.navigate(['/partnerships/compliance']);
  }

  onDashboard(): void {
    this.router.navigate(['/partnerships/dashboard']);
  }
}
