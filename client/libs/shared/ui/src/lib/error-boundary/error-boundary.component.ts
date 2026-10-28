import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @if (hasError()) {
      <div class="error-boundary">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <button mat-flat-button color="primary" (click)="retry()">
          <mat-icon>refresh</mat-icon>
          Retry
        </button>
      </div>
    } @else {
      <ng-content></ng-content>
    }
  `,
  styles: [`
    .error-boundary {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; text-align: center;
      border: 1px dashed #ef4444; border-radius: 8px;
      background: #fef2f2;
    }
    .error-icon { font-size: 48px; height: 48px; width: 48px; color: #ef4444; }
    h3 { margin: 16px 0 8px; color: #991b1b; }
    p { color: #6b7280; margin-bottom: 24px; }
  `]
})
export class ErrorBoundaryComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'An unexpected error occurred. Please try again.';
  @Output() retryClick = new EventEmitter<void>();

  readonly hasError = signal(false);

  showError(): void {
    this.hasError.set(true);
  }

  retry(): void {
    this.hasError.set(false);
    this.retryClick.emit();
  }
}
