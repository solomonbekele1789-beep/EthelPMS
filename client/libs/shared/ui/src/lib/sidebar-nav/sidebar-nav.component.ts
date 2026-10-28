import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface NavMenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavMenuItem[];
  permission?: string;
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatTooltipModule],
  template: `
    <nav class="sidebar" [class.collapsed]="collapsed">
      <mat-nav-list>
        @for (item of menuItems; track item.label) {
          @if (item.children && item.children.length > 0) {
            <div class="nav-group">
              <a mat-list-item (click)="toggleExpand(item.label)"
                 [matTooltip]="collapsed ? item.label : ''"
                 matTooltipPosition="right">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                @if (!collapsed) {
                  <span matListItemTitle>{{ item.label }}</span>
                  <mat-icon class="expand-icon" [class.expanded]="isExpanded(item.label)">
                    expand_more
                  </mat-icon>
                }
              </a>
              @if (!collapsed && isExpanded(item.label)) {
                <div class="sub-menu">
                  @for (child of item.children; track child.label) {
                    <a mat-list-item [routerLink]="child.route" routerLinkActive="active-link">
                      <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                      <span matListItemTitle>{{ child.label }}</span>
                    </a>
                  }
                </div>
              }
            </div>
          } @else {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
               [matTooltip]="collapsed ? item.label : ''"
               matTooltipPosition="right">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              @if (!collapsed) {
                <span matListItemTitle>{{ item.label }}</span>
              }
            </a>
          }
        }
      </mat-nav-list>
    </nav>
  `,
  styles: [`
    .sidebar { width: 260px; height: 100%; transition: width 0.3s; overflow-x: hidden; }
    .sidebar.collapsed { width: 64px; }
    .nav-group { position: relative; }
    .sub-menu { padding-left: 16px; }
    .expand-icon { transition: transform 0.2s; margin-left: auto; }
    .expand-icon.expanded { transform: rotate(180deg); }
    .active-link { background: rgba(63, 81, 181, 0.1); color: #3f51b5; }
    :host ::ng-deep .active-link .mat-icon { color: #3f51b5; }
  `]
})
export class SidebarNavComponent {
  @Input() menuItems: NavMenuItem[] = [];
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  private expandedItems = signal<Set<string>>(new Set());

  toggleExpand(label: string): void {
    const current = new Set(this.expandedItems());
    if (current.has(label)) {
      current.delete(label);
    } else {
      current.add(label);
    }
    this.expandedItems.set(current);
  }

  isExpanded(label: string): boolean {
    return this.expandedItems().has(label);
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
