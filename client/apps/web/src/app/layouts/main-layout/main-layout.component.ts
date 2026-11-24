import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';

import {
  AuthActions,
  selectCurrentUser,
  selectIsAuthenticated,
  selectUiSidebarCollapsed,
  UiActions,
  PermissionService,
} from '@ethelpms/shared/core';
import {
  SidebarNavComponent,
  BreadcrumbNavComponent,
  LanguageToggleComponent,
  ThemeToggleComponent,
  AvatarInitialsComponent,
} from '@ethelpms/shared/ui';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  permission?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    SidebarNavComponent,
    BreadcrumbNavComponent,
    LanguageToggleComponent,
  ThemeToggleComponent,
    AvatarInitialsComponent,
  ],
  template: `
    <div class="main-layout" [class.main-layout--collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="main-layout__sidebar">
        <div class="main-layout__sidebar-header">
          <a routerLink="/dashboard" class="main-layout__brand">
            @if (!sidebarCollapsed()) {
              <span class="main-layout__brand-text">{{ currentUser()?.organizationName || 'EthelPMS' }}</span>
            } @else {
              <span class="main-layout__brand-icon">E</span>
            }
          </a>
          <button
            class="main-layout__collapse-btn"
            (click)="toggleSidebar()"
            [attr.aria-label]="sidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            @if (sidebarCollapsed()) {
              <span class="icon">chevron_right</span>
            } @else {
              <span class="icon">chevron_left</span>
            }
          </button>
        </div>

        <nav class="main-layout__nav">
          @for (item of visibleNavItems(); track item.path) {
            <a
              class="main-layout__nav-item"
              [routerLink]="item.path"
              routerLinkActive="main-layout__nav-item--active"
              [attr.title]="sidebarCollapsed() ? (item.labelKey | translate) : null"
            >
              <span class="icon">{{ item.icon }}</span>
              @if (!sidebarCollapsed()) {
                <span class="main-layout__nav-label">{{ item.labelKey | translate }}</span>
              }
            </a>
          }
        </nav>
      </aside>

      <!-- Main content area -->
      <div class="main-layout__content-wrapper">
        <!-- Topbar -->
        <header class="main-layout__topbar">
          <div class="main-layout__topbar-left">
            <app-breadcrumb-nav />
          </div>

          <div class="main-layout__topbar-right">
            <a
              href="http://localhost:4201"
              target="_blank"
              class="platform-console-btn"
              title="Open Platform Console (SuperAdmin) to manage tenants and packages"
            >
              <span class="icon">admin_panel_settings</span>
              <span>Platform Console</span>
            </a>

            <app-theme-toggle />
            <app-language-toggle />

            @if (user(); as u) {
              <app-avatar-initials
                [firstName]="u.firstName"
                [lastName]="u.lastName"
              />
              <span class="main-layout__user-name">{{ u.firstName }}</span>
            }

            <button class="main-layout__logout-btn" (click)="logout()" aria-label="Logout">
              <span class="icon">logout</span>
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="main-layout__content">
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

    .main-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      height: 100vh;
      transition: grid-template-columns 0.2s ease;

      &--collapsed {
        grid-template-columns: 64px 1fr;
      }
    }

    // ── Sidebar ──────────────────────────────────────────────────────────
    .main-layout__sidebar {
      background: var(--bg-sidebar, #1e293b);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .main-layout__sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      min-height: 64px;
    }

    .main-layout__brand {
      text-decoration: none;
      color: #ffffff;
    }

    .main-layout__brand-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }

    .main-layout__brand-icon {
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--accent-primary, #2563eb);
      border-radius: 8px;
      color: #ffffff;
    }

    .main-layout__collapse-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;

      &:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }
    }

    // ── Navigation ───────────────────────────────────────────────────────
    .main-layout__nav {
      flex: 1;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .main-layout__nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
      overflow: hidden;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      &--active {
        background: var(--accent-primary, #2563eb);
        color: #ffffff;

        &:hover {
          background: var(--accent-primary, #2563eb);
        }
      }
    }

    .main-layout__nav-label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // ── Content wrapper ──────────────────────────────────────────────────
    .main-layout__content-wrapper {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    // ── Topbar ───────────────────────────────────────────────────────────
    .main-layout__topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 64px;
      background: var(--bg-primary, #ffffff);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      flex-shrink: 0;
    }

    .main-layout__topbar-left {
      display: flex;
      align-items: center;
    }

    .main-layout__topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .platform-console-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: rgba(37, 99, 235, 0.08);
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.2);
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        background: #2563eb;
        color: #ffffff;
      }
    }

    .main-layout__user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary, #111827);
    }

    .main-layout__logout-btn {
      background: none;
      border: none;
      color: var(--text-secondary, #6b7280);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      display: flex;
      align-items: center;

      &:hover {
        color: var(--accent-danger, #dc2626);
        background: rgba(220, 38, 38, 0.08);
      }
    }

    // ── Main content ─────────────────────────────────────────────────────
    .main-layout__content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--bg-secondary, #f9fafb);
    }

    // ── Icon helper ──────────────────────────────────────────────────────
    .icon {
      font-family: 'Material Symbols Outlined', sans-serif;
      font-size: 20px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    // ── Responsive ───────────────────────────────────────────────────────
    @media (max-width: 768px) {
      .main-layout {
        grid-template-columns: 64px 1fr;
      }

      .main-layout__nav-label,
      .main-layout__brand-text {
        display: none;
      }

      .main-layout__sidebar-header {
        justify-content: center;
      }

      .main-layout__collapse-btn {
        display: none;
      }
    }
  `]
})
export default class MainLayoutComponent {
  private readonly store = inject(Store);
  private readonly permissionService = inject(PermissionService);
  private readonly router = inject(Router);

  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly currentUser = this.user;
  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  readonly sidebarCollapsed = this.store.selectSignal(selectUiSidebarCollapsed);

