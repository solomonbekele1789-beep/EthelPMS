import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [MatFormFieldModule],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <ng-content></ng-content>
      @if (control?.invalid && control?.touched) {
        <mat-error>{{ errorMessage }}</mat-error>
      }
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
    </mat-form-field>
  `,
  styles: [`.full-width { width: 100%; }`]
})
export class FormFieldComponent {
  @Input({ required: true }) label!: string;
  @Input() control?: AbstractControl;
  @Input() hint?: string;

  get errorMessage(): string {
    if (!this.control?.errors) return '';
    if (this.control.errors['required']) return `${this.label} is required`;
    if (this.control.errors['email']) return 'Invalid email address';
    if (this.control.errors['minlength']) {
      const min = this.control.errors['minlength'].requiredLength;
      return `Minimum ${min} characters`;
    }
    if (this.control.errors['maxlength']) {
      const max = this.control.errors['maxlength'].requiredLength;
      return `Maximum ${max} characters`;
    }
    if (this.control.errors['custom']) return this.control.errors['custom'];
    return 'Invalid value';
  }
}
