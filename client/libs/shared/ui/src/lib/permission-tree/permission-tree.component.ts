import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface PermissionTreeItem {
  id: string;
  code: string;
  name?: string;
  description?: string;
  module: string;
}

@Component({
  selector: 'app-permission-tree',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <div class="permission-tree">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Filter permissions</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" placeholder="Search by module or code..." />
      </mat-form-field>

      <mat-accordion multi>
        @for (group of groupedPermissions(); track group.module) {
          <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title (click)="$event.stopPropagation()">
                <mat-checkbox
                  [disabled]="readonly"
                  [checked]="isModuleAllSelected(group.items)"
                  [indeterminate]="isModuleIndeterminate(group.items)"
                  (change)="toggleModule(group.items, $event.checked)">
                  <strong>{{ group.module }}</strong>
                  <span class="count-badge">({{ selectedCountInGroup(group.items) }}/{{ group.items.length }})</span>
                </mat-checkbox>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="perm-grid">
              @for (perm of group.items; track perm.id) {
                <mat-checkbox
                  [disabled]="readonly"
                  [checked]="isSelected(perm.id)"
                  (change)="togglePermission(perm.id, $event.checked)">
                  <span class="perm-code">{{ perm.code }}</span>
                  @if (perm.description) {
                    <span class="perm-desc"> — {{ perm.description }}</span>
                  }
                </mat-checkbox>
              }
            </div>
          </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
  `,
  styles: [`
    .permission-tree { display: flex; flex-direction: column; gap: 12px; }
    .search-field { width: 100%; max-width: 400px; }
    .count-badge { margin-left: 6px; font-size: 12px; color: var(--text-secondary, #666); }
    .perm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px; padding: 8px 0; }
    .perm-code { font-family: monospace; font-size: 13px; }
    .perm-desc { font-size: 12px; color: var(--text-secondary, #666); }
  `],
})
export class PermissionTreeComponent {
  private readonly _permissions = signal<PermissionTreeItem[]>([]);
  private readonly _selectedIds = signal<string[]>([]);
  readonly searchTerm = signal('');

  @Input() set permissions(value: PermissionTreeItem[]) {
    this._permissions.set(value ?? []);
  }

  @Input() set selectedIds(value: string[]) {
    this._selectedIds.set(value ?? []);
  }

  @Input() readonly = false;
  @Output() selectedIdsChange = new EventEmitter<string[]>();

  readonly groupedPermissions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filtered = this._permissions().filter(
      (p) =>
        !term ||
        p.code.toLowerCase().includes(term) ||
        p.module.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term) ?? false)
    );

    const map = new Map<string, PermissionTreeItem[]>();
    for (const p of filtered) {
      const mod = p.module || p.code.split('.')[0] || 'general';
      const list = map.get(mod) ?? [];
      list.push(p);
      map.set(mod, list);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, items]) => ({ module, items }));
  });

  isSelected(id: string): boolean {
    return this._selectedIds().includes(id);
  }

  selectedCountInGroup(items: PermissionTreeItem[]): number {
    const set = new Set(this._selectedIds());
    return items.filter((i) => set.has(i.id)).length;
  }

  isModuleAllSelected(items: PermissionTreeItem[]): boolean {
    return items.length > 0 && this.selectedCountInGroup(items) === items.length;
  }

  isModuleIndeterminate(items: PermissionTreeItem[]): boolean {
    const count = this.selectedCountInGroup(items);
    return count > 0 && count < items.length;
  }

  togglePermission(id: string, checked: boolean): void {
    const next = new Set(this._selectedIds());
    if (checked) next.add(id);
    else next.delete(id);
    const arr = Array.from(next);
    this._selectedIds.set(arr);
    this.selectedIdsChange.emit(arr);
  }

  toggleModule(items: PermissionTreeItem[], checked: boolean): void {
    const next = new Set(this._selectedIds());
    for (const item of items) {
      if (checked) next.add(item.id);
      else next.delete(item.id);
    }
    const arr = Array.from(next);
    this._selectedIds.set(arr);
    this.selectedIdsChange.emit(arr);
  }
}
