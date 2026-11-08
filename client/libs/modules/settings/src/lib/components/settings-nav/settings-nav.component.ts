import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ethel-settings-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="settings-nav-bar" aria-label="Settings navigation">
      <a routerLink="/settings/system" routerLinkActive="active" class="settings-nav-item">
        <mat-icon>tune</mat-icon>
        <span>System Settings</span>
      </a>
      <a routerLink="/settings/org" routerLinkActive="active" class="settings-nav-item">
        <mat-icon>business</mat-icon>
        <span>Organization</span>
      </a>
      <a routerLink="/settings/intervention-areas" routerLinkActive="active" class="settings-nav-item">
        <mat-icon>share_location</mat-icon>
        <span>Intervention Areas</span>
      </a>
      <a routerLink="/settings/approvals" routerLinkActive="active" class="settings-nav-item">
        <mat-icon>verified</mat-icon>
        <span>Approval Configs</span>
      </a>
      <a routerLink="/settings/alerts" routerLinkActive="active" class="settings-nav-item">
        <mat-icon>notifications_active</mat-icon>
        <span>Alert Thresholds</span>
      </a>
    </nav>
  `,
  styles: [`
    .settings-nav-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      flex-wrap: wrap;
    }
    .settings-nav-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &:hover {
        background: #f1f5f9;
        color: #1e293b;
      }

      &.active {
        background: #eff6ff;
        color: #2563eb;
        font-weight: 600;

        mat-icon {
          color: #2563eb;
        }
      }
    }
  `],
})
export class SettingsNavComponent {}
