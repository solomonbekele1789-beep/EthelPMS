import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (overlay) {
      <div class="spinner-overlay">
        <mat-spinner [diameter]="diameter"></mat-spinner>
        @if (message) { <p class="spinner-message">{{ message }}</p> }
      </div>
    } @else {
      <div class="spinner-inline">
        <mat-spinner [diameter]="diameter"></mat-spinner>
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.3); z-index: 1000;
    }
    .spinner-inline { display: flex; justify-content: center; padding: 24px; }
    .spinner-message { margin-top: 16px; color: white; font-size: 14px; }
  `]
})
export class LoadingSpinnerComponent {
  @Input() overlay = false;
  @Input() diameter = 40;
  @Input() message?: string;
}
