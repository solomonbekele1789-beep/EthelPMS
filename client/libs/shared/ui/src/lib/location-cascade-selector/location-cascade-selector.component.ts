import { Component, Input, Output, EventEmitter, OnInit, forwardRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '@ethelpms/shared/core';

export interface CascadeLocationItem {
  id: string;
  name: string;
  nameAmharic?: string;
  code?: string;
}

@Component({
  selector: 'app-location-cascade-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationCascadeSelectorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="location-cascade-grid">
      <mat-form-field appearance="outline">
        <mat-label>Region</mat-label>
        <mat-select [disabled]="disabled" [ngModel]="selectedRegionId()" (ngModelChange)="onRegionChange($event)">
          <mat-option [value]="null">-- Select Region --</mat-option>
          @for (r of regions(); track r.id) {
            <mat-option [value]="r.id">{{ r.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Zone</mat-label>
        <mat-select [disabled]="disabled || !selectedRegionId()" [ngModel]="selectedZoneId()" (ngModelChange)="onZoneChange($event)">
          <mat-option [value]="null">-- Select Zone --</mat-option>
          @for (z of zones(); track z.id) {
            <mat-option [value]="z.id">{{ z.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Woreda</mat-label>
        <mat-select [disabled]="disabled || !selectedZoneId()" [ngModel]="selectedWoredaId()" (ngModelChange)="onWoredaChange($event)">
          <mat-option [value]="null">-- Select Woreda --</mat-option>
          @for (w of woredas(); track w.id) {
            <mat-option [value]="w.id">{{ w.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (showKebele) {
        <mat-form-field appearance="outline">
          <mat-label>Kebele</mat-label>
          <mat-select [disabled]="disabled || !selectedWoredaId()" [ngModel]="selectedKebeleId()" (ngModelChange)="onKebeleChange($event)">
            <mat-option [value]="null">-- Select Kebele --</mat-option>
            @for (k of kebeles(); track k.id) {
              <mat-option [value]="k.id">{{ k.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
    </div>
  `,
  styles: [`
    .location-cascade-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
  `],
})
export class LocationCascadeSelectorComponent implements OnInit, ControlValueAccessor {
  private readonly api = inject(ApiService);

  @Input() showKebele = true;
  @Output() locationChange = new EventEmitter<string | null>();

  readonly regions = signal<CascadeLocationItem[]>([]);
  readonly zones = signal<CascadeLocationItem[]>([]);
  readonly woredas = signal<CascadeLocationItem[]>([]);
  readonly kebeles = signal<CascadeLocationItem[]>([]);

  readonly selectedRegionId = signal<string | null>(null);
  readonly selectedZoneId = signal<string | null>(null);
  readonly selectedWoredaId = signal<string | null>(null);
  readonly selectedKebeleId = signal<string | null>(null);
  disabled = false;

  private onChange: (val: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnInit(): void {
    this.api.get<CascadeLocationItem[]>('/locations/regions').subscribe({
      next: (list) => this.regions.set(list ?? []),
      error: () => this.regions.set([]),
    });
  }

  writeValue(value: string | null): void {
    if (!value) {
      this.selectedRegionId.set(null);
      this.selectedZoneId.set(null);
      this.selectedWoredaId.set(null);
      this.selectedKebeleId.set(null);
    }
  }

  registerOnChange(fn: (val: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRegionChange(regionId: string | null): void {
    this.onTouched();
    this.selectedRegionId.set(regionId);
    this.selectedZoneId.set(null);
    this.selectedWoredaId.set(null);
    this.selectedKebeleId.set(null);
    this.zones.set([]);
    this.woredas.set([]);
    this.kebeles.set([]);
    this.emitCurrentValue();

    if (regionId) {
      this.api.get<CascadeLocationItem[]>(`/locations/regions/${regionId}/zones`).subscribe({
        next: (list) => this.zones.set(list ?? []),
      });
    }
  }

  onZoneChange(zoneId: string | null): void {
    this.onTouched();
    this.selectedZoneId.set(zoneId);
    this.selectedWoredaId.set(null);
    this.selectedKebeleId.set(null);
    this.woredas.set([]);
    this.kebeles.set([]);
    this.emitCurrentValue();

    if (zoneId) {
      this.api.get<CascadeLocationItem[]>(`/locations/zones/${zoneId}/woredas`).subscribe({
        next: (list) => this.woredas.set(list ?? []),
      });
    }
  }

  onWoredaChange(woredaId: string | null): void {
    this.onTouched();
    this.selectedWoredaId.set(woredaId);
    this.selectedKebeleId.set(null);
    this.kebeles.set([]);
    this.emitCurrentValue();

    if (woredaId && this.showKebele) {
      this.api.get<CascadeLocationItem[]>(`/locations/woredas/${woredaId}/kebeles`).subscribe({
        next: (list) => this.kebeles.set(list ?? []),
      });
    }
  }

  onKebeleChange(kebeleId: string | null): void {
    this.onTouched();
    this.selectedKebeleId.set(kebeleId);
    this.emitCurrentValue();
  }

  private emitCurrentValue(): void {
    const deepest =
      this.selectedKebeleId() ??
      this.selectedWoredaId() ??
      this.selectedZoneId() ??
      this.selectedRegionId();
    this.onChange(deepest);
    this.locationChange.emit(deepest);
  }
}
