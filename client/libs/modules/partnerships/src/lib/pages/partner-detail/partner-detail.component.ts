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
import { MatSelectModule } from '@angular/material/select';
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
import { PartnershipsActions } from '../../store/partnerships.actions';
import { selectSelectedSubGrantee, selectPartnershipsLoading } from '../../store/partnerships.selectors';
import { SubGranteeService } from '../../services/sub-grantee.service';
import { DisbursementService } from '../../services/disbursement.service';
import { PartnerReportService } from '../../services/partner-report.service';
import { ComplianceService } from '../../services/compliance.service';
import { SubGranteeDto, UpdateSubGranteeRequest, PartnerRiskRating, AssessRiskRequest } from '../../models/sub-grantee.model';
import { DisbursementDto, CreateDisbursementRequest } from '../../models/disbursement.model';
import { PartnerReportListDto, CreatePartnerReportRequest, PartnerReportType } from '../../models/partner-report.model';
import { PartnerComplianceDto, CreateComplianceCheckRequest, ComplianceType } from '../../models/compliance.model';

@Component({
  selector: 'ethel-partner-detail',
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
    MatSelectModule,
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
    <app-page-header [title]="partner()?.name ?? ('partnerships.partners.detail' | translate)">
      @if (partner()) {
        <button mat-stroked-button *appHasPermission="'partnerships.subgrantees.update'" (click)="toggleEditMode()">
          <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
          {{ editing() ? ('common.cancel' | translate) : ('common.edit' | translate) }}
        </button>
        @if (partner()!.status !== 'Active') {
          <button mat-stroked-button *appHasPermission="'partnerships.subgrantees.update'" (click)="onActivate()">
            <mat-icon>check_circle</mat-icon>
            {{ 'partnerships.actions.activate' | translate }}
          </button>
        }
        @if (partner()!.status === 'Active') {
          <button mat-stroked-button color="warn" *appHasPermission="'partnerships.subgrantees.update'" (click)="onSuspend()">
            <mat-icon>pause_circle</mat-icon>
            {{ 'partnerships.actions.suspend' | translate }}
          </button>
        }
      }
    </app-page-header>

    @if (loading() && !partner()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (partner()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'partnerships.tabs.overview' | translate">
          <div class="tab-content">
            @if (!editing()) {
              <div class="detail-grid">
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.name' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.name }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.partnerType' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.partnerType }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.country' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.country }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.status' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <app-status-badge [status]="partner()!.status" [label]="partner()!.status"></app-status-badge>
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.contactPerson' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.contactPerson }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.contactEmail' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.contactEmail }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.contactPhone' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.contactPhone || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.registrationNumber' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.registrationNumber || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.riskRating' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <mat-chip [class.risk-low]="partner()!.riskRating === 'Low'"
                              [class.risk-medium]="partner()!.riskRating === 'Medium'"
                              [class.risk-high]="partner()!.riskRating === 'High'"
                              [class.risk-critical]="partner()!.riskRating === 'Critical'">
                      {{ partner()!.riskRating }}
                    </mat-chip>
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.capacityScore' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.capacityScore ?? '-' }}</mat-card-content>
                </mat-card>
              </div>
              @if (partner()!.address) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.address' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.address }}</mat-card-content>
                </mat-card>
              }
              @if (partner()!.notes) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'partnerships.fields.notes' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ partner()!.notes }}</mat-card-content>
                </mat-card>
              }

              <!-- Risk Assessment -->
              <div class="section-header" *appHasPermission="'partnerships.subgrantees.update'">
                <button mat-stroked-button (click)="toggleRiskForm()">
                  <mat-icon>{{ showRiskForm() ? 'close' : 'assessment' }}</mat-icon>
                  {{ showRiskForm() ? ('common.cancel' | translate) : ('partnerships.actions.assessRisk' | translate) }}
                </button>
              </div>
              @if (showRiskForm()) {
                <form [formGroup]="riskForm" (ngSubmit)="onAssessRisk()" class="edit-form">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'partnerships.fields.riskRating' | translate }}</mat-label>
                      <mat-select formControlName="riskRating">
                        @for (r of riskRatings; track r) {
                          <mat-option [value]="r">{{ r }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'partnerships.fields.capacityScore' | translate }}</mat-label>
                      <input matInput formControlName="capacityScore" type="number" />
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="riskForm.invalid || savingRisk()">
                      @if (savingRisk()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        {{ 'common.save' | translate }}
                      }
                    </button>
                  </div>
                </form>
              }
            } @else {
              <form [formGroup]="editForm" (ngSubmit)="onUpdatePartner()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.name' | translate }}</mat-label>
                    <input matInput formControlName="name" />
                    @if (editForm.controls.name.hasError('required')) {
                      <mat-error>Name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.contactPerson' | translate }}</mat-label>
                    <input matInput formControlName="contactPerson" />
                    @if (editForm.controls.contactPerson.hasError('required')) {
                      <mat-error>Contact person is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.contactEmail' | translate }}</mat-label>
                    <input matInput formControlName="contactEmail" type="email" />
                    @if (editForm.controls.contactEmail.hasError('required')) {
                      <mat-error>Email is required</mat-error>
                    } @else if (editForm.controls.contactEmail.hasError('email')) {
                      <mat-error>Invalid email</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.contactPhone' | translate }}</mat-label>
                    <input matInput formControlName="contactPhone" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'partnerships.fields.address' | translate }}</mat-label>
                    <textarea matInput formControlName="address" rows="3"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'partnerships.fields.notes' | translate }}</mat-label>
                    <textarea matInput formControlName="notes" rows="3"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-button type="button" (click)="toggleEditMode()">{{ 'common.cancel' | translate }}</button>
                  <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving()">
                    @if (saving()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Disbursements Tab -->
        <mat-tab [label]="'partnerships.tabs.disbursements' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'partnerships.disbursements.create'">
              <button mat-stroked-button (click)="toggleDisbursementForm()">
                <mat-icon>{{ showDisbursementForm() ? 'close' : 'add' }}</mat-icon>
                {{ showDisbursementForm() ? ('common.cancel' | translate) : ('partnerships.disbursements.create' | translate) }}
              </button>
            </div>

            @if (showDisbursementForm()) {
              <form [formGroup]="disbursementForm" (ngSubmit)="onCreateDisbursement()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.amount' | translate }}</mat-label>
                    <input matInput formControlName="amount" type="number" />
                    @if (disbursementForm.controls.amount.hasError('required')) {
                      <mat-error>Amount is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.currency' | translate }}</mat-label>
                    <input matInput formControlName="currency" />
                    @if (disbursementForm.controls.currency.hasError('required')) {
                      <mat-error>Currency is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.disbursementDate' | translate }}</mat-label>
                    <input matInput formControlName="disbursementDate" type="date" />
                    @if (disbursementForm.controls.disbursementDate.hasError('required')) {
                      <mat-error>Date is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.referenceNumber' | translate }}</mat-label>
                    <input matInput formControlName="referenceNumber" />
                    @if (disbursementForm.controls.referenceNumber.hasError('required')) {
                      <mat-error>Reference number is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'partnerships.fields.purpose' | translate }}</mat-label>
                    <textarea matInput formControlName="purpose" rows="2"></textarea>
                    @if (disbursementForm.controls.purpose.hasError('required')) {
                      <mat-error>Purpose is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.grantId' | translate }}</mat-label>
                    <input matInput formControlName="grantId" />
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="disbursementForm.invalid || savingDisbursement()">
                    @if (savingDisbursement()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.create' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <app-data-table
              [columns]="disbursementColumns()"
              [data]="disbursements()"
              [loading]="loadingDisbursements()"
              emptyTitle="No disbursements found"
              emptyMessage="Create a disbursement for this partner.">
            </app-data-table>
          </div>

          <ng-template #disbStatusTpl let-row>
            <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
          </ng-template>

          <ng-template #disbAmountTpl let-row>
            {{ row.amount | currency:row.currency:'symbol':'1.0-0' }}
          </ng-template>

          <ng-template #disbDateTpl let-row>
            {{ row.disbursementDate | date:'mediumDate' }}
          </ng-template>
        </mat-tab>

        <!-- Reports Tab -->
        <mat-tab [label]="'partnerships.tabs.reports' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'partnerships.reports.create'">
              <button mat-stroked-button (click)="toggleReportForm()">
                <mat-icon>{{ showReportForm() ? 'close' : 'add' }}</mat-icon>
                {{ showReportForm() ? ('common.cancel' | translate) : ('partnerships.reports.create' | translate) }}
              </button>
            </div>

            @if (showReportForm()) {
              <form [formGroup]="reportForm" (ngSubmit)="onCreateReport()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.title' | translate }}</mat-label>
                    <input matInput formControlName="title" />
                    @if (reportForm.controls.title.hasError('required')) {
                      <mat-error>Title is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.reportType' | translate }}</mat-label>
                    <mat-select formControlName="reportType">
                      @for (t of reportTypes; track t) {
                        <mat-option [value]="t">{{ t }}</mat-option>
                      }
                    </mat-select>
                    @if (reportForm.controls.reportType.hasError('required')) {
                      <mat-error>Report type is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.reportingPeriodStart' | translate }}</mat-label>
                    <input matInput formControlName="reportingPeriodStart" type="date" />
                    @if (reportForm.controls.reportingPeriodStart.hasError('required')) {
                      <mat-error>Start date is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.reportingPeriodEnd' | translate }}</mat-label>
                    <input matInput formControlName="reportingPeriodEnd" type="date" />
                    @if (reportForm.controls.reportingPeriodEnd.hasError('required')) {
                      <mat-error>End date is required</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="reportForm.invalid || savingReport()">
                    @if (savingReport()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.create' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <app-data-table
              [columns]="reportColumns()"
              [data]="reports()"
              [loading]="loadingReports()"
              emptyTitle="No reports found"
              emptyMessage="Create a report for this partner."
              (rowClick)="onReportRowClick($event)">
            </app-data-table>
          </div>

          <ng-template #reportStatusTpl let-row>
            <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
          </ng-template>
        </mat-tab>

        <!-- Compliance Tab -->
        <mat-tab [label]="'partnerships.tabs.compliance' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'partnerships.compliance.create'">
              <button mat-stroked-button (click)="toggleComplianceForm()">
                <mat-icon>{{ showComplianceForm() ? 'close' : 'add' }}</mat-icon>
                {{ showComplianceForm() ? ('common.cancel' | translate) : ('partnerships.compliance.create' | translate) }}
              </button>
            </div>

            @if (showComplianceForm()) {
              <form [formGroup]="complianceForm" (ngSubmit)="onCreateCompliance()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.complianceType' | translate }}</mat-label>
                    <mat-select formControlName="complianceType">
                      @for (t of complianceTypes; track t) {
                        <mat-option [value]="t">{{ t }}</mat-option>
                      }
                    </mat-select>
                    @if (complianceForm.controls.complianceType.hasError('required')) {
                      <mat-error>Type is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.checkDate' | translate }}</mat-label>
                    <input matInput formControlName="checkDate" type="date" />
                    @if (complianceForm.controls.checkDate.hasError('required')) {
                      <mat-error>Date is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'partnerships.fields.assessorId' | translate }}</mat-label>
                    <input matInput formControlName="assessorId" />
                    @if (complianceForm.controls.assessorId.hasError('required')) {
                      <mat-error>Assessor is required</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="complianceForm.invalid || savingCompliance()">
                    @if (savingCompliance()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.create' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <app-data-table
              [columns]="complianceColumns()"
              [data]="complianceChecks()"
              [loading]="loadingCompliance()"
              emptyTitle="No compliance checks found"
              emptyMessage="Schedule a compliance check for this partner.">
            </app-data-table>
          </div>

          <ng-template #compStatusTpl let-row>
            <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
          </ng-template>

          <ng-template #compDateTpl let-row>
            {{ row.checkDate | date:'mediumDate' }}
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="handshake"
        title="Partner not found"
        message="The requested partner could not be found.">
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
    .risk-low { --mdc-chip-elevated-container-color: #c8e6c9; }
    .risk-medium { --mdc-chip-elevated-container-color: #ffe0b2; }
    .risk-high { --mdc-chip-elevated-container-color: #ffcdd2; }
    .risk-critical { --mdc-chip-elevated-container-color: #f8bbd0; }
  `,
})
export default class PartnerDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly subGranteeService = inject(SubGranteeService);
  private readonly disbursementService = inject(DisbursementService);
  private readonly reportService = inject(PartnerReportService);
  private readonly complianceService = inject(ComplianceService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly partner = this.store.selectSignal(selectSelectedSubGrantee);
  readonly loading = this.store.selectSignal(selectPartnershipsLoading);

  readonly activeTab = signal(0);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly showRiskForm = signal(false);
  readonly savingRisk = signal(false);
  readonly showDisbursementForm = signal(false);
  readonly savingDisbursement = signal(false);
  readonly showReportForm = signal(false);
  readonly savingReport = signal(false);
  readonly showComplianceForm = signal(false);
  readonly savingCompliance = signal(false);
  readonly disbursements = signal<DisbursementDto[]>([]);
  readonly loadingDisbursements = signal(false);
  readonly reports = signal<PartnerReportListDto[]>([]);
  readonly loadingReports = signal(false);
  readonly complianceChecks = signal<PartnerComplianceDto[]>([]);
  readonly loadingCompliance = signal(false);

  readonly riskRatings: PartnerRiskRating[] = ['Low', 'Medium', 'High', 'Critical'];
  readonly reportTypes: PartnerReportType[] = ['Financial', 'Narrative', 'Combined', 'Audit', 'Quarterly', 'Annual'];
  readonly complianceTypes: ComplianceType[] = ['FinancialAudit', 'ProgrammaticReview', 'SafeguardingCheck', 'EnvironmentalCompliance', 'AntiCorruption', 'CapacityAssessment'];

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    contactPerson: ['', [Validators.required]],
    contactEmail: ['', [Validators.required, Validators.email]],
    contactPhone: [''],
    address: [''],
    notes: [''],
  });

  readonly riskForm = this.fb.nonNullable.group({
    riskRating: ['', [Validators.required]],
    capacityScore: [''],
  });

  readonly disbursementForm = this.fb.nonNullable.group({
    amount: ['', [Validators.required]],
    currency: ['', [Validators.required]],
    disbursementDate: ['', [Validators.required]],
    referenceNumber: ['', [Validators.required]],
    purpose: ['', [Validators.required]],
    grantId: [''],
  });

  readonly reportForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    reportType: ['', [Validators.required]],
    reportingPeriodStart: ['', [Validators.required]],
    reportingPeriodEnd: ['', [Validators.required]],
  });

  readonly complianceForm = this.fb.nonNullable.group({
    complianceType: ['', [Validators.required]],
    checkDate: ['', [Validators.required]],
    assessorId: ['', [Validators.required]],
  });

  readonly disbStatusTpl = viewChild<TemplateRef<unknown>>('disbStatusTpl');
  readonly disbAmountTpl = viewChild<TemplateRef<unknown>>('disbAmountTpl');
  readonly disbDateTpl = viewChild<TemplateRef<unknown>>('disbDateTpl');
  readonly reportStatusTpl = viewChild<TemplateRef<unknown>>('reportStatusTpl');
  readonly compStatusTpl = viewChild<TemplateRef<unknown>>('compStatusTpl');
  readonly compDateTpl = viewChild<TemplateRef<unknown>>('compDateTpl');

  readonly disbursementColumns = computed<TableColumn[]>(() => [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'amount', label: 'Amount', template: this.disbAmountTpl() },
    { key: 'disbursementDate', label: 'Date', template: this.disbDateTpl() },
    { key: 'status', label: 'Status', template: this.disbStatusTpl() },
  ]);

  readonly reportColumns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title' },
    { key: 'reportType', label: 'Type' },
    { key: 'reportingPeriodStart', label: 'Period Start' },
    { key: 'reportingPeriodEnd', label: 'Period End' },
    { key: 'status', label: 'Status', template: this.reportStatusTpl() },
  ]);

  readonly complianceColumns = computed<TableColumn[]>(() => [
    { key: 'complianceType', label: 'Type' },
    { key: 'checkDate', label: 'Check Date', template: this.compDateTpl() },
    { key: 'score', label: 'Score' },
    { key: 'status', label: 'Status', template: this.compStatusTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(PartnershipsActions.loadSubGrantee({ id: this.id() }));
    this.loadDisbursements();
    this.loadReports();
    this.loadComplianceChecks();
  }

  private loadDisbursements(): void {
    this.loadingDisbursements.set(true);
    this.disbursementService.list({ subGranteeId: this.id() }).subscribe({
      next: (result) => {
        this.disbursements.set(result);
        this.loadingDisbursements.set(false);
      },
      error: () => {
        this.loadingDisbursements.set(false);
      },
    });
  }

  private loadReports(): void {
    this.loadingReports.set(true);
    this.reportService.list({ subGranteeId: this.id() }).subscribe({
      next: (result) => {
        this.reports.set(result);
        this.loadingReports.set(false);
      },
      error: () => {
        this.loadingReports.set(false);
      },
    });
  }

  private loadComplianceChecks(): void {
    this.loadingCompliance.set(true);
    this.complianceService.list({ subGranteeId: this.id() }).subscribe({
      next: (result) => {
        this.complianceChecks.set(result);
        this.loadingCompliance.set(false);
      },
      error: () => {
        this.loadingCompliance.set(false);
      },
    });
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  toggleEditMode(): void {
    if (!this.editing()) {
      const p = this.partner();
      if (p) {
        this.editForm.patchValue({
          name: p.name,
          contactPerson: p.contactPerson,
          contactEmail: p.contactEmail,
          contactPhone: p.contactPhone ?? '',
          address: p.address ?? '',
          notes: p.notes ?? '',
        });
      }
    }
    this.editing.update(v => !v);
  }

  onUpdatePartner(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateSubGranteeRequest = {
      id: this.id(),
      name: value.name,
      contactPerson: value.contactPerson,
      contactEmail: value.contactEmail,
      contactPhone: value.contactPhone || undefined,
      address: value.address || undefined,
      notes: value.notes || undefined,
    };
    this.saving.set(true);
    this.subGranteeService.update(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Partner updated successfully');
        this.editing.set(false);
        this.saving.set(false);
        this.store.dispatch(PartnershipsActions.loadSubGrantee({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to update partner');
        this.saving.set(false);
      },
    });
  }

  toggleRiskForm(): void {
    this.showRiskForm.update(v => !v);
    if (this.showRiskForm()) {
      const p = this.partner();
      this.riskForm.patchValue({
        riskRating: p?.riskRating ?? '',
        capacityScore: p?.capacityScore?.toString() ?? '',
      });
    }
  }

  onAssessRisk(): void {
    if (this.riskForm.invalid) return;
    const value = this.riskForm.getRawValue();
    const request: AssessRiskRequest = {
      id: this.id(),
      riskRating: value.riskRating as PartnerRiskRating,
      capacityScore: value.capacityScore ? Number(value.capacityScore) : undefined,
    };
    this.savingRisk.set(true);
    this.subGranteeService.assessRisk(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Risk assessment updated');
        this.showRiskForm.set(false);
        this.savingRisk.set(false);
        this.store.dispatch(PartnershipsActions.loadSubGrantee({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to update risk assessment');
        this.savingRisk.set(false);
      },
    });
  }

  onActivate(): void {
    this.subGranteeService.activate(this.id()).subscribe({
      next: () => {
        this.notification.success('Partner activated');
        this.store.dispatch(PartnershipsActions.loadSubGrantee({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to activate partner');
      },
    });
  }

  onSuspend(): void {
    this.subGranteeService.suspend(this.id()).subscribe({
      next: () => {
        this.notification.success('Partner suspended');
        this.store.dispatch(PartnershipsActions.loadSubGrantee({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to suspend partner');
      },
    });
  }

  toggleDisbursementForm(): void {
    this.showDisbursementForm.update(v => !v);
    if (this.showDisbursementForm()) {
      this.disbursementForm.reset();
    }
  }

  onCreateDisbursement(): void {
    if (this.disbursementForm.invalid) return;
    const value = this.disbursementForm.getRawValue();
    const request: CreateDisbursementRequest = {
      subGranteeId: this.id(),
      grantId: value.grantId || undefined,
      amount: Number(value.amount),
      currency: value.currency,
      disbursementDate: value.disbursementDate,
      referenceNumber: value.referenceNumber,
      purpose: value.purpose,
    };
    this.savingDisbursement.set(true);
    this.disbursementService.create(request).subscribe({
      next: () => {
        this.notification.success('Disbursement created successfully');
        this.showDisbursementForm.set(false);
        this.savingDisbursement.set(false);
        this.loadDisbursements();
      },
      error: () => {
        this.notification.error('Failed to create disbursement');
        this.savingDisbursement.set(false);
      },
    });
  }

  toggleReportForm(): void {
    this.showReportForm.update(v => !v);
    if (this.showReportForm()) {
      this.reportForm.reset();
    }
  }

  onCreateReport(): void {
    if (this.reportForm.invalid) return;
    const value = this.reportForm.getRawValue();
    const request: CreatePartnerReportRequest = {
      subGranteeId: this.id(),
      reportType: value.reportType as PartnerReportType,
      reportingPeriodStart: value.reportingPeriodStart,
      reportingPeriodEnd: value.reportingPeriodEnd,
      title: value.title,
    };
    this.savingReport.set(true);
    this.reportService.create(request).subscribe({
      next: () => {
        this.notification.success('Report created successfully');
        this.showReportForm.set(false);
        this.savingReport.set(false);
        this.loadReports();
      },
      error: () => {
        this.notification.error('Failed to create report');
        this.savingReport.set(false);
      },
    });
  }

  onReportRowClick(row: any): void {
    this.router.navigate(['/partnerships/reports', row.id]);
  }

  toggleComplianceForm(): void {
    this.showComplianceForm.update(v => !v);
    if (this.showComplianceForm()) {
      this.complianceForm.reset();
    }
  }

  onCreateCompliance(): void {
    if (this.complianceForm.invalid) return;
    const value = this.complianceForm.getRawValue();
    const request: CreateComplianceCheckRequest = {
      subGranteeId: this.id(),
      complianceType: value.complianceType as ComplianceType,
      checkDate: value.checkDate,
      assessorId: value.assessorId,
    };
    this.savingCompliance.set(true);
    this.complianceService.create(request).subscribe({
      next: () => {
        this.notification.success('Compliance check created successfully');
        this.showComplianceForm.set(false);
        this.savingCompliance.set(false);
        this.loadComplianceChecks();
      },
      error: () => {
        this.notification.error('Failed to create compliance check');
        this.savingCompliance.set(false);
      },
    });
  }
}
