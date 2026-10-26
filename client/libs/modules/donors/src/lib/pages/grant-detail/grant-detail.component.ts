import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DonorsActions } from '../../store/donors.actions';
import { selectSelectedGrant, selectDonorsLoading } from '../../store/donors.selectors';
import { GrantService } from '../../services/grant.service';
import {
  GrantDto,
  GrantConditionDto,
  GrantReportDto,
  AddGrantConditionRequest,
  MarkConditionMetRequest,
  SubmitGrantReportRequest,
  ConditionStatus,
} from '../../models/grant.model';

@Component({
  selector: 'ethel-grant-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="grant()?.title ?? ('donors.grants.detail' | translate)">
      @if (grant()) {
        <app-status-badge [status]="grant()!.status" [label]="grant()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !grant()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (grant()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'donors.tabs.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.grantNumber' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.grantNumber }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.title' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.title }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.donorId' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.donorId }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.status' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="grant()!.status" [label]="grant()!.status"></app-status-badge>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.totalAmount' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.totalAmount | currency:grant()!.currencyCode:'symbol':'1.0-0' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.currencyCode' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.currencyCode }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.startDate' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.startDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.endDate' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.endDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'donors.fields.complianceStatus' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-chip [class.compliance-green]="grant()!.complianceStatus === 'Green'"
                            [class.compliance-amber]="grant()!.complianceStatus === 'Amber'"
                            [class.compliance-red]="grant()!.complianceStatus === 'Red'">
                    {{ grant()!.complianceStatus }}
                  </mat-chip>
                </mat-card-content>
              </mat-card>
              @if (grant()!.projectId) {
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.projectId' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ grant()!.projectId }}</mat-card-content>
                </mat-card>
              }
            </div>

            @if (grant()!.description) {
              <mat-card class="narrative-card">
                <mat-card-header><mat-card-title>{{ 'donors.fields.description' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ grant()!.description }}</mat-card-content>
              </mat-card>
            }

            @if (grant()!.status === 'Draft') {
              <div class="action-buttons" *appHasPermission="'donors.grants.update'">
                <button mat-flat-button color="primary" (click)="onActivate()" [disabled]="activating()">
                  @if (activating()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <mat-icon>check_circle</mat-icon>
                    {{ 'donors.grants.activate' | translate }}
                  }
                </button>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Conditions Tab -->
        <mat-tab [label]="'donors.tabs.conditions' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'donors.grants.update'">
              <button mat-stroked-button (click)="toggleConditionForm()">
                <mat-icon>{{ showConditionForm() ? 'close' : 'add' }}</mat-icon>
                {{ showConditionForm() ? ('common.cancel' | translate) : ('donors.conditions.add' | translate) }}
              </button>
            </div>

            @if (showConditionForm()) {
              <form [formGroup]="conditionForm" (ngSubmit)="onAddCondition()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'donors.fields.description' | translate }}</mat-label>
                    <textarea matInput formControlName="description" rows="2"></textarea>
                    @if (conditionForm.controls.description.hasError('required')) {
                      <mat-error>Description is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.dueDate' | translate }}</mat-label>
                    <input matInput formControlName="dueDate" type="date" />
                    @if (conditionForm.controls.dueDate.hasError('required')) {
                      <mat-error>Due date is required</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="conditionForm.invalid || savingCondition()">
                    @if (savingCondition()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <app-data-table
              [columns]="conditionColumns()"
              [data]="grant()!.conditions"
              [loading]="false"
              emptyTitle="No conditions found"
              emptyMessage="Add a condition for this grant.">
            </app-data-table>
          </div>

          <ng-template #conditionStatusTpl let-row>
            <mat-chip [class.condition-pending]="row.status === 'Pending'"
                      [class.condition-met]="row.status === 'Met'"
                      [class.condition-overdue]="row.status === 'Overdue'"
                      [class.condition-waived]="row.status === 'Waived'">
              {{ row.status }}
            </mat-chip>
          </ng-template>

          <ng-template #conditionDueDateTpl let-row>
            {{ row.dueDate | date:'mediumDate' }}
          </ng-template>

          <ng-template #conditionActionTpl let-row>
            @if (row.status === 'Pending' || row.status === 'Overdue') {
              <button mat-stroked-button color="primary" *appHasPermission="'donors.grants.update'" (click)="onMarkConditionMet(row); $event.stopPropagation()">
                <mat-icon>check</mat-icon>
                {{ 'donors.conditions.markMet' | translate }}
              </button>
            }
          </ng-template>
        </mat-tab>

        <!-- Reports Tab -->
        <mat-tab [label]="'donors.tabs.reports' | translate">
          <div class="tab-content">
            <app-data-table
              [columns]="reportColumns()"
              [data]="grant()!.reports"
              [loading]="false"
              emptyTitle="No reports found"
              emptyMessage="No reports have been created for this grant.">
            </app-data-table>
          </div>

          <ng-template #reportDueDateTpl let-row>
            {{ row.dueDate | date:'mediumDate' }}
          </ng-template>

          <ng-template #reportSubmittedTpl let-row>
            <mat-chip [highlighted]="row.isSubmitted">
              {{ row.isSubmitted ? 'Submitted' : 'Pending' }}
            </mat-chip>
          </ng-template>

          <ng-template #reportSubmittedDateTpl let-row>
            {{ row.submittedDate ? (row.submittedDate | date:'mediumDate') : '-' }}
          </ng-template>

          <ng-template #reportActionTpl let-row>
            @if (!row.isSubmitted) {
              <button mat-stroked-button color="primary" *appHasPermission="'donors.grants.update'" (click)="onSubmitReport(row); $event.stopPropagation()">
                <mat-icon>send</mat-icon>
                {{ 'donors.reports.submit' | translate }}
              </button>
            }
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="description"
        title="Grant not found"
        message="The requested grant could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .tab-content { padding: 1.5rem 0; }
    .narrative-card { margin-bottom: 1rem; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .edit-form { margin-bottom: 1.5rem; }
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
      margin-top: 1rem;
    }
    .condition-pending { --mdc-chip-elevated-container-color: #bbdefb; }
    .condition-met { --mdc-chip-elevated-container-color: #c8e6c9; }
    .condition-overdue { --mdc-chip-elevated-container-color: #ffcdd2; }
    .condition-waived { --mdc-chip-elevated-container-color: #e0e0e0; }
    .compliance-green { --mdc-chip-elevated-container-color: #c8e6c9; }
    .compliance-amber { --mdc-chip-elevated-container-color: #ffe0b2; }
    .compliance-red { --mdc-chip-elevated-container-color: #ffcdd2; }
  `,
})
export default class GrantDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly grantService = inject(GrantService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly grant = this.store.selectSignal(selectSelectedGrant);
  readonly loading = this.store.selectSignal(selectDonorsLoading);

  readonly activeTab = signal(0);
  readonly activating = signal(false);
  readonly showConditionForm = signal(false);
  readonly savingCondition = signal(false);
  readonly markMetNotes = signal('');

  readonly conditionForm = this.fb.nonNullable.group({
    description: ['', [Validators.required]],
    dueDate: ['', [Validators.required]],
  });

  readonly conditionStatusTpl = viewChild<TemplateRef<unknown>>('conditionStatusTpl');
  readonly conditionDueDateTpl = viewChild<TemplateRef<unknown>>('conditionDueDateTpl');
  readonly conditionActionTpl = viewChild<TemplateRef<unknown>>('conditionActionTpl');
  readonly reportDueDateTpl = viewChild<TemplateRef<unknown>>('reportDueDateTpl');
  readonly reportSubmittedTpl = viewChild<TemplateRef<unknown>>('reportSubmittedTpl');
  readonly reportSubmittedDateTpl = viewChild<TemplateRef<unknown>>('reportSubmittedDateTpl');
  readonly reportActionTpl = viewChild<TemplateRef<unknown>>('reportActionTpl');

  readonly conditionColumns = computed<TableColumn[]>(() => [
    { key: 'description', label: 'Description' },
    { key: 'dueDate', label: 'Due Date', template: this.conditionDueDateTpl() },
    { key: 'status', label: 'Status', template: this.conditionStatusTpl() },
    { key: 'actions', label: 'Actions', template: this.conditionActionTpl() },
  ]);

  readonly reportColumns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title' },
    { key: 'reportType', label: 'Type' },
    { key: 'dueDate', label: 'Due Date', template: this.reportDueDateTpl() },
    { key: 'isSubmitted', label: 'Status', template: this.reportSubmittedTpl() },
    { key: 'submittedDate', label: 'Submitted Date', template: this.reportSubmittedDateTpl() },
    { key: 'actions', label: 'Actions', template: this.reportActionTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(DonorsActions.loadGrant({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  onActivate(): void {
    this.activating.set(true);
    this.grantService.activateGrant(this.id()).subscribe({
      next: () => {
        this.notification.success('Grant activated successfully');
        this.activating.set(false);
        this.store.dispatch(DonorsActions.loadGrant({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to activate grant');
        this.activating.set(false);
      },
    });
  }

  toggleConditionForm(): void {
    this.showConditionForm.update(v => !v);
    if (this.showConditionForm()) {
      this.conditionForm.reset();
    }
  }

  onAddCondition(): void {
    if (this.conditionForm.invalid) return;
    const value = this.conditionForm.getRawValue();
    const request: AddGrantConditionRequest = {
      grantId: this.id(),
      description: value.description,
      dueDate: value.dueDate,
    };
    this.savingCondition.set(true);
    this.grantService.addCondition(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Condition added successfully');
        this.showConditionForm.set(false);
        this.conditionForm.reset();
        this.savingCondition.set(false);
        this.store.dispatch(DonorsActions.loadGrant({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add condition');
        this.savingCondition.set(false);
      },
    });
  }

  onMarkConditionMet(condition: GrantConditionDto): void {
    const notes = prompt('Enter completion notes (optional):');
    const request: MarkConditionMetRequest = {
      conditionId: condition.id,
      notes: notes || undefined,
    };
    this.grantService.markConditionMet(condition.id, request).subscribe({
      next: () => {
        this.notification.success('Condition marked as met');
        this.store.dispatch(DonorsActions.loadGrant({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to mark condition as met'),
    });
  }

  onSubmitReport(report: GrantReportDto): void {
    const fileUrl = prompt('Enter file URL (optional):');
    const request: SubmitGrantReportRequest = {
      reportId: report.id,
      fileUrl: fileUrl || undefined,
    };
    this.grantService.submitReport(report.id, request).subscribe({
      next: () => {
        this.notification.success('Report submitted successfully');
        this.store.dispatch(DonorsActions.loadGrant({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to submit report'),
    });
  }
}
