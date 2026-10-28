import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectDisbursements, selectPartnershipsLoading } from '../../store/partnerships.selectors';
import { DisbursementService } from '../../services/disbursement.service';
import { DisbursementStatus } from '../../models/disbursement.model';

@Component({
  selector: 'ethel-disbursement-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'partnerships.disbursements.title' | translate">
      <button mat-stroked-button (click)="onBackToPartners()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'partnerships.partners.title' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <app-data-table
        [columns]="columns()"
        [data]="disbursements()"
        [loading]="loading()"
        emptyTitle="No disbursements found"
        emptyMessage="Disbursements will appear here once created.">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #amountTpl let-row>
      {{ row.amount | currency:row.currency:'symbol':'1.0-0' }}
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.disbursementDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #actionsTpl let-row>
      @if (row.status === 'Pending') {
        <button mat-icon-button *appHasPermission="'partnerships.disbursements.update'" (click)="onApprove(row.id); $event.stopPropagation()">
          <mat-icon>check</mat-icon>
        </button>
        <button mat-icon-button color="warn" *appHasPermission="'partnerships.disbursements.update'" (click)="onReject(row.id); $event.stopPropagation()">
          <mat-icon>close</mat-icon>
        </button>
      }
      @if (row.status === 'Approved') {
        <button mat-icon-button *appHasPermission="'partnerships.disbursements.update'" (click)="onDisburse(row.id); $event.stopPropagation()">
          <mat-icon>payments</mat-icon>
        </button>
      }
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
  `,
})
export default class DisbursementListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly disbursementService = inject(DisbursementService);
  private readonly notification = inject(NotificationService);

  readonly disbursements = this.store.selectSignal(selectDisbursements);
  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly amountTpl = viewChild<TemplateRef<unknown>>('amountTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'referenceNumber', label: 'Reference', sortable: true },
    { key: 'purpose', label: 'Purpose' },
    { key: 'amount', label: 'Amount', template: this.amountTpl() },
    { key: 'disbursementDate', label: 'Date', template: this.dateTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'actions', label: 'Actions', template: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(PartnershipsActions.loadDisbursements({}));
  }

  onApprove(id: string): void {
    this.disbursementService.approve(id).subscribe({
      next: () => {
        this.notification.success('Disbursement approved');
        this.store.dispatch(PartnershipsActions.loadDisbursements({}));
      },
      error: () => {
        this.notification.error('Failed to approve disbursement');
      },
    });
  }

  onDisburse(id: string): void {
    this.disbursementService.disburse(id).subscribe({
      next: () => {
        this.notification.success('Disbursement disbursed');
        this.store.dispatch(PartnershipsActions.loadDisbursements({}));
      },
      error: () => {
        this.notification.error('Failed to disburse');
      },
    });
  }

  onReject(id: string): void {
    this.disbursementService.reject(id).subscribe({
      next: () => {
        this.notification.success('Disbursement rejected');
        this.store.dispatch(PartnershipsActions.loadDisbursements({}));
      },
      error: () => {
        this.notification.error('Failed to reject disbursement');
      },
    });
  }

  onBackToPartners(): void {
    this.router.navigate(['/partnerships/partners']);
  }
}
