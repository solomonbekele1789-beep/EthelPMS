import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar-initials',
  standalone: true,
  template: `
    <div class="avatar"
         [style.width.px]="size"
         [style.height.px]="size"
         [style.font-size.px]="size * 0.4"
         [style.line-height.px]="size"
         [style.background-color]="backgroundColor">
      {{ initials }}
    </div>
  `,
  styles: [`
    .avatar {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%; color: white; font-weight: 600;
      text-transform: uppercase; user-select: none;
    }
  `]
})
export class AvatarInitialsComponent {
  @Input() firstName = '';
  @Input() lastName = '';
  @Input() size = 40;

  get initials(): string {
    const f = this.firstName?.charAt(0) || '';
    const l = this.lastName?.charAt(0) || '';
    return (f + l) || '?';
  }

  get backgroundColor(): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
      '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
    ];
    const name = (this.firstName || '') + (this.lastName || '');
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
