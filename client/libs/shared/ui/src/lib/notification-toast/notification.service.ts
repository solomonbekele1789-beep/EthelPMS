import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ToastType } from './notification-toast.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: [`toast-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error', 6000); }
  warning(message: string): void { this.show(message, 'warning', 5000); }
  info(message: string): void { this.show(message, 'info'); }
}
