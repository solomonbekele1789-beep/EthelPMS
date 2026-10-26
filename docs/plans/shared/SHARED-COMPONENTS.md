# EthelPMS — Shared Angular Components Plan

**Version:** 1.0
**Date:** October 16, 2026
**Owner:** Developer B (Frontend lead)

> All shared components live in `client/libs/shared/ui/`.
> Module-specific components live in their own library, not here.
> Every component is standalone and uses Angular Material + CDK.

---

## 1. Component Inventory

### Phase 0B — Core Infrastructure (16 components)

| # | Component | Selector | Purpose | Priority |
|---|-----------|----------|---------|----------|
| 1 | LoadingSpinner | `app-loading-spinner` | Full-page or inline loading indicator | Must |
| 2 | ConfirmDialog | `app-confirm-dialog` | Reusable confirmation dialog | Must |
| 3 | StatusBadge | `app-status-badge` | Colored badge for entity statuses | Must |
| 4 | EmptyState | `app-empty-state` | "No data" placeholder with icon and action | Must |
| 5 | ErrorBoundary | `app-error-boundary` | Catches component errors, shows fallback | Must |
| 6 | DataTable | `app-data-table` | Paginated, sortable, filterable table | Must |
| 7 | PageHeader | `app-page-header` | Page title, breadcrumbs, action buttons | Must |
| 8 | SearchInput | `app-search-input` | Debounced search with clear button | Must |
| 9 | FileUpload | `app-file-upload` | Drag-and-drop file upload with preview | Should |
| 10 | AvatarInitials | `app-avatar-initials` | User avatar from initials | Should |
| 11 | NotificationToast | `app-notification-toast` | Toast notifications (success/error/warning/info) | Must |
| 12 | SidebarNav | `app-sidebar-nav` | Main navigation sidebar with collapse | Must |
| 13 | BreadcrumbNav | `app-breadcrumb-nav` | Auto-generated breadcrumbs from route | Must |
| 14 | FormField | `app-form-field` | Wrapper for label + input + error message | Must |
| 15 | CurrencyInput | `app-currency-input` | Formatted currency input with code selector | Should |
| 16 | LanguageToggle | `app-language-toggle` | EN/Amharic switcher | Must |

### Phase 1 — Identity-Specific Shared Components (4 components)

| # | Component | Selector | Purpose |
|---|-----------|----------|---------|
| 17 | DualCalendarDatePicker | `app-dual-calendar-date-picker` | Ethiopian + Gregorian date picker |
| 18 | LocationCascadeSelector | `app-location-cascade-selector` | Region → Zone → Woreda → Kebele |
| 19 | PermissionTree | `app-permission-tree` | Tree view for permission assignment |
| 20 | ThemeToggle | `app-theme-toggle` | Dark/light mode switch |

---

## 2. Component Specifications

### 2.1 LoadingSpinner

**File:** `client/libs/shared/ui/src/lib/loading-spinner/loading-spinner.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (overlay) {
      <div class="spinner-overlay">
        <mat-spinner [diameter]="diameter"></mat-spinner>
        @if (message) { <p class="spinner-message">{{ message }}</p> }
      </div>
    } @else {
      <div class="spinner-inline">
        <mat-spinner [diameter]="diameter"></mat-spinner>
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.3); z-index: 1000;
    }
    .spinner-inline { display: flex; justify-content: center; padding: 24px; }
    .spinner-message { margin-top: 16px; color: white; font-size: 14px; }
  `]
})
export class LoadingSpinnerComponent {
  @Input() overlay = false;
  @Input() diameter = 40;
  @Input() message?: string;
}
```

### 2.2 ConfirmDialog

**File:** `client/libs/shared/ui/src/lib/confirm-dialog/confirm-dialog.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button mat-flat-button [color]="data.confirmColor || 'primary'" [mat-dialog-close]="true">
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}

