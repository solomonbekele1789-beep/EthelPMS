import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { SettingsNavComponent } from '../../components/settings-nav/settings-nav.component';
import { SettingsActions } from '../../store/settings.actions';
import { selectOrgSettings, selectSettingsLoading } from '../../store/settings.selectors';
import { OrgSettingDto, UpsertOrgSettingRequest } from '../../models/org-setting.model';
import { SettingDataType } from '../../models/system-setting.model';

@Component({
  selector: 'ethel-org-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
    SettingsNavComponent,
  ],
  template: `
    <app-page-header [title]="'settings.org.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'settings.org.manage'" (click)="onToggleForm()">
        <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
        {{ (showForm() ? 'common.cancel' : 'settings.org.addButton') | translate }}
      </button>
    </app-page-header>

    <ethel-settings-nav></ethel-settings-nav>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.org.settingKey' | translate }}</mat-label>
              <input matInput formControlName="settingKey" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.org.settingValue' | translate }}</mat-label>
              <input matInput formControlName="settingValue" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.org.dataType' | translate }}</mat-label>
              <mat-select formControlName="dataType">
                @for (dt of dataTypes; track dt) {
                  <mat-option [value]="dt">{{ dt }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.org.module' | translate }}</mat-label>
              <input matInput formControlName="module" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'settings.org.category' | translate }}</mat-label>
              <input matInput formControlName="category" />
            </mat-form-field>

            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <div class="filter-row">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>{{ 'settings.org.filterModule' | translate }}</mat-label>
        <input matInput [value]="moduleFilter()" (input)="onModuleFilter($any($event.target).value)" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>{{ 'settings.org.filterCategory' | translate }}</mat-label>
        <input matInput [value]="categoryFilter()" (input)="onCategoryFilter($any($event.target).value)" />
      </mat-form-field>
    </div>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (orgSettings().length === 0) {
      <app-empty-state
        title="No organization settings"
        message="Add your first organization setting to get started.">
      </app-empty-state>
    } @else {
      <table mat-table [dataSource]="orgSettings()" class="full-width-table">
        <ng-container matColumnDef="settingKey">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.org.settingKey' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.settingKey }}</td>
        </ng-container>

        <ng-container matColumnDef="settingValue">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.org.settingValue' | translate }}</th>
          <td mat-cell *matCellDef="let row">
            <span class="mono-value">{{ row.settingValue }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="dataType">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.org.dataType' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.dataType }}</td>
        </ng-container>

        <ng-container matColumnDef="module">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.org.module' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.module ?? '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>{{ 'settings.org.category' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.category }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="onEditRow(row)" *appHasPermission="'settings.org.manage'">
              <mat-icon>edit</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    }
  `,
  styles: `
    :host { display: block; }
    .form-card { margin-bottom: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1rem;
    }
    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
    }
    .filter-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .filter-field { flex: 1; }
    .full-width-table { width: 100%; }
    .mono-value { font-family: monospace; }
  `,
})
export default class OrgSettingsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly orgSettings = this.store.selectSignal(selectOrgSettings);
  readonly loading = this.store.selectSignal(selectSettingsLoading);

  readonly showForm = signal(false);
  readonly moduleFilter = signal('');
  readonly categoryFilter = signal('');

  readonly dataTypes: SettingDataType[] = ['String', 'Integer', 'Boolean', 'Decimal', 'Json', 'DateTime'];
  readonly displayedColumns = ['settingKey', 'settingValue', 'dataType', 'module', 'category', 'actions'];

  readonly form: FormGroup = this.fb.group({
    settingKey: ['', Validators.required],
    settingValue: ['', Validators.required],
    dataType: ['String', Validators.required],
    module: [''],
    category: ['', Validators.required],
  });

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.loadOrgSettings({}));
  }

  onToggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) this.form.reset({ dataType: 'String' });
  }

  onModuleFilter(value: string): void {
    this.moduleFilter.set(value);
    this.loadWithFilters();
  }

  onCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
    this.loadWithFilters();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const request: UpsertOrgSettingRequest = {
      settingKey: val.settingKey,
      settingValue: val.settingValue,
      dataType: val.dataType,
      module: val.module || undefined,
      category: val.category,
    };
    this.store.dispatch(SettingsActions.upsertOrgSetting({ request }));
    this.showForm.set(false);
    this.form.reset({ dataType: 'String' });
  }

  onEditRow(row: OrgSettingDto): void {
    this.form.patchValue({
      settingKey: row.settingKey,
      settingValue: row.settingValue,
      dataType: row.dataType,
      module: row.module ?? '',
      category: row.category,
    });
    this.showForm.set(true);
  }

  private loadWithFilters(): void {
    this.store.dispatch(
      SettingsActions.loadOrgSettings({
        module: this.moduleFilter() || undefined,
        category: this.categoryFilter() || undefined,
      })
    );
  }
}
