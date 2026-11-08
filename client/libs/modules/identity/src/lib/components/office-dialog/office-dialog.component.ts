import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OfficeType, OfficeListItemDto, OfficeDto, CreateOfficeRequest, UpdateOfficeRequest } from '../../models/office.model';
import { OfficeService } from '../../services/office.service';

export interface OfficeDialogData {
  officeType: OfficeType;
  office?: OfficeListItemDto | OfficeDto;
  parentOffices: OfficeListItemDto[];
}

@Component({
  selector: 'ethel-office-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-title">
        <mat-icon class="type-icon">{{ getTypeIcon() }}</mat-icon>
        <h2>{{ dialogTitle }}</h2>
      </div>
      <button mat-icon-button (click)="onCancel()" type="button" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSave()">
      <mat-dialog-content class="dialog-content">
        @if (errorMessage()) {
          <div class="alert-box error-alert">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <div class="form-grid">
          <!-- Office Name -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ getNameLabel() }} *</mat-label>
            <input matInput formControlName="name" [placeholder]="'e.g. ' + getNamePlaceholder()" />
            @if (form.controls['name'].hasError('required')) {
              <mat-error>{{ getNameLabel() }} is required</mat-error>
            }
          </mat-form-field>

          <!-- Office Code / ID -->
          <mat-form-field appearance="outline" [class.full-width]="data.officeType === 'HeadOffice'">
            <mat-label>{{ getIdLabel() }} *</mat-label>
            <input matInput formControlName="code" [placeholder]="'e.g. ' + getIdPlaceholder()" />
            @if (form.controls['code'].hasError('required')) {
              <mat-error>{{ getIdLabel() }} is required</mat-error>
            }
          </mat-form-field>

          <!-- Parent Office Dropdown (Area Office & Branch Office) -->
          @if (data.officeType === 'AreaOffice') {
            <mat-form-field appearance="outline">
              <mat-label>Head Office *</mat-label>
              <mat-select formControlName="parentOfficeId" (selectionChange)="onParentSelected($event.value)">
                <mat-option value="">-- Select Head Office --</mat-option>
                @for (ho of data.parentOffices; track ho.id) {
                  <mat-option [value]="ho.id">
                    {{ ho.name }} (ID: {{ ho.code }})
                  </mat-option>
                }
              </mat-select>
              @if (form.controls['parentOfficeId'].hasError('required')) {
                <mat-error>Head Office is required for Area Office</mat-error>
              }
            </mat-form-field>
          } @else if (data.officeType === 'BranchOffice') {
            <mat-form-field appearance="outline">
              <mat-label>Area Office *</mat-label>
              <mat-select formControlName="parentOfficeId" (selectionChange)="onParentSelected($event.value)">
                <mat-option value="">-- Select Area Office --</mat-option>
                @for (ao of data.parentOffices; track ao.id) {
                  <mat-option [value]="ao.id">
                    {{ ao.name }} (ID: {{ ao.code }})
                  </mat-option>
                }
              </mat-select>
              @if (form.controls['parentOfficeId'].hasError('required')) {
                <mat-error>Area Office is required for Branch Office</mat-error>
              }
            </mat-form-field>
          }

          <!-- Parent Code Info Banner -->
          @if (selectedParentCode()) {
            <div class="parent-info-chip full-width">
              <mat-icon>link</mat-icon>
              <span>Associated {{ data.officeType === 'AreaOffice' ? 'Head Office' : 'Area Office' }} ID: <strong>{{ selectedParentCode() }}</strong></span>
            </div>
          }

          <!-- Location and GPS Capture Row -->
          <div class="location-container full-width">
            <mat-form-field appearance="outline" class="location-field">
              <mat-label>{{ getLocationLabel() }}</mat-label>
              <input matInput formControlName="locationAddress" placeholder="Physical address, city, or coordinates" />
              <mat-icon matPrefix>place</mat-icon>
            </mat-form-field>

            <button
              mat-stroked-button
              type="button"
              class="gps-btn"
              [disabled]="gpsLoading()"
              (click)="captureGpsLocation()"
              matTooltip="Capture coordinates from your device's GPS"
            >
              @if (gpsLoading()) {
                <mat-spinner diameter="18"></mat-spinner>
                <span>Acquiring GPS...</span>
              } @else {
                <mat-icon>my_location</mat-icon>
                <span>Capture GPS</span>
              }
            </button>
          </div>

          <!-- GPS Coordinates feedback -->
          @if (gpsStatusMessage()) {
            <div class="alert-box gps-success full-width">
              <mat-icon>check_circle</mat-icon>
              <span>{{ gpsStatusMessage() }}</span>
            </div>
          }
          @if (gpsErrorMessage()) {
            <div class="alert-box gps-warning full-width">
              <mat-icon>warning</mat-icon>
              <span>{{ gpsErrorMessage() }}</span>
            </div>
          }

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ getDescriptionLabel() }}</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Brief notes or coverage details"></textarea>
          </mat-form-field>

          <!-- Active/Inactive Checkbox (Area and Branch offices) -->
          @if (data.officeType !== 'HeadOffice') {
            <div class="status-checkbox full-width">
              <mat-checkbox formControlName="isActive" color="primary">
                <strong>Active Office</strong>
                <span class="checkbox-hint">Office is operational and accepts user/project assignments</span>
              </mat-checkbox>
            </div>
          }
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()" [disabled]="submitting()">
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || submitting()"
        >
          @if (submitting()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
            <span>{{ isEditMode ? 'Save Changes' : (getSubmitButtonLabel()) }}</span>
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-width: 320px;
      max-width: 600px;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .header-title h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
    }
    .type-icon {
      color: #2563eb;
    }
    .dialog-content {
      padding: 1.25rem 1.5rem;
      max-height: 75vh;
      overflow-y: auto;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem 1rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .location-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .location-field {
      flex: 1;
      margin-bottom: 0;
    }
    .gps-btn {
      height: 48px;
      margin-top: -16px;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      white-space: nowrap;
      border-color: #3b82f6;
      color: #2563eb;
      font-weight: 500;
    }
    .gps-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .alert-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }
    .error-alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }
    .gps-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
    }
    .gps-warning {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #b45309;
    }
    .parent-info-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f1f5f9;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      color: #334155;
      margin-bottom: 0.5rem;
    }
    .parent-info-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #2563eb;
    }
    .status-checkbox {
      margin-top: 0.25rem;
      margin-bottom: 0.5rem;
    }
    .checkbox-hint {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      margin-left: 1.5rem;
    }
    .dialog-actions {
      padding: 0.75rem 1.5rem 1.25rem;
      border-top: 1px solid #e2e8f0;
      margin: 0;
    }
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .location-container {
        flex-direction: column;
        align-items: stretch;
      }
      .gps-btn {
        margin-top: 0;
        margin-bottom: 1rem;
        justify-content: center;
      }
    }
  `,
})
export class OfficeDialogComponent implements OnInit {
  readonly isEditMode: boolean;
  readonly dialogTitle: string;

  readonly form: FormGroup;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly gpsLoading = signal(false);
  readonly gpsStatusMessage = signal<string | null>(null);
  readonly gpsErrorMessage = signal<string | null>(null);

  readonly selectedParentCode = signal<string | null>(null);

  constructor(
    private readonly fb: FormBuilder,
    private readonly officeService: OfficeService,
    private readonly dialogRef: MatDialogRef<OfficeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: OfficeDialogData
  ) {
    this.isEditMode = !!data.office;

    // Determine Title
    if (this.isEditMode) {
      this.dialogTitle = `Edit ${this.getTypeTitle()}`;
    } else {
      if (data.officeType === 'HeadOffice') {
        this.dialogTitle = 'Create Head Office';
      } else if (data.officeType === 'AreaOffice') {
        this.dialogTitle = 'Create New Area Office';
      } else {
        this.dialogTitle = 'Add New Branch Office';
      }
    }

    const parentValidators = data.officeType !== 'HeadOffice' ? [Validators.required] : [];

    this.form = this.fb.group({
      name: [data.office?.name ?? '', [Validators.required, Validators.maxLength(200)]],
      code: [data.office?.code ?? '', [Validators.required, Validators.maxLength(50)]],
      parentOfficeId: [data.office?.parentOfficeId ?? '', parentValidators],
      locationAddress: [data.office?.locationAddress ?? '', [Validators.maxLength(500)]],
      latitude: [data.office?.latitude ?? null],
      longitude: [data.office?.longitude ?? null],
      description: [data.office?.description ?? '', [Validators.maxLength(2000)]],
      isActive: [data.office ? (data.office.isActive ?? true) : true],
    });
  }

  ngOnInit(): void {
    if (this.data.office?.parentOfficeId) {
      this.onParentSelected(this.data.office.parentOfficeId);
    }
  }

  getTypeTitle(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'Head Office';
      case 'AreaOffice': return 'Area Office';
      case 'BranchOffice': return 'Branch Office';
    }
  }

  getTypeIcon(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'domain';
      case 'AreaOffice': return 'hub';
      case 'BranchOffice': return 'account_tree';
    }
  }

  getNameLabel(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'Head Office Name';
      case 'AreaOffice': return 'Area Office Name';
      case 'BranchOffice': return 'Branch Office Name';
    }
  }

  getNamePlaceholder(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'Addis Ababa Central Head Office';
      case 'AreaOffice': return 'Hawassa Area Hub';
      case 'BranchOffice': return 'Dilla Project Field Office';
    }
  }

  getIdLabel(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'Head Office ID';
      case 'AreaOffice': return 'Area Office ID';
      case 'BranchOffice': return 'Branch Office ID';
    }
  }

  getIdPlaceholder(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'HQ-01';
      case 'AreaOffice': return 'AO-HAW';
      case 'BranchOffice': return 'BO-DIL';
    }
  }

  getLocationLabel(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'Head Office Location';
      case 'AreaOffice': return 'Area Office Location';
      case 'BranchOffice': return 'Branch Office Location';
    }
  }

  getDescriptionLabel(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'Head Office Description';
      case 'AreaOffice': return 'Area Office Description';
      case 'BranchOffice': return 'Branch Office Description';
    }
  }

  getSubmitButtonLabel(): string {
    switch (this.data.officeType) {
      case 'HeadOffice': return 'Create Head Office';
      case 'AreaOffice': return 'Create Area Office';
      case 'BranchOffice': return 'Add Branch Office';
    }
  }

  onParentSelected(parentId: string): void {
    if (!parentId) {
      this.selectedParentCode.set(null);
      return;
    }
    const found = this.data.parentOffices.find(o => o.id === parentId);
    this.selectedParentCode.set(found?.code ?? null);
  }

  captureGpsLocation(): void {
    if (!('geolocation' in navigator)) {
      this.gpsErrorMessage.set('Geolocation is not supported by your browser.');
      return;
    }

    this.gpsLoading.set(true);
    this.gpsErrorMessage.set(null);
    this.gpsStatusMessage.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.gpsLoading.set(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const accuracy = Math.round(position.coords.accuracy);

        this.form.patchValue({
          latitude: lat,
          longitude: lng,
        });

        const currentLoc = this.form.get('locationAddress')?.value;
        if (!currentLoc) {
          this.form.patchValue({ locationAddress: `${lat}, ${lng}` });
        }

        this.gpsStatusMessage.set(`GPS captured: Lat ${lat}, Long ${lng} (Accuracy: ±${accuracy}m)`);
      },
      (error) => {
        this.gpsLoading.set(false);
        let message = 'Unable to capture location coordinates.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission was denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable from your device.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        }
        this.gpsErrorMessage.set(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const val = this.form.getRawValue();

    if (this.isEditMode && this.data.office) {
      const request: UpdateOfficeRequest = {
        name: val.name.trim(),
        code: val.code.trim(),
        officeType: this.data.officeType,
        parentOfficeId: val.parentOfficeId || undefined,
        locationAddress: val.locationAddress?.trim() || undefined,
        latitude: val.latitude ?? undefined,
        longitude: val.longitude ?? undefined,
        description: val.description?.trim() || undefined,
        isActive: val.isActive ?? true,
      };

      this.officeService.updateOffice(this.data.office.id, request).subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.dialogRef.close({ saved: true, office: res });
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.error?.message || err.message || 'Failed to update office.');
        },
      });
    } else {
      const request: CreateOfficeRequest = {
        name: val.name.trim(),
        code: val.code.trim(),
        officeType: this.data.officeType,
        parentOfficeId: val.parentOfficeId || undefined,
        locationAddress: val.locationAddress?.trim() || undefined,
        latitude: val.latitude ?? undefined,
        longitude: val.longitude ?? undefined,
        description: val.description?.trim() || undefined,
        isActive: val.isActive ?? true,
      };

      this.officeService.createOffice(request).subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.dialogRef.close({ saved: true, office: res });
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.error?.message || err.message || 'Failed to create office.');
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false });
  }
}