// Usage:
// this.dialog.open(ConfirmDialogComponent, {
//   data: { title: 'Delete Project?', message: 'This cannot be undone.', confirmColor: 'warn' }
// }).afterClosed().subscribe(confirmed => { if (confirmed) { ... } });
```

### 2.3 StatusBadge

**File:** `client/libs/shared/ui/src/lib/status-badge/status-badge.component.ts`

```typescript
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
```

### 2.4 EmptyState

**File:** `client/libs/shared/ui/src/lib/empty-state/empty-state.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (actionLabel) {
        <button mat-flat-button color="primary" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; text-align: center;
    }
    .empty-icon { font-size: 64px; height: 64px; width: 64px; color: #9ca3af; }
    h3 { margin: 16px 0 8px; color: #374151; }
    p { color: #6b7280; margin-bottom: 24px; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No items found';
  @Input() message = 'Get started by creating your first item.';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
```

### 2.5 DataTable

**File:** `client/libs/shared/ui/src/lib/data-table/data-table.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  template?: TemplateRef<unknown>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatProgressBarModule, LoadingSpinnerComponent, EmptyStateComponent
  ],
  template: `
    @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

    @if (!loading && data.length === 0) {
      <app-empty-state
        [title]="emptyTitle"
        [message]="emptyMessage"
        [actionLabel]="emptyAction"
        (action)="emptyActionClick.emit()">
      </app-empty-state>
    } @else {
      <table mat-table [dataSource]="data" matSort (matSortChange)="onSort($event)">
        @for (col of columns; track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef [mat-sort-header]="col.sortable ? col.key : ''"
                [style.width]="col.width">
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              @if (col.template) {
                <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }">
                </ng-container>
              } @else {
                {{ row[col.key] }}
              }
            </td>
          </ng-container>
        }
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"
            (click)="rowClick.emit(row)" class="clickable-row"></tr>
      </table>

      <mat-paginator
        [length]="totalCount"
        [pageIndex]="page - 1"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 20, 50, 100]"
        (page)="onPage($event)">
      </mat-paginator>
    }
  `,
  styles: [`.clickable-row { cursor: pointer; } .clickable-row:hover { background: #f5f5f5; }`]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() emptyTitle = 'No items found';
  @Input() emptyMessage = '';
  @Input() emptyAction?: string;

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<{ sortBy: string; sortDir: 'asc' | 'desc' }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() emptyActionClick = new EventEmitter<void>();

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }

  onSort(event: Sort): void {
    this.sortChange.emit({
      sortBy: event.active,
      sortDir: event.direction as 'asc' | 'desc' || 'asc'
    });
  }
}
```

### 2.6 PageHeader

**File:** `client/libs/shared/ui/src/lib/page-header/page-header.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { BreadcrumbNavComponent } from '../breadcrumb-nav/breadcrumb-nav.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [BreadcrumbNavComponent],
  template: `
    <div class="page-header">
      <app-breadcrumb-nav></app-breadcrumb-nav>
      <div class="header-row">
        <div>
          <h1>{{ title }}</h1>
          @if (subtitle) { <p class="subtitle">{{ subtitle }}</p> }
        </div>
        <div class="actions">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { padding: 16px 0; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
    h1 { margin: 8px 0 4px; font-size: 24px; font-weight: 600; }
    .subtitle { color: #6b7280; margin: 0; }
    .actions { display: flex; gap: 8px; }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}

// Usage:
// <app-page-header title="Projects" subtitle="Manage your organization's projects">
//   <button mat-flat-button color="primary" *appHasPermission="'projects.projects.create'">
//     + New Project
//   </button>
// </app-page-header>
```

### 2.7 SearchInput

**File:** `client/libs/shared/ui/src/lib/search-input/search-input.component.ts`

```typescript
import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [placeholder]="placeholder" [(ngModel)]="value"
             (ngModelChange)="onInput($event)">
      @if (value) {
        <button matSuffix mat-icon-button (click)="clear()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  `,
  styles: [`.search-field { width: 100%; max-width: 400px; }`]
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() debounceMs = 300;
  @Output() search = new EventEmitter<string>();

  value = '';
  private subject = new Subject<string>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.subject.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged()
    ).subscribe(term => this.search.emit(term));
  }

  onInput(value: string): void { this.subject.next(value); }
  clear(): void { this.value = ''; this.search.emit(''); }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
