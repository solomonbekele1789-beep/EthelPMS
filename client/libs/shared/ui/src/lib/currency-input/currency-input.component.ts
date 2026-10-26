import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-currency-input',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatSelectModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CurrencyInputComponent),
    multi: true
  }],
  template: `
    <div class="currency-row">
      <mat-form-field appearance="outline" class="currency-code">
        <mat-select [(ngModel)]="currencyCode" (ngModelChange)="emitChange()">
          @for (c of currencies; track c) {
            <mat-option [value]="c">{{ c }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="currency-amount">
        <input matInput type="number" [placeholder]="placeholder"
               [(ngModel)]="amount" (ngModelChange)="emitChange()" step="0.01">
      </mat-form-field>
    </div>
  `,
  styles: [`
    .currency-row { display: flex; gap: 8px; }
    .currency-code { width: 100px; }
    .currency-amount { flex: 1; }
  `]
})
export class CurrencyInputComponent implements ControlValueAccessor {
  @Input() placeholder = '0.00';
  @Input() currencies = ['ETB', 'USD', 'EUR', 'GBP'];

  amount: number | null = null;
  currencyCode = 'ETB';

  private onChange: (value: { amount: number; currency: string }) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: { amount: number; currency: string }): void {
    if (val) { this.amount = val.amount; this.currencyCode = val.currency; }
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  emitChange(): void {
    this.onChange({ amount: this.amount ?? 0, currency: this.currencyCode });
  }
}
