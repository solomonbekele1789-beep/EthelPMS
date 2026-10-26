import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <mat-chip [class]="'status-' + status" [disableRipple]="true">
      {{ label || status }}
    </mat-chip>
  `,
  styles: [`
    .status-active, .status-approved { background: #dcfce7; color: #166534; }
    .status-draft, .status-pending { background: #fef9c3; color: #854d0e; }
    .status-rejected, .status-inactive { background: #fecaca; color: #991b1b; }
    .status-completed, .status-closed { background: #dbeafe; color: #1e40af; }
    .status-in_progress { background: #e0e7ff; color: #3730a3; }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() label?: string;
}