```

### 2.8 NotificationToast

**File:** `client/libs/shared/ui/src/lib/notification-toast/notification-toast.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationToastService {
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
```

### 2.9 FormField

**File:** `client/libs/shared/ui/src/lib/form-field/form-field.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [MatFormFieldModule],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <ng-content></ng-content>
      @if (control?.invalid && control?.touched) {
        <mat-error>{{ errorMessage }}</mat-error>
      }
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
    </mat-form-field>
  `,
  styles: [`.full-width { width: 100%; }`]
})
export class FormFieldComponent {
  @Input({ required: true }) label!: string;
  @Input() control?: AbstractControl;
  @Input() hint?: string;

  get errorMessage(): string {
    if (!this.control?.errors) return '';
    if (this.control.errors['required']) return `${this.label} is required`;
    if (this.control.errors['email']) return 'Invalid email address';
    if (this.control.errors['minlength']) {
      const min = this.control.errors['minlength'].requiredLength;
      return `Minimum ${min} characters`;
    }
    if (this.control.errors['maxlength']) {
      const max = this.control.errors['maxlength'].requiredLength;
      return `Maximum ${max} characters`;
    }
    if (this.control.errors['custom']) return this.control.errors['custom'];
    return 'Invalid value';
  }
}
```

### 2.10 CurrencyInput

**File:** `client/libs/shared/ui/src/lib/currency-input/currency-input.component.ts`

```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-currency-input',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatSelectModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CurrencyInputComponent),
    multi: true
  }],
  template: `
    <div class="currency-row">
      <mat-form-field appearance="outline" class="currency-code">
        <mat-select [(ngModel)]="currencyCode" (ngModelChange)="emitChange()">
          @for (c of currencies; track c) {
            <mat-option [value]="c">{{ c }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="currency-amount">
        <input matInput type="number" [placeholder]="placeholder"
               [(ngModel)]="amount" (ngModelChange)="emitChange()" step="0.01">
      </mat-form-field>
    </div>
  `,
  styles: [`
    .currency-row { display: flex; gap: 8px; }
    .currency-code { width: 100px; }
    .currency-amount { flex: 1; }
  `]
})
export class CurrencyInputComponent implements ControlValueAccessor {
  @Input() placeholder = '0.00';
  @Input() currencies = ['ETB', 'USD', 'EUR', 'GBP'];

  amount: number | null = null;
  currencyCode = 'ETB';

  private onChange: (value: { amount: number; currency: string }) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: { amount: number; currency: string }): void {
    if (val) { this.amount = val.amount; this.currencyCode = val.currency; }
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  emitChange(): void {
    this.onChange({ amount: this.amount ?? 0, currency: this.currencyCode });
  }
}
```

### 2.11 LanguageToggle

**File:** `client/libs/shared/ui/src/lib/language-toggle/language-toggle.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [MatButtonToggleModule],
  template: `
    <mat-button-toggle-group [value]="currentLang" (change)="switchLang($event.value)">
      <mat-button-toggle value="en">EN</mat-button-toggle>
      <mat-button-toggle value="am">አማ</mat-button-toggle>
    </mat-button-toggle-group>
  `
})
export class LanguageToggleComponent {
  private readonly translate = inject(TranslateService);
  currentLang = this.translate.currentLang || 'en';

  switchLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
    document.documentElement.setAttribute('dir', lang === 'am' ? 'ltr' : 'ltr');
    // Amharic uses LTR (Ge'ez script is left-to-right)
  }
}
```

### 2.12 DualCalendarDatePicker (Phase 1)

**File:** `client/libs/shared/ui/src/lib/dual-calendar-date-picker/dual-calendar-date-picker.component.ts`

```typescript
// Uses ethiopian-calendar-date-converter and date-fns
// Allows user to pick a date in either Ethiopian or Gregorian calendar
// Stores value as ISO date string (Gregorian), displays in user's preferred calendar

import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-dual-calendar-date-picker',
  standalone: true,
  imports: [FormsModule, MatDatepickerModule, MatInputModule, MatButtonToggleModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DualCalendarDatePickerComponent),
    multi: true
  }],
  template: `
    <div class="date-picker-wrapper">
      <mat-button-toggle-group [(ngModel)]="calendarMode" class="calendar-toggle">
        <mat-button-toggle value="gregorian">GC</mat-button-toggle>
        <mat-button-toggle value="ethiopian">EC</mat-button-toggle>
      </mat-button-toggle-group>
      <mat-form-field appearance="outline">
        <mat-label>{{ label }}</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="dateValue"
               (ngModelChange)="onDateChange($event)">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
      @if (calendarMode === 'ethiopian' && ethiopianDisplay) {
        <span class="ethiopian-date">{{ ethiopianDisplay }}</span>
      }
    </div>
  `,
  styles: [`
    .date-picker-wrapper { display: flex; align-items: center; gap: 8px; }
    .calendar-toggle { height: 36px; }
    .ethiopian-date { font-size: 12px; color: #6b7280; }
  `]
})
export class DualCalendarDatePickerComponent implements ControlValueAccessor {
  @Input() label = 'Date';
  calendarMode: 'gregorian' | 'ethiopian' = 'gregorian';
  dateValue: Date | null = null;
  ethiopianDisplay = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.dateValue = val ? new Date(val) : null;
    this.updateEthiopianDisplay();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  onDateChange(date: Date): void {
    this.onChange(date?.toISOString().split('T')[0] ?? '');
    this.updateEthiopianDisplay();
  }

  private updateEthiopianDisplay(): void {
    // Uses ethiopian-calendar-date-converter library
    // Implementation converts Gregorian Date → Ethiopian date string
    if (this.dateValue) {
      // const ethDate = toEthiopian(year, month, day);
      // this.ethiopianDisplay = `${ethDate[0]}/${ethDate[1]}/${ethDate[2]} EC`;
      this.ethiopianDisplay = ''; // Implemented when library is installed in Phase 1
    }
  }
}
```

### 2.13 LocationCascadeSelector (Phase 1)

**File:** `client/libs/shared/ui/src/lib/location-cascade-selector/location-cascade-selector.component.ts`

```typescript
// Cascading dropdowns: Region → Zone → Woreda → Kebele
// Each selection loads the next level from the API
// Value is the most specific selected location ID

import { Component, Input, forwardRef, inject, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '@ethelpms/shared/core';

interface LocationOption { id: string; name: string; nameAm?: string; }

@Component({
  selector: 'app-location-cascade-selector',
  standalone: true,
  imports: [FormsModule, MatSelectModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LocationCascadeSelectorComponent),
    multi: true
  }],
  template: `
    <div class="cascade-row">
      <mat-form-field appearance="outline">
        <mat-label>Region</mat-label>
        <mat-select [(ngModel)]="regionId" (ngModelChange)="onRegionChange($event)">
          @for (r of regions; track r.id) { <mat-option [value]="r.id">{{ r.name }}</mat-option> }
        </mat-select>
      </mat-form-field>

      @if (zones.length > 0) {
        <mat-form-field appearance="outline">
          <mat-label>Zone</mat-label>
          <mat-select [(ngModel)]="zoneId" (ngModelChange)="onZoneChange($event)">
            @for (z of zones; track z.id) { <mat-option [value]="z.id">{{ z.name }}</mat-option> }
          </mat-select>
        </mat-form-field>
      }

      @if (woredas.length > 0) {
        <mat-form-field appearance="outline">
          <mat-label>Woreda</mat-label>
          <mat-select [(ngModel)]="woredaId" (ngModelChange)="onWoredaChange($event)">
            @for (w of woredas; track w.id) { <mat-option [value]="w.id">{{ w.name }}</mat-option> }
          </mat-select>
        </mat-form-field>
      }

      @if (showKebele && kebeles.length > 0) {
        <mat-form-field appearance="outline">
          <mat-label>Kebele</mat-label>
          <mat-select [(ngModel)]="kebeleId" (ngModelChange)="emitValue()">
            @for (k of kebeles; track k.id) { <mat-option [value]="k.id">{{ k.name }}</mat-option> }
          </mat-select>
        </mat-form-field>
      }
    </div>
  `,
  styles: [`.cascade-row { display: flex; gap: 12px; flex-wrap: wrap; }`]
})
export class LocationCascadeSelectorComponent implements ControlValueAccessor, OnInit {
  @Input() showKebele = true;
  @Input() required = false;

  private readonly api = inject(ApiService);

  regions: LocationOption[] = [];
  zones: LocationOption[] = [];
  woredas: LocationOption[] = [];
  kebeles: LocationOption[] = [];

  regionId = ''; zoneId = ''; woredaId = ''; kebeleId = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.api.get<LocationOption[]>('locations/regions').subscribe(res => {
      this.regions = res.data;
    });
  }

  onRegionChange(id: string): void {
    this.zones = []; this.woredas = []; this.kebeles = [];
    this.zoneId = ''; this.woredaId = ''; this.kebeleId = '';
    this.api.get<LocationOption[]>(`locations/regions/${id}/zones`).subscribe(res => {
      this.zones = res.data;
    });
    this.emitValue();
  }

  onZoneChange(id: string): void {
    this.woredas = []; this.kebeles = [];
    this.woredaId = ''; this.kebeleId = '';
    this.api.get<LocationOption[]>(`locations/zones/${id}/woredas`).subscribe(res => {
      this.woredas = res.data;
    });
    this.emitValue();
  }

  onWoredaChange(id: string): void {
    this.kebeles = []; this.kebeleId = '';
    if (this.showKebele) {
      this.api.get<LocationOption[]>(`locations/woredas/${id}/kebeles`).subscribe(res => {
        this.kebeles = res.data;
      });
    }
    this.emitValue();
  }

  emitValue(): void {
    const value = this.kebeleId || this.woredaId || this.zoneId || this.regionId;
    this.onChange(value);
  }

  writeValue(val: string): void { /* Reverse-lookup to set cascade from a location ID */ }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}
```

---

## 3. Library Structure

```
client/libs/shared/ui/src/lib/
├── index.ts                              ← Public API (re-exports all components)
├── loading-spinner/
│   ├── loading-spinner.component.ts
│   └── loading-spinner.component.spec.ts
├── confirm-dialog/
│   ├── confirm-dialog.component.ts
│   └── confirm-dialog.component.spec.ts
├── status-badge/
├── empty-state/
├── error-boundary/
├── data-table/
├── page-header/
├── search-input/
├── file-upload/
├── avatar-initials/
├── notification-toast/
│   └── notification-toast.service.ts
├── sidebar-nav/
├── breadcrumb-nav/
├── form-field/
├── currency-input/
├── language-toggle/
├── dual-calendar-date-picker/            ← Phase 1
├── location-cascade-selector/            ← Phase 1
├── permission-tree/                      ← Phase 1
└── theme-toggle/                         ← Phase 1
```

### Public API (`index.ts`)

```typescript
// Phase 0B components
export { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
export { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog/confirm-dialog.component';
export { StatusBadgeComponent } from './status-badge/status-badge.component';
export { EmptyStateComponent } from './empty-state/empty-state.component';
export { DataTableComponent, TableColumn } from './data-table/data-table.component';
export { PageHeaderComponent } from './page-header/page-header.component';
export { SearchInputComponent } from './search-input/search-input.component';
export { NotificationToastService } from './notification-toast/notification-toast.service';
export { FormFieldComponent } from './form-field/form-field.component';
export { CurrencyInputComponent } from './currency-input/currency-input.component';
export { LanguageToggleComponent } from './language-toggle/language-toggle.component';
// Phase 1 components (add when implemented)
// export { DualCalendarDatePickerComponent } from './dual-calendar-date-picker/...';
// export { LocationCascadeSelectorComponent } from './location-cascade-selector/...';
```

---

## 4. Testing Requirements

Each component must have at minimum:

| Test | Description |
|------|-------------|
| Render test | Component creates without errors |
| Input binding | Verify @Input values display correctly |
| Output event | Verify @Output events fire on interaction |
| Edge case | Empty data, null values, long strings |

Example test file pattern:

```typescript
describe('StatusBadgeComponent', () => {
  it('should create', () => { ... });
  it('should display the status text', () => { ... });
  it('should apply correct CSS class for active status', () => { ... });
  it('should use label override when provided', () => { ... });
});
```

---

## 5. Dependencies

| This plan depends on | For |
|---------------------|-----|
| `00-TECH-STACK.md` | Angular Material version, npm packages |
| `00-CODING-STANDARDS.md` | Component naming, selector prefix, file structure |
| `shared/API-CONVENTIONS.md` | Pagination model, API response types |
| `shared/AUTHORIZATION-RBAC.md` | Permission directive usage in templates |
