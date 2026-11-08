import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { InterventionAreaDto } from '@ethelpms/modules/projects';

export interface InterventionAreaDialogData {
  area?: InterventionAreaDto;
  parentArea?: InterventionAreaDto;
  allAreas?: InterventionAreaDto[];
  defaultAreaType?: string;
}

@Component({
  selector: 'ethel-intervention-area-dialog',
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
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-title">
        <mat-icon class="header-icon">place</mat-icon>
        <h2>{{ isEdit ? 'Edit Intervention Area' : 'New Intervention Area' }}</h2>
      </div>
      <button mat-icon-button (click)="onCancel()" type="button" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        <p class="section-hint">
          Configure an administrative boundary or intervention site for project allocations and geospatial tracking.
        </p>

        <!-- Area Type & Parent Area -->
        <div class="form-row two-col">
          <mat-form-field appearance="outline">
            <mat-label>Administrative Tier / Area Type</mat-label>
            <mat-select formControlName="areaType" (selectionChange)="onAreaTypeChange($event.value)">
              @for (type of areaTypes; track type.value) {
                <mat-option [value]="type.value">
                  <div class="tier-option">
                    <span class="tier-badge tier-{{ type.value.toLowerCase() }}">{{ type.label }}</span>
                    <span class="tier-desc">Level {{ type.level }}</span>
                  </div>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Parent Area</mat-label>
            <mat-select formControlName="parentId">
              <mat-option [value]="null">-- None (Root Level) --</mat-option>
              @for (p of potentialParents; track p.id) {
                <mat-option [value]="p.id">
                  [{{ p.areaType }}] {{ p.name }} ({{ p.code }})
                </mat-option>
              }
            </mat-select>
            <mat-hint>The higher-level administrative area this belongs to</mat-hint>
          </mat-form-field>
        </div>

        <!-- Name & Code -->
        <div class="form-row two-col">
          <mat-form-field appearance="outline">
            <mat-label>Area Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Babile, Harar, Oromia" />
            @if (form.get('name')?.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Area Code / Identifier</mat-label>
            <input matInput formControlName="code" placeholder="e.g. ETH-OR-BAB-01" />
            @if (form.get('code')?.hasError('required')) {
              <mat-error>Code is required</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Geographic GPS Section -->
        <div class="gps-card">
          <div class="gps-card-header">
            <div class="gps-title">
              <mat-icon class="gps-icon">my_location</mat-icon>
              <div>
                <strong>Geospatial Coordinates & GPS</strong>
                <p class="gps-subtitle">Capture device GPS or enter manual coordinates (decimal degrees)</p>
              </div>
            </div>

            <button
              type="button"
              mat-flat-button
              color="primary"
              class="gps-btn"
              [disabled]="gpsAcquiring()"
              (click)="captureDeviceGps()"
            >
              @if (gpsAcquiring()) {
                <mat-spinner diameter="18"></mat-spinner>
                <span>Acquiring Fix...</span>
              } @else {
                <mat-icon>satellite_alt</mat-icon>
                <span>Capture Device GPS</span>
              }
            </button>
          </div>

          @if (gpsSuccessMessage()) {
            <div class="gps-alert success">
              <mat-icon>check_circle</mat-icon>
              <span>{{ gpsSuccessMessage() }}</span>
            </div>
          }

          @if (gpsErrorMessage()) {
            <div class="gps-alert error">
              <mat-icon>error_outline</mat-icon>
              <span>{{ gpsErrorMessage() }}</span>
            </div>
          }

          <div class="form-row three-col">
            <mat-form-field appearance="outline">
              <mat-label>Latitude (DD)</mat-label>
              <input
                matInput
                type="number"
                step="any"
                formControlName="latitude"
                placeholder="e.g. 9.0320"
                (input)="onManualCoordinateChange()"
              />
              <mat-hint>-90.0 to 90.0</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Longitude (DD)</mat-label>
              <input
                matInput
                type="number"
                step="any"
                formControlName="longitude"
                placeholder="e.g. 38.7470"
                (input)="onManualCoordinateChange()"
              />
              <mat-hint>-180.0 to 180.0</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>GPS Source</mat-label>
              <input matInput formControlName="gpsSource" readonly placeholder="Device or Manual" />
            </mat-form-field>
          </div>

          <div class="form-row two-col">
            <mat-form-field appearance="outline">
              <mat-label>Altitude (meters)</mat-label>
              <input matInput type="number" formControlName="altitude" placeholder="Optional" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>GPS Accuracy (meters)</mat-label>
              <input matInput type="number" formControlName="accuracy" placeholder="GPS error radius" />
            </mat-form-field>
          </div>

          <!-- Landmark / Physical Address -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Physical Landmark, Sector or Address</mat-label>
            <input
              matInput
              formControlName="landmarkOrAddress"
              placeholder="e.g. Near Babile Health Center, Sector 4, Administration Block"
            />
            <mat-hint>Specific visual landmark or local building for field teams</mat-hint>
          </mat-form-field>
        </div>

        <!-- Description -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Area Description & Context</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Key socio-economic context, geography, or program notes..."
          ></textarea>
        </mat-form-field>

        <!-- Status -->
        <div class="form-row status-row">
          <mat-slide-toggle formControlName="isActive" color="primary">
            Active Intervention Area
          </mat-slide-toggle>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
          @if (submitting()) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            {{ isEdit ? 'Update Area' : 'Save Area' }}
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
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
        }
      }
    }

    .dialog-content {
      padding: 20px 24px;
      max-height: 75vh;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-hint {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .form-row {
      display: grid;
      gap: 16px;
      width: 100%;

      &.two-col {
        grid-template-columns: 1fr 1fr;
      }

      &.three-col {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    .full-width {
      width: 100%;
    }

    .status-row {
      padding: 8px 0;
    }

    .tier-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .tier-desc {
        color: #94a3b8;
        font-size: 0.75rem;
      }
    }

    .tier-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;

      &.tier-country { background: #fef3c7; color: #92400e; }
      &.tier-region { background: #dbeafe; color: #1e40af; }
      &.tier-zone { background: #e0e7ff; color: #3730a3; }
      &.tier-woreda { background: #f3e8ff; color: #6b21a8; }
      &.tier-kebele { background: #dcfce7; color: #166534; }
      &.tier-site { background: #ffedd5; color: #9a3412; }
    }

    .gps-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .gps-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;

        .gps-title {
          display: flex;
          align-items: center;
          gap: 10px;

          .gps-icon {
            color: #2563eb;
            font-size: 24px;
            width: 24px;
            height: 24px;
          }

          strong {
            font-size: 0.95rem;
            color: #1e293b;
          }

          .gps-subtitle {
            margin: 0;
            font-size: 0.75rem;
            color: #64748b;
          }
        }

        .gps-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 8px;
        }
      }

      .gps-alert {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.8rem;

        &.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          mat-icon { color: #059669; font-size: 18px; width: 18px; height: 18px; }
        }

        &.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          mat-icon { color: #dc2626; font-size: 18px; width: 18px; height: 18px; }
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
export class InterventionAreaDialogComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  submitting = signal(false);
  gpsAcquiring = signal(false);
  gpsSuccessMessage = signal<string | null>(null);
  gpsErrorMessage = signal<string | null>(null);

  potentialParents: InterventionAreaDto[] = [];

  readonly areaTypes = [
    { label: 'Country', value: 'Country', level: 0 },
    { label: 'Region', value: 'Region', level: 1 },
    { label: 'Zone', value: 'Zone', level: 2 },
    { label: 'Woreda (District)', value: 'Woreda', level: 3 },
    { label: 'Kebele (Sub-district)', value: 'Kebele', level: 4 },
    { label: 'Site / Facility', value: 'Site', level: 5 },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<InterventionAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: InterventionAreaDialogData
  ) {
    this.isEdit = !!data.area;

    const initialType = data.area?.areaType || data.defaultAreaType || 'Region';
    const initialParentId = data.area?.parentId || data.parentArea?.id || null;

    this.form = this.fb.group({
      name: [data.area?.name || '', [Validators.required, Validators.maxLength(200)]],
      code: [data.area?.code || '', [Validators.required, Validators.maxLength(50)]],
      areaType: [initialType, [Validators.required]],
      parentId: [initialParentId],
      description: [data.area?.description || ''],
      latitude: [data.area?.latitude ?? null, [Validators.min(-90), Validators.max(90)]],
      longitude: [data.area?.longitude ?? null, [Validators.min(-180), Validators.max(180)]],
      altitude: [data.area?.altitude ?? null],
      accuracy: [data.area?.accuracy ?? null],
      gpsSource: [data.area?.gpsSource || (data.area?.latitude ? 'Manual' : '')],
      landmarkOrAddress: [data.area?.landmarkOrAddress || '', [Validators.maxLength(500)]],
      isActive: [data.area?.isActive !== false],
    });
  }

  ngOnInit(): void {
    this.updatePotentialParents();
  }

  onAreaTypeChange(selectedType: string): void {
    this.updatePotentialParents();
  }

  updatePotentialParents(): void {
    const all = this.data.allAreas || [];
    const currentId = this.data.area?.id;
    // Don't allow selecting oneself as parent
    this.potentialParents = all.filter((a) => a.id !== currentId);
  }

  onManualCoordinateChange(): void {
    const lat = this.form.get('latitude')?.value;
    const lng = this.form.get('longitude')?.value;
    if (lat !== null || lng !== null) {
      if (this.form.get('gpsSource')?.value !== 'Device') {
        this.form.patchValue({ gpsSource: 'Manual' });
      }
    }
  }

  captureDeviceGps(): void {
    this.gpsAcquiring.set(true);
    this.gpsSuccessMessage.set(null);
    this.gpsErrorMessage.set(null);

    if (!('geolocation' in navigator)) {
      this.gpsAcquiring.set(false);
      this.gpsErrorMessage.set('Geolocation is not supported by this browser/device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords;
        const lat = Number(coords.latitude.toFixed(6));
        const lng = Number(coords.longitude.toFixed(6));
        const alt = coords.altitude ? Number(coords.altitude.toFixed(1)) : null;
        const acc = coords.accuracy ? Number(coords.accuracy.toFixed(1)) : null;

        this.form.patchValue({
          latitude: lat,
          longitude: lng,
          altitude: alt,
          accuracy: acc,
          gpsSource: 'Device',
        });

        this.gpsAcquiring.set(false);
        this.gpsSuccessMessage.set(
          `GPS captured: Lat ${lat}, Lng ${lng} (accuracy ±${acc ?? '?'}m)`
        );
      },
      (error) => {
        this.gpsAcquiring.set(false);
        let errorMsg = 'Failed to acquire GPS fix.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied by user. Please enable GPS permission.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'GPS location unavailable. Please enter coordinates manually.';
            break;
          case error.TIMEOUT:
            errorMsg = 'GPS request timed out. Please retry or enter manually.';
            break;
        }
        this.gpsErrorMessage.set(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;

    const result = {
      name: val.name?.trim(),
      code: val.code?.trim().toUpperCase(),
      areaType: val.areaType,
      parentId: val.parentId || null,
      description: val.description?.trim() || null,
      latitude: val.latitude !== null && val.latitude !== '' ? Number(val.latitude) : null,
      longitude: val.longitude !== null && val.longitude !== '' ? Number(val.longitude) : null,
      altitude: val.altitude !== null && val.altitude !== '' ? Number(val.altitude) : null,
      accuracy: val.accuracy !== null && val.accuracy !== '' ? Number(val.accuracy) : null,
      gpsSource: val.gpsSource || null,
      landmarkOrAddress: val.landmarkOrAddress?.trim() || null,
      isActive: !!val.isActive,
    };

    this.dialogRef.close(result);
  }
}
