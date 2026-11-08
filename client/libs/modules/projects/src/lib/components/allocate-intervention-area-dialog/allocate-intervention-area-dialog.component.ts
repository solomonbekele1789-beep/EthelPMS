import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  InterventionAreaDto,
  AllocateInterventionAreaRequest,
} from '../../models/intervention-area.model';
import { InterventionAreaService } from '../../services/intervention-area.service';

export interface AllocateInterventionAreaDialogData {
  projectId: string;
  projectTitle: string;
  totalBudget?: number;
  allocatedAreaIds?: string[];
}

@Component({
  selector: 'ethel-allocate-intervention-area-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-title">
        <mat-icon class="header-icon">add_location_alt</mat-icon>
        <div>
          <h2>Allocate Project Intervention Area</h2>
          <span class="header-subtitle">{{ data.projectTitle }}</span>
        </div>
      </div>
      <button mat-icon-button (click)="onCancel()" type="button" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        @if (loadingAreas()) {
          <div class="loading-state">
            <mat-spinner diameter="28"></mat-spinner>
            <span>Loading pre-configured intervention areas...</span>
          </div>
        } @else {
          <!-- Cascading Geographic Selection -->
          <div class="section-card">
            <div class="section-title">
              <mat-icon>travel_explore</mat-icon>
              <span>1. Select Geographic Hierarchy (Settings Boundaries)</span>
            </div>

            <!-- Region selector -->
            <div class="form-row two-col">
              <mat-form-field appearance="outline">
                <mat-label>Region</mat-label>
                <mat-select (selectionChange)="onRegionChange($event.value)" [(value)]="selectedRegionId">
                  <mat-option [value]="null">-- Select Region --</mat-option>
                  @for (r of regions(); track r.id) {
                    <mat-option [value]="r.id">{{ r.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Zone selector -->
              <mat-form-field appearance="outline">
                <mat-label>Zone</mat-label>
                <mat-select
                  [disabled]="availableZones().length === 0"
                  (selectionChange)="onZoneChange($event.value)"
                  [(value)]="selectedZoneId"
                >
                  <mat-option [value]="null">-- Select Zone --</mat-option>
                  @for (z of availableZones(); track z.id) {
                    <mat-option [value]="z.id">{{ z.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row two-col">
              <!-- Woreda selector -->
              <mat-form-field appearance="outline">
                <mat-label>Woreda (District)</mat-label>
                <mat-select
                  [disabled]="availableWoredas().length === 0"
                  (selectionChange)="onWoredaChange($event.value)"
                  [(value)]="selectedWoredaId"
                >
                  <mat-option [value]="null">-- Select Woreda --</mat-option>
                  @for (w of availableWoredas(); track w.id) {
                    <mat-option [value]="w.id">{{ w.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Kebele / Site selector -->
              <mat-form-field appearance="outline">
                <mat-label>Kebele / Site / Specific Area *</mat-label>
                <mat-select
                  formControlName="interventionAreaId"
                  (selectionChange)="onAreaSelected($event.value)"
                >
                  <mat-option [value]="''">-- Select Area to Allocate --</mat-option>
                  @for (a of selectableAreas(); track a.id) {
                    <mat-option [value]="a.id" [disabled]="isAlreadyAllocated(a.id)">
                      [{{ a.areaType }}] {{ a.name }} ({{ a.code }})
                      @if (isAlreadyAllocated(a.id)) { - (Already Allocated) }
                    </mat-option>
                  }
                </mat-select>
                @if (form.get('interventionAreaId')?.hasError('required')) {
                  <mat-error>Please select an intervention area</mat-error>
                }
              </mat-form-field>
            </div>

            <!-- Selected Area Preview Card -->
            @if (selectedArea(); as area) {
              <div class="area-preview">
                <div class="preview-header">
                  <span class="preview-badge">{{ area.areaType }}</span>
                  <strong class="preview-name">{{ area.name }}</strong>
                  <span class="preview-code">{{ area.code }}</span>
                </div>

                @if (area.latitude && area.longitude) {
                  <div class="preview-gps">
                    <mat-icon class="gps-icon">place</mat-icon>
                    <span>Coordinates: {{ area.latitude }}, {{ area.longitude }}</span>
                    @if (area.gpsSource) {
                      <span class="preview-tag">Source: {{ area.gpsSource }}</span>
                    }
                    <a
                      [href]="'https://www.google.com/maps?q=' + area.latitude + ',' + area.longitude"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="maps-link"
                    >
                      <span>Google Maps</span>
                      <mat-icon>open_in_new</mat-icon>
                    </a>
                  </div>
                }

                @if (area.landmarkOrAddress) {
                  <div class="preview-landmark">
                    <mat-icon>storefront</mat-icon>
                    <span>{{ area.landmarkOrAddress }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Resource Allocation Section -->
          <div class="section-card">
            <div class="section-title">
              <mat-icon>payments</mat-icon>
              <span>2. Budget Allocation</span>
            </div>

            <div class="form-row two-col">
              <mat-form-field appearance="outline">
                <mat-label>Allocated Budget ($ / Local Currency)</mat-label>
                <input
                  matInput
                  type="number"
                  min="0"
                  step="0.01"
                  formControlName="budgetAllocated"
                  (input)="onBudgetAmountChange()"
                />
                @if (data.totalBudget) {
                  <mat-hint>Total Project Budget: {{ data.totalBudget | currency }}</mat-hint>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Budget Allocation %</mat-label>
                <input
                  matInput
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  formControlName="budgetPercentage"
                  (input)="onBudgetPercentageChange()"
                />
                <span matSuffix>%</span>
                <mat-hint>Percentage of total project budget</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <!-- Beneficiary Target Breakdown -->
          <div class="section-card">
            <div class="section-title">
              <mat-icon>groups</mat-icon>
              <span>3. Target Beneficiary Demographics</span>
            </div>

            <div class="demographics-grid">
              <!-- Direct Beneficiaries -->
              <div class="demo-group">
                <div class="group-header">
                  <strong>Direct Beneficiaries</strong>
                  <span class="group-total">Total: {{ totalDirect() }}</span>
                </div>
                <div class="form-row two-col">
                  <mat-form-field appearance="outline">
                    <mat-label>Male</mat-label>
                    <input matInput type="number" min="0" formControlName="directBeneficiariesMale" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Female</mat-label>
                    <input matInput type="number" min="0" formControlName="directBeneficiariesFemale" />
                  </mat-form-field>
                </div>
              </div>

              <!-- Indirect Beneficiaries -->
              <div class="demo-group">
                <div class="group-header">
                  <strong>Indirect Beneficiaries</strong>
                  <span class="group-total">Total: {{ totalIndirect() }}</span>
                </div>
                <div class="form-row two-col">
                  <mat-form-field appearance="outline">
                    <mat-label>Male</mat-label>
                    <input matInput type="number" min="0" formControlName="indirectBeneficiariesMale" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Female</mat-label>
                    <input matInput type="number" min="0" formControlName="indirectBeneficiariesFemale" />
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || submitting() || loadingAreas()"
        >
          @if (submitting()) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            <span>Allocate Area</span>
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e2e8f0;

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .header-icon {
          color: #2563eb;
          font-size: 26px;
          width: 26px;
          height: 26px;
        }

        h2 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
        }

        .header-subtitle {
          font-size: 0.8rem;
          color: #64748b;
        }
      }
    }

    .dialog-content {
      padding: 20px 24px;
      max-height: 75vh;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px;
      color: #64748b;
    }

    .section-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        color: #1e293b;

        mat-icon {
          color: #2563eb;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .form-row {
      display: grid;
      gap: 16px;
      width: 100%;

      &.two-col {
        grid-template-columns: 1fr 1fr;
      }
    }

    .area-preview {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .preview-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .preview-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .preview-name {
          color: #0f172a;
          font-size: 0.95rem;
        }

        .preview-code {
          color: #64748b;
          font-family: monospace;
          font-size: 0.8rem;
        }
      }

      .preview-gps {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: #334155;

        .gps-icon {
          color: #ea580c;
          font-size: 16px;
          width: 16px;
          height: 16px;
        }

        .preview-tag {
          font-size: 0.725rem;
          color: #64748b;
        }

        .maps-link {
          margin-left: auto;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          font-size: 0.75rem;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }
      }

      .preview-landmark {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.775rem;
        color: #475569;

        mat-icon {
          font-size: 15px;
          width: 15px;
          height: 15px;
          color: #94a3b8;
        }
      }
    }

    .demographics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      .demo-group {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          strong {
            font-size: 0.825rem;
            color: #1e293b;
          }

          .group-total {
            font-size: 0.75rem;
            font-weight: 600;
            color: #2563eb;
          }
        }
      }
    }

    .dialog-actions {
      padding: 12px 24px 20px;
      border-top: 1px solid #e2e8f0;
      gap: 12px;
    }
  `],
})
export class AllocateInterventionAreaDialogComponent implements OnInit {
  form: FormGroup;
  submitting = signal(false);
  loadingAreas = signal(false);

  allAreas = signal<InterventionAreaDto[]>([]);
  selectedRegionId: string | null = null;
  selectedZoneId: string | null = null;
  selectedWoredaId: string | null = null;

  readonly selectedArea = signal<InterventionAreaDto | null>(null);

  readonly regions = computed(() =>
    this.allAreas().filter((a) => a.areaType === 'Region' || a.level === 1)
  );

  readonly availableZones = computed(() => {
    if (!this.selectedRegionId) return [];
    return this.allAreas().filter(
      (a) => (a.areaType === 'Zone' || a.level === 2) && a.parentId === this.selectedRegionId
    );
  });

  readonly availableWoredas = computed(() => {
    if (!this.selectedZoneId) return [];
    return this.allAreas().filter(
      (a) => (a.areaType === 'Woreda' || a.level === 3) && a.parentId === this.selectedZoneId
    );
  });

  readonly selectableAreas = computed(() => {
    const all = this.allAreas();
    if (this.selectedWoredaId) {
      // Return kebeles/sites under this woreda + the woreda itself
      const children = all.filter((a) => a.parentId === this.selectedWoredaId);
      const parentWoreda = all.filter((a) => a.id === this.selectedWoredaId);
      return [...parentWoreda, ...children];
    }
    if (this.selectedZoneId) {
      return all.filter((a) => a.parentId === this.selectedZoneId || a.id === this.selectedZoneId);
    }
    if (this.selectedRegionId) {
      return all.filter((a) => a.parentId === this.selectedRegionId || a.id === this.selectedRegionId);
    }
    return all;
  });

  readonly totalDirect = computed(() => {
    const m = Number(this.form?.get('directBeneficiariesMale')?.value || 0);
    const f = Number(this.form?.get('directBeneficiariesFemale')?.value || 0);
    return m + f;
  });

  readonly totalIndirect = computed(() => {
    const m = Number(this.form?.get('indirectBeneficiariesMale')?.value || 0);
    const f = Number(this.form?.get('indirectBeneficiariesFemale')?.value || 0);
    return m + f;
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AllocateInterventionAreaDialogComponent>,
    private readonly areaService: InterventionAreaService,
    @Inject(MAT_DIALOG_DATA) public readonly data: AllocateInterventionAreaDialogData
  ) {
    this.form = this.fb.group({
      interventionAreaId: ['', [Validators.required]],
      budgetAllocated: [0, [Validators.min(0)]],
      budgetPercentage: [0, [Validators.min(0), Validators.max(100)]],
      directBeneficiariesMale: [0, [Validators.min(0)]],
      directBeneficiariesFemale: [0, [Validators.min(0)]],
      indirectBeneficiariesMale: [0, [Validators.min(0)]],
      indirectBeneficiariesFemale: [0, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.loadingAreas.set(true);
    this.areaService.listInterventionAreas(true).subscribe({
      next: (areas: InterventionAreaDto[]) => {
        this.allAreas.set(areas);
        this.loadingAreas.set(false);
      },
      error: () => {
        this.loadingAreas.set(false);
      },
    });
  }

  isAlreadyAllocated(areaId: string): boolean {
    return this.data.allocatedAreaIds?.includes(areaId) ?? false;
  }

  onRegionChange(regionId: string | null): void {
    this.selectedRegionId = regionId;
    this.selectedZoneId = null;
    this.selectedWoredaId = null;
  }

  onZoneChange(zoneId: string | null): void {
    this.selectedZoneId = zoneId;
    this.selectedWoredaId = null;
  }

  onWoredaChange(woredaId: string | null): void {
    this.selectedWoredaId = woredaId;
  }

  onAreaSelected(areaId: string): void {
    const found = this.allAreas().find((a) => a.id === areaId);
    this.selectedArea.set(found || null);
  }

  onBudgetAmountChange(): void {
    const amount = Number(this.form.get('budgetAllocated')?.value || 0);
    if (this.data.totalBudget && this.data.totalBudget > 0) {
      const pct = Number(((amount / this.data.totalBudget) * 100).toFixed(2));
      this.form.patchValue({ budgetPercentage: Math.min(100, pct) }, { emitEvent: false });
    }
  }

  onBudgetPercentageChange(): void {
    const pct = Number(this.form.get('budgetPercentage')?.value || 0);
    if (this.data.totalBudget && this.data.totalBudget > 0) {
      const amount = Number(((pct / 100) * this.data.totalBudget).toFixed(2));
      this.form.patchValue({ budgetAllocated: amount }, { emitEvent: false });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;

    const request: AllocateInterventionAreaRequest = {
      projectId: this.data.projectId,
      interventionAreaId: val.interventionAreaId,
      budgetAllocated: Number(val.budgetAllocated) || 0,
      budgetPercentage: Number(val.budgetPercentage) || 0,
      directBeneficiariesMale: Number(val.directBeneficiariesMale) || 0,
      directBeneficiariesFemale: Number(val.directBeneficiariesFemale) || 0,
      indirectBeneficiariesMale: Number(val.indirectBeneficiariesMale) || 0,
      indirectBeneficiariesFemale: Number(val.indirectBeneficiariesFemale) || 0,
    };

    this.submitting.set(true);
    this.areaService.allocateInterventionArea(request).subscribe({
      next: (_res: { id: string }) => {
        this.submitting.set(false);
        this.dialogRef.close(true);
      },
      error: (_err: unknown) => {
        this.submitting.set(false);
      },
    });
  }
}
