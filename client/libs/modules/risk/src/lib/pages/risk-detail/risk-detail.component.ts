import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { RiskActions } from '../../store/risk.actions';
import { selectSelectedRisk, selectRiskLoading } from '../../store/risk.selectors';
import { RiskService } from '../../services/risk.service';
import {
  RiskDto,
  Likelihood,
  Impact,
  RiskMitigationDto,
  MitigationStatus,
  CreateMitigationRequest,
  ReassessRiskRequest,
  RecordAssessmentRequest,
} from '../../models/risk.model';

@Component({
  selector: 'ethel-risk-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="risk()?.title ?? ('risk.risks.detail' | translate)">
      @if (risk()) {
        <mat-chip [class]="getStatusChipClass(risk()!.status)">
          {{ risk()!.status }}
        </mat-chip>
      }
    </app-page-header>

    @if (loading() && !risk()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (risk()) {
      <!-- Detail Header Grid -->
      <div class="detail-grid">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'risk.fields.status' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-chip [class]="getStatusChipClass(risk()!.status)">{{ risk()!.status }}</mat-chip>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'risk.fields.likelihood' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ risk()!.likelihood }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'risk.fields.impact' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ risk()!.impact }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'risk.fields.riskScore' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <span class="score-display" [class]="getScoreClass(risk()!.riskScore)">
              {{ risk()!.riskScore }}
            </span>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'risk.fields.owner' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ risk()!.owner || '--' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'risk.fields.identifiedDate' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ risk()!.identifiedDate | date:'mediumDate' }}</mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Tab 1: Overview -->
        <mat-tab [label]="'risk.tabs.overview' | translate">
          <div class="tab-content">
            @if (risk()!.description) {
              <mat-card class="narrative-card">
                <mat-card-header><mat-card-title>{{ 'risk.fields.description' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ risk()!.description }}</mat-card-content>
              </mat-card>
            }

            <div class="info-grid">
              @if (risk()!.location) {
                <div class="info-item">
                  <span class="info-label">{{ 'risk.fields.location' | translate }}</span>
                  <span class="info-value">{{ risk()!.location }}</span>
                </div>
              }
              @if (risk()!.residualRiskNotes) {
                <div class="info-item">
                  <span class="info-label">{{ 'risk.fields.residualRiskNotes' | translate }}</span>
                  <span class="info-value">{{ risk()!.residualRiskNotes }}</span>
                </div>
              }
              <div class="info-item">
                <span class="info-label">{{ 'risk.fields.createdAt' | translate }}</span>
                <span class="info-value">{{ risk()!.createdAt | date:'mediumDate' }}</span>
              </div>
              @if (risk()!.resolvedDate) {
                <div class="info-item">
                  <span class="info-label">{{ 'risk.fields.resolvedDate' | translate }}</span>
                  <span class="info-value">{{ risk()!.resolvedDate | date:'mediumDate' }}</span>
                </div>
              }
            </div>

            <!-- Reassess Form -->
            <mat-card class="action-card" *appHasPermission="'risk.risks.update'">
              <mat-card-header><mat-card-title>{{ 'risk.actions.reassess' | translate }}</mat-card-title></mat-card-header>
              <mat-card-content>
                <form [formGroup]="reassessForm" (ngSubmit)="onReassess()" class="inline-form">
                  <mat-form-field appearance="outline" class="action-field">
                    <mat-label>{{ 'risk.fields.likelihood' | translate }}</mat-label>
                    <mat-select formControlName="likelihood">
                      @for (l of likelihoods; track l) {
                        <mat-option [value]="l">{{ l }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="action-field">
                    <mat-label>{{ 'risk.fields.impact' | translate }}</mat-label>
                    <mat-select formControlName="impact">
                      @for (i of impacts; track i) {
                        <mat-option [value]="i">{{ i }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-flat-button color="primary" type="submit" [disabled]="reassessForm.invalid || savingReassess()">
                    @if (savingReassess()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'risk.actions.reassess' | translate }}
                    }
                  </button>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Resolve Button -->
            <div class="section-header" *appHasPermission="'risk.risks.update'">
              <button mat-flat-button color="warn" [disabled]="savingResolve()" (click)="onResolve()">
                @if (savingResolve()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>check_circle</mat-icon>
                  {{ 'risk.actions.resolve' | translate }}
                }
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Mitigations -->
        <mat-tab [label]="'risk.tabs.mitigations' | translate">
          <div class="tab-content">
            @if (risk()!.mitigations && risk()!.mitigations.length > 0) {
              <div class="mitigations-table">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>{{ 'risk.fields.action' | translate }}</th>
                      <th>{{ 'risk.fields.responsiblePerson' | translate }}</th>
                      <th>{{ 'risk.fields.plannedDate' | translate }}</th>
                      <th>{{ 'risk.fields.completedDate' | translate }}</th>
                      <th>{{ 'risk.fields.status' | translate }}</th>
                      <th>{{ 'risk.fields.estimatedCost' | translate }}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (mitigation of risk()!.mitigations; track mitigation.id) {
                      <tr>
                        <td>{{ mitigation.action }}</td>
                        <td>{{ mitigation.responsiblePerson || '--' }}</td>
                        <td>{{ mitigation.plannedDate | date:'mediumDate' }}</td>
                        <td>{{ mitigation.completedDate ? (mitigation.completedDate | date:'mediumDate') : '--' }}</td>
                        <td>
                          <mat-chip [class]="getMitigationStatusClass(mitigation.status)">
                            {{ mitigation.status }}
                          </mat-chip>
                        </td>
                        <td>{{ mitigation.estimatedCost != null ? (mitigation.estimatedCost | currency) : '--' }}</td>
                        <td>
                          @if (canCompleteMitigation(mitigation)) {
                            <button mat-icon-button color="primary"
                              *appHasPermission="'risk.mitigations.update'"
                              (click)="onCompleteMitigation(mitigation.id)">
                              <mat-icon>check</mat-icon>
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <app-empty-state
                icon="shield"
                title="No mitigations"
                message="Add mitigation actions to address this risk.">
              </app-empty-state>
            }

            <!-- Add Mitigation Form -->
            <div class="section-header" *appHasPermission="'risk.mitigations.create'">
              <button mat-stroked-button (click)="toggleMitigationForm()">
                <mat-icon>{{ showMitigationForm() ? 'close' : 'add' }}</mat-icon>
                {{ showMitigationForm() ? ('common.cancel' | translate) : ('risk.mitigations.add' | translate) }}
              </button>
            </div>

            @if (showMitigationForm()) {
              <form [formGroup]="mitigationForm" (ngSubmit)="onAddMitigation()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'risk.fields.action' | translate }}</mat-label>
                    <input matInput formControlName="action" />
                    @if (mitigationForm.controls.action.hasError('required')) {
                      <mat-error>Action is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'risk.fields.plannedDate' | translate }}</mat-label>
                    <input matInput [matDatepicker]="plannedPicker" formControlName="plannedDate" />
                    <mat-datepicker-toggle matSuffix [for]="plannedPicker"></mat-datepicker-toggle>
                    <mat-datepicker #plannedPicker></mat-datepicker>
                    @if (mitigationForm.controls.plannedDate.hasError('required')) {
                      <mat-error>Planned date is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'risk.fields.responsiblePerson' | translate }}</mat-label>
                    <input matInput formControlName="responsiblePerson" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'risk.fields.responsibleUserId' | translate }}</mat-label>
                    <input matInput formControlName="responsibleUserId" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'risk.fields.estimatedCost' | translate }}</mat-label>
                    <input matInput formControlName="estimatedCost" type="number" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'risk.fields.notes' | translate }}</mat-label>
                    <textarea matInput formControlName="notes" rows="2"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="mitigationForm.invalid || savingMitigation()">
                    @if (savingMitigation()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'risk.mitigations.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Tab 3: Assessments -->
        <mat-tab [label]="'risk.tabs.assessments' | translate">
          <div class="tab-content">
            @if (risk()!.latestAssessment) {
              <mat-card class="assessment-card">
                <mat-card-header><mat-card-title>{{ 'risk.assessments.latest' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">{{ 'risk.fields.likelihood' | translate }}</span>
                      <span class="info-value">{{ risk()!.latestAssessment!.likelihood }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ 'risk.fields.impact' | translate }}</span>
                      <span class="info-value">{{ risk()!.latestAssessment!.impact }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ 'risk.fields.riskScore' | translate }}</span>
                      <span class="info-value">
                        <span class="score-display" [class]="getScoreClass(risk()!.latestAssessment!.riskScore)">
                          {{ risk()!.latestAssessment!.riskScore }}
                        </span>
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ 'risk.fields.assessedBy' | translate }}</span>
                      <span class="info-value">{{ risk()!.latestAssessment!.assessedBy }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ 'risk.fields.assessmentDate' | translate }}</span>
                      <span class="info-value">{{ risk()!.latestAssessment!.assessmentDate | date:'mediumDate' }}</span>
                    </div>
                    @if (risk()!.latestAssessment!.source) {
                      <div class="info-item">
                        <span class="info-label">{{ 'risk.fields.source' | translate }}</span>
                        <span class="info-value">{{ risk()!.latestAssessment!.source }}</span>
                      </div>
                    }
                    @if (risk()!.latestAssessment!.notes) {
                      <div class="info-item full-width">
                        <span class="info-label">{{ 'risk.fields.notes' | translate }}</span>
                        <span class="info-value">{{ risk()!.latestAssessment!.notes }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            } @else {
              <app-empty-state
                icon="assessment"
                title="No assessments"
                message="Record the first assessment for this risk.">
              </app-empty-state>
            }

            <!-- Record Assessment Form -->
            <div class="section-header" *appHasPermission="'risk.assessments.create'">
              <button mat-stroked-button (click)="toggleAssessmentForm()">
                <mat-icon>{{ showAssessmentForm() ? 'close' : 'add' }}</mat-icon>
                {{ showAssessmentForm() ? ('common.cancel' | translate) : ('risk.assessments.record' | translate) }}
              </button>
            </div>

            @if (showAssessmentForm()) {
              <form [formGroup]="assessmentForm" (ngSubmit)="onRecordAssessment()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'risk.fields.likelihood' | translate }}</mat-label>
                    <mat-select formControlName="likelihood">
                      @for (l of likelihoods; track l) {
                        <mat-option [value]="l">{{ l }}</mat-option>
                      }
                    </mat-select>
                    @if (assessmentForm.controls.likelihood.hasError('required')) {
                      <mat-error>Likelihood is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'risk.fields.impact' | translate }}</mat-label>
                    <mat-select formControlName="impact">
                      @for (i of impacts; track i) {
                        <mat-option [value]="i">{{ i }}</mat-option>
                      }
                    </mat-select>
                    @if (assessmentForm.controls.impact.hasError('required')) {
                      <mat-error>Impact is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'risk.fields.source' | translate }}</mat-label>
                    <input matInput formControlName="source" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'risk.fields.notes' | translate }}</mat-label>
                    <textarea matInput formControlName="notes" rows="2"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="assessmentForm.invalid || savingAssessment()">
                    @if (savingAssessment()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'risk.assessments.record' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="warning"
        title="Risk not found"
        message="The requested risk could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .score-display {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 20px;
      color: #fff;
    }
    .score-low { background-color: #4caf50; }
    .score-medium { background-color: #ff9800; }
    .score-high { background-color: #f44336; }
    .score-critical { background-color: #b71c1c; }
    .tab-content { padding: 1.5rem 0; }
    .narrative-card { margin-bottom: 1rem; }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-label { font-size: 12px; color: var(--mat-sys-outline); text-transform: uppercase; }
    .info-value { font-size: 14px; }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .edit-form { margin-top: 1rem; }
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
    .action-card { margin-bottom: 1rem; }
    .inline-form { display: flex; align-items: center; gap: 1rem; padding-top: 0.5rem; flex-wrap: wrap; }
    .action-field { width: 200px; }
    .assessment-card { margin-bottom: 1.5rem; }
    .mitigations-table { overflow-x: auto; margin-bottom: 1rem; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th,
    .data-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .data-table th {
      font-size: 12px;
      font-weight: 500;
      color: var(--mat-sys-outline);
      text-transform: uppercase;
    }
    .data-table td { font-size: 14px; }
    .status-chip-identified { background-color: #e0e0e0 !important; }
    .status-chip-assessed { background-color: #bbdefb !important; color: #1565c0 !important; }
    .status-chip-mitigating { background-color: #fff9c4 !important; color: #f57f17 !important; }
    .status-chip-resolved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-chip-accepted { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .status-chip-closed { background-color: #e0e0e0 !important; color: #616161 !important; }
    .mitigation-planned { background-color: #e0e0e0 !important; }
    .mitigation-inprogress { background-color: #bbdefb !important; color: #1565c0 !important; }
    .mitigation-completed { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .mitigation-overdue { background-color: #ffebee !important; color: #c62828 !important; }
  `,
})
export default class RiskDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly riskService = inject(RiskService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly risk = this.store.selectSignal(selectSelectedRisk);
  readonly loading = this.store.selectSignal(selectRiskLoading);

  readonly activeTab = signal(0);
  readonly savingReassess = signal(false);
  readonly savingResolve = signal(false);
  readonly showMitigationForm = signal(false);
  readonly savingMitigation = signal(false);
  readonly showAssessmentForm = signal(false);
  readonly savingAssessment = signal(false);

  readonly likelihoods: Likelihood[] = ['VeryLow', 'Low', 'Medium', 'High', 'VeryHigh'];
  readonly impacts: Impact[] = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

  readonly reassessForm = this.fb.nonNullable.group({
    likelihood: ['' as string, [Validators.required]],
    impact: ['' as string, [Validators.required]],
  });

  readonly mitigationForm = this.fb.nonNullable.group({
    action: ['', [Validators.required]],
    plannedDate: [null as Date | null, [Validators.required]],
    responsiblePerson: [''],
    responsibleUserId: [''],
    estimatedCost: [null as number | null],
    notes: [''],
  });

  readonly assessmentForm = this.fb.nonNullable.group({
    likelihood: ['' as string, [Validators.required]],
    impact: ['' as string, [Validators.required]],
    notes: [''],
    source: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(RiskActions.loadRisk({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  // --- Reassess ---

  onReassess(): void {
    if (this.reassessForm.invalid) return;
    const value = this.reassessForm.getRawValue();
    const request: ReassessRiskRequest = {
      riskId: this.id(),
      likelihood: value.likelihood as Likelihood,
      impact: value.impact as Impact,
    };
    this.savingReassess.set(true);
    this.riskService.reassessRisk(this.id(), request).subscribe({
      next: () => {
        this.notification.success('risk.messages.riskReassessed');
        this.savingReassess.set(false);
        this.store.dispatch(RiskActions.loadRisk({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to reassess risk');
        this.savingReassess.set(false);
      },
    });
  }

  // --- Resolve ---

  onResolve(): void {
    this.savingResolve.set(true);
    this.riskService.resolveRisk(this.id()).subscribe({
      next: () => {
        this.notification.success('risk.messages.riskResolved');
        this.savingResolve.set(false);
        this.store.dispatch(RiskActions.loadRisk({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to resolve risk');
        this.savingResolve.set(false);
      },
    });
  }

  // --- Mitigations ---

  toggleMitigationForm(): void {
    this.showMitigationForm.update(v => !v);
    if (this.showMitigationForm()) {
      this.mitigationForm.reset();
    }
  }

  canCompleteMitigation(mitigation: RiskMitigationDto): boolean {
    return mitigation.status === 'Planned' || mitigation.status === 'InProgress';
  }

  onCompleteMitigation(mitigationId: string): void {
    this.riskService.completeMitigation(this.id(), mitigationId).subscribe({
      next: () => {
        this.notification.success('risk.messages.mitigationCompleted');
        this.store.dispatch(RiskActions.loadRisk({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to complete mitigation');
      },
    });
  }

  onAddMitigation(): void {
    if (this.mitigationForm.invalid) return;
    const value = this.mitigationForm.getRawValue();
    const request: CreateMitigationRequest = {
      riskId: this.id(),
      action: value.action,
      plannedDate: value.plannedDate ? value.plannedDate.toISOString() : '',
      responsiblePerson: value.responsiblePerson || undefined,
      responsibleUserId: value.responsibleUserId || undefined,
      estimatedCost: value.estimatedCost ?? undefined,
      notes: value.notes || undefined,
    };
    this.savingMitigation.set(true);
    this.riskService.createMitigation(this.id(), request).subscribe({
      next: () => {
        this.notification.success('risk.messages.mitigationCreated');
        this.showMitigationForm.set(false);
        this.savingMitigation.set(false);
        this.mitigationForm.reset();
        this.store.dispatch(RiskActions.loadRisk({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add mitigation');
        this.savingMitigation.set(false);
      },
    });
  }

  // --- Assessments ---

  toggleAssessmentForm(): void {
    this.showAssessmentForm.update(v => !v);
    if (this.showAssessmentForm()) {
      this.assessmentForm.reset();
    }
  }

  onRecordAssessment(): void {
    if (this.assessmentForm.invalid) return;
    const value = this.assessmentForm.getRawValue();
    const request: RecordAssessmentRequest = {
      riskId: this.id(),
      likelihood: value.likelihood as Likelihood,
      impact: value.impact as Impact,
      notes: value.notes || undefined,
      source: value.source || undefined,
    };
    this.savingAssessment.set(true);
    this.riskService.recordAssessment(this.id(), request).subscribe({
      next: () => {
        this.notification.success('risk.messages.assessmentRecorded');
        this.showAssessmentForm.set(false);
        this.savingAssessment.set(false);
        this.assessmentForm.reset();
        this.store.dispatch(RiskActions.loadRisk({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to record assessment');
        this.savingAssessment.set(false);
      },
    });
  }

  // --- Helpers ---

  getStatusChipClass(status: string): string {
    return 'status-chip-' + status.toLowerCase();
  }

  getMitigationStatusClass(status: MitigationStatus): string {
    return 'mitigation-' + status.toLowerCase();
  }

  getScoreClass(score: number): string {
    if (score <= 4) return 'score-display score-low';
    if (score <= 9) return 'score-display score-medium';
    if (score <= 14) return 'score-display score-high';
    return 'score-display score-critical';
  }
}
