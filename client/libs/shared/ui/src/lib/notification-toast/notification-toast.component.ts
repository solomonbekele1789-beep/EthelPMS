import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="toast" [class]="'toast-' + type">
      <mat-icon>{{ iconMap[type] }}</mat-icon>
      <span class="toast-message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .toast {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px;
    }
    .toast-success mat-icon { color: #22c55e; }
    .toast-error mat-icon { color: #ef4444; }
    .toast-warning mat-icon { color: #f59e0b; }
    .toast-info mat-icon { color: #3b82f6; }
    .toast-message { font-size: 14px; }
  `]
})
export class NotificationToastComponent {
  @Input() message = '';
  @Input() type: ToastType = 'info';

  readonly iconMap: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
}
