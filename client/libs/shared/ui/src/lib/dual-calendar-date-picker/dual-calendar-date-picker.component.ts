import { Component, Input, Output, EventEmitter, forwardRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CalendarService, ETHIOPIAN_MONTHS_EN, EthiopianDate } from '@ethelpms/shared/core';

@Component({
  selector: 'app-dual-calendar-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DualCalendarDatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="dual-calendar-wrapper">
      <div class="dual-calendar-header">
        <span class="field-label">{{ label }}</span>
        <mat-button-toggle-group
          [value]="calendarMode()"
          (change)="calendarMode.set($event.value)"
          aria-label="Calendar system"
          class="calendar-toggle">
          <mat-button-toggle value="gregorian">GC</mat-button-toggle>
          <mat-button-toggle value="ethiopian">EC</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (calendarMode() === 'gregorian') {
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ label }} (Gregorian)</mat-label>
          <input
            matInput
            type="date"
            [disabled]="disabled"
            [ngModel]="gregorianIso()"
            (ngModelChange)="onGregorianChange($event)" />
          @if (ethiopianPreview()) {
            <mat-hint>EC: {{ ethiopianPreview() }}</mat-hint>
          }
        </mat-form-field>
      } @else {
        <div class="ethiopian-inputs">
          <mat-form-field appearance="outline">
            <mat-label>Month (EC)</mat-label>
            <mat-select [disabled]="disabled" [ngModel]="ethDate().month" (ngModelChange)="onEthPartChange('month', $event)">
              @for (m of ethMonths; track m; let idx = $index) {
                <mat-option [value]="idx + 1">{{ m }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Day</mat-label>
            <input
              matInput
              type="number"
              min="1"
              [max]="maxEthDays()"
              [disabled]="disabled"
              [ngModel]="ethDate().day"
              (ngModelChange)="onEthPartChange('day', +$event)" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Year (EC)</mat-label>
            <input
              matInput
              type="number"
              min="1900"
              max="2100"
              [disabled]="disabled"
              [ngModel]="ethDate().year"
              (ngModelChange)="onEthPartChange('year', +$event)" />
          </mat-form-field>
        </div>
        @if (gregorianIso()) {
          <div class="conversion-hint">GC: {{ gregorianIso() }}</div>
        }
      }
    </div>
  `,
  styles: [`
    .dual-calendar-wrapper { display: flex; flex-direction: column; gap: 6px; }
    .dual-calendar-header { display: flex; justify-content: space-between; align-items: center; }
    .field-label { font-size: 13px; font-weight: 500; }
    .full-width { width: 100%; }
    .ethiopian-inputs { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; }
    .conversion-hint { font-size: 12px; color: var(--text-secondary, #666); margin-top: -8px; }
  `],
})
export class DualCalendarDatePickerComponent implements ControlValueAccessor {
  private readonly calendar = inject(CalendarService);

  @Input() label = 'Date';
  @Input() defaultCalendar: 'gregorian' | 'ethiopian' = 'gregorian';
  @Output() dateChange = new EventEmitter<Date | null>();

  readonly ethMonths = ETHIOPIAN_MONTHS_EN;
  readonly calendarMode = signal<'gregorian' | 'ethiopian'>('gregorian');
  readonly selectedDate = signal<Date | null>(null);
  disabled = false;

  readonly ethDate = computed<EthiopianDate>(() => {
    const d = this.selectedDate() ?? new Date();
    return this.calendar.toEthiopian(d);
  });

  readonly maxEthDays = computed(() => {
    const e = this.ethDate();
    return this.calendar.daysInEthiopianMonth(e.year, e.month);
  });

  readonly gregorianIso = computed(() => {
    const d = this.selectedDate();
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  readonly ethiopianPreview = computed(() => {
    const d = this.selectedDate();
    if (!d) return '';
    return this.calendar.formatEthiopian(this.calendar.toEthiopian(d), 'en');
  });

  private onChange: (value: Date | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: Date | string | null): void {
    if (!value) {
      this.selectedDate.set(null);
      return;
    }
    const parsed = value instanceof Date ? value : new Date(value);
    this.selectedDate.set(Number.isNaN(parsed.getTime()) ? null : parsed);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onGregorianChange(iso: string): void {
    this.onTouched();
    if (!iso) {
      this.selectedDate.set(null);
      this.onChange(null);
      this.dateChange.emit(null);
      return;
    }
    const [y, m, d] = iso.split('-').map(Number);
    const next = new Date(y, m - 1, d);
    this.selectedDate.set(next);
    this.onChange(next);
    this.dateChange.emit(next);
  }

  onEthPartChange(part: 'year' | 'month' | 'day', value: number): void {
    if (!value || Number.isNaN(value)) return;
    this.onTouched();
    const current = { ...this.ethDate(), [part]: value };
    const maxDay = this.calendar.daysInEthiopianMonth(current.year, current.month);
    current.day = Math.max(1, Math.min(maxDay, current.day));
    const greg = this.calendar.toGregorian(current);
    this.selectedDate.set(greg);
    this.onChange(greg);
    this.dateChange.emit(greg);
  }
}
