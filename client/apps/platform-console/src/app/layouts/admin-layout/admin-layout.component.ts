import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { AuthActions, selectUserFullName } from '@ethelpms/shared/core';
import { ThemeService } from '@ethelpms/shared/core';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  template: `
    <div class="admin-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="logo-icon material-symbols-outlined">admin_panel_settings</span>
          @if (!sidebarCollapsed()) {
            <span class="logo-text">Platform Console</span>
          }
          <button mat-icon-button class="collapse-btn" (click)="toggleSidebar()">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a
              class="nav-item"
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              [matTooltip]="sidebarCollapsed() ? item.label : ''"
              matTooltipPosition="right"
            >
              <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>
      </aside>

      <!-- Main content area -->
      <div class="main-area">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="breadcrumb-text">Platform Administration</span>
          </div>
          <div class="topbar-right">
            <button mat-icon-button (click)="toggleTheme()" matTooltip="Toggle theme">
              <mat-icon>{{ themeService.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-menu-header" mat-menu-item disabled>
                <strong>{{ userName() }}</strong>
              </div>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Sign Out</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Page content -->
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .admin-layout {
      display: flex;
      height: 100%;
    }

    .sidebar {
      width: 260px;
      background: var(--bg-sidebar);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      overflow: hidden;
      flex-shrink: 0;
    }

    .sidebar-collapsed .sidebar {
      width: 64px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      min-height: 64px;
      box-sizing: border-box;
    }

    .logo-icon {
      font-size: 28px;
      color: var(--accent-primary);
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
    }

    .collapse-btn {
      margin-left: auto;
      color: #94a3b8;
      flex-shrink: 0;
    }

    .sidebar-collapsed .collapse-btn {
      margin-left: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #e2e8f0;
      }

      &.active {
        background: rgba(124, 58, 237, 0.2);
        color: #a78bfa;
      }
    }

    .nav-icon {
      font-size: 22px;
      flex-shrink: 0;
    }

    .nav-label {
      font-size: 14px;
      font-weight: 400;
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .topbar-left {
      display: flex;
      align-items: center;
    }

    .breadcrumb-text {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .user-menu-header {
      opacity: 0.7;
    }

    .content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background: var(--bg-secondary);
    }
  `],
})
export default class AdminLayoutComponent {
  private readonly store = inject(Store);
  readonly themeService = inject(ThemeService);
  readonly userName = this.store.selectSignal(selectUserFullName);

  readonly sidebarCollapsed = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Tenants', icon: 'business', route: '/tenants' },
    { label: 'Packages', icon: 'inventory_2', route: '/packages' },
  ];

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