  readonly navItems: NavItem[] = [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
    { path: '/users', labelKey: 'nav.users', icon: 'people' },
    { path: '/roles', labelKey: 'nav.roles', icon: 'admin_panel_settings' },
    { path: '/offices', labelKey: 'nav.offices', icon: 'business', permission: 'identity.offices.read' },
    { path: '/locations', labelKey: 'nav.locations', icon: 'location_on', permission: 'identity.locations.read' },
    { path: '/settings/organization', labelKey: 'nav.orgSettings', icon: 'corporate_fare', permission: 'orgsetup.organization.read' },
    // Phase 2+: uncomment as modules are activated
    { path: '/projects', labelKey: 'nav.projects', icon: 'folder_open' },
    { path: '/planning', labelKey: 'nav.planning', icon: 'event_note' },
    { path: '/reporting', labelKey: 'nav.reporting', icon: 'assessment' },
    { path: '/meal', labelKey: 'nav.meal', icon: 'monitoring' },
    { path: '/participants', labelKey: 'nav.participants', icon: 'groups' },
    { path: '/procurement', labelKey: 'nav.procurement', icon: 'shopping_cart' },
    { path: '/finance', labelKey: 'nav.finance', icon: 'account_balance' },
    { path: '/assets', labelKey: 'nav.assets', icon: 'inventory_2' },
    { path: '/training', labelKey: 'nav.training', icon: 'school' },
    { path: '/tasks', labelKey: 'nav.tasks', icon: 'task_alt' },
    { path: '/risk', labelKey: 'nav.risk', icon: 'warning' },
    { path: '/donors', labelKey: 'nav.donors', icon: 'volunteer_activism' },
    { path: '/chat', labelKey: 'nav.chat', icon: 'chat' },
    { path: '/notifications', labelKey: 'nav.notifications', icon: 'notifications' },
    { path: '/documents', labelKey: 'nav.documents', icon: 'description' },
    { path: '/feedback', labelKey: 'nav.feedback', icon: 'feedback' },
    { path: '/dashboards', labelKey: 'nav.dashboards', icon: 'analytics' },
    { path: '/settings', labelKey: 'nav.settings', icon: 'settings' },
    { path: '/knowledge', labelKey: 'nav.knowledge', icon: 'menu_book' },
    { path: '/partnerships', labelKey: 'nav.partnerships', icon: 'handshake' },
    { path: '/reports', labelKey: 'nav.reports', icon: 'summarize' },
    { path: '/import-export', labelKey: 'nav.importExport', icon: 'import_export' },
  ];

  readonly visibleNavItems = computed(() =>
    this.navItems.filter((item) => !item.permission || this.permissionService.hasPermission(item.permission))
  );

  toggleSidebar(): void {
    this.store.dispatch(UiActions.toggleSidebar());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
