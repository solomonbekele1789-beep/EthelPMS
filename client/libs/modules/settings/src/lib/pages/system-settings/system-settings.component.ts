import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent } from '@ethelpms/shared/ui';
import { SettingsActions } from '../../store/settings.actions';
import {
  selectSystemSettings,
  selectSettingsLoading,
  selectSystemSettingCategories,
} from '../../store/settings.selectors';
import { SystemSettingDto, UpdateSystemSettingRequest } from '../../models/system-setting.model';

@Component({
  selector: 'ethel-system-settings',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-page-header [title]="'settings.system.title' | translate"></app-page-header>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="filter-bar">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!selectedCategory()"
            (click)="onCategoryFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (cat of categories(); track cat) {
            <mat-chip
              [highlighted]="selectedCategory() === cat"
              (click)="onCategoryFilter(cat)">
              {{ cat }}
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      @if (filteredSettings().length === 0) {
        <app-empty-state
          title="No system settings found"
          message="No system settings match the current filter.">
        </app-empty-state>
      } @else {
        @for (cat of displayedCategories(); track cat) {
          <mat-card class="category-card">
            <mat-card-header>
              <mat-card-title>{{ cat }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @for (setting of settingsByCategory(cat); track setting.id) {
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-key">{{ setting.settingKey }}</span>
                    <span class="setting-description">{{ setting.description }}</span>
                  </div>
                  <div class="setting-value">
                    @if (editingKey() === setting.settingKey && !setting.isReadOnly) {
                      @if (setting.dataType === 'Boolean') {
                        <mat-slide-toggle
                          [checked]="editValue() === 'true'"
                          (change)="editValue.set($event.checked ? 'true' : 'false')">
                        </mat-slide-toggle>
                      } @else {
                        <mat-form-field appearance="outline" class="value-field">
                          <input matInput [value]="editValue()" (input)="editValue.set($any($event.target).value)" />
                        </mat-form-field>
                      }
                      <button mat-icon-button color="primary" (click)="onSave(setting)" matTooltip="Save">
                        <mat-icon>check</mat-icon>
                      </button>
                      <button mat-icon-button (click)="onCancelEdit()" matTooltip="Cancel">
                        <mat-icon>close</mat-icon>
                      </button>
                    } @else {
                      @if (setting.dataType === 'Boolean') {
                        <mat-slide-toggle [checked]="setting.settingValue === 'true'" [disabled]="true">
                        </mat-slide-toggle>
                      } @else {
                        <span class="value-text">{{ setting.settingValue }}</span>
                      }
                      @if (!setting.isReadOnly) {
                        <button mat-icon-button (click)="onEdit(setting)" matTooltip="Edit">
                          <mat-icon>edit</mat-icon>
                        </button>
                      } @else {
                        <mat-icon class="readonly-icon" matTooltip="Read only">lock</mat-icon>
                      }
                    }
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      }
    }
  `,
  styles: `
    :host { display: block; }
    .filter-bar { margin-bottom: 1rem; }
    .category-card { margin-bottom: 1rem; }
    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
    .setting-row:last-child { border-bottom: none; }
    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }
    .setting-key { font-weight: 500; }
    .setting-description { font-size: 0.85rem; color: rgba(0, 0, 0, 0.54); }
    .setting-value {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .value-text { font-family: monospace; color: rgba(0, 0, 0, 0.72); }
    .value-field { width: 200px; }
    .readonly-icon { color: rgba(0, 0, 0, 0.38); font-size: 18px; }
  `,
})
export default class SystemSettingsComponent implements OnInit {
  private readonly store = inject(Store);

  readonly systemSettings = this.store.selectSignal(selectSystemSettings);
  readonly categories = this.store.selectSignal(selectSystemSettingCategories);
  readonly loading = this.store.selectSignal(selectSettingsLoading);

  readonly selectedCategory = signal<string | undefined>(undefined);
  readonly editingKey = signal<string | null>(null);
  readonly editValue = signal('');

  readonly filteredSettings = signal<SystemSettingDto[]>([]);
  readonly displayedCategories = signal<string[]>([]);

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.loadSystemSettings({}));
    this.updateFiltered();
  }

  onCategoryFilter(category: string | undefined): void {
    this.selectedCategory.set(category);
    this.updateFiltered();
  }

  onEdit(setting: SystemSettingDto): void {
    this.editingKey.set(setting.settingKey);
    this.editValue.set(setting.settingValue);
  }

  onCancelEdit(): void {
    this.editingKey.set(null);
    this.editValue.set('');
  }

  onSave(setting: SystemSettingDto): void {
    const request: UpdateSystemSettingRequest = {
      settingKey: setting.settingKey,
      settingValue: this.editValue(),
    };
    this.store.dispatch(SettingsActions.updateSystemSetting({ key: setting.settingKey, request }));
    this.onCancelEdit();
  }

  settingsByCategory(category: string): SystemSettingDto[] {
    return this.filteredSettings().filter((s) => s.category === category);
  }

  private updateFiltered(): void {
    const all = this.systemSettings();
    const cat = this.selectedCategory();
    const filtered = cat ? all.filter((s) => s.category === cat) : all;
    this.filteredSettings.set(filtered);
    this.displayedCategories.set([...new Set(filtered.map((s) => s.category))]);
  }
}
