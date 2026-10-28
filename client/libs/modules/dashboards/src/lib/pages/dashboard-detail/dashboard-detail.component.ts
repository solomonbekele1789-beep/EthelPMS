import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DashboardActions } from '../../store/dashboards.actions';
import {
  selectSelectedDashboard,
  selectWidgets,
  selectDashboardsLoading,
} from '../../store/dashboards.selectors';
import {
  DashboardConfigDto,
  UpdateDashboardRequest,
} from '../../models/dashboard.model';
import {
  DashboardWidgetDto,
  WidgetType,
  AddWidgetRequest,
  UpdateWidgetRequest,
} from '../../models/widget.model';

@Component({
  selector: 'ethel-dashboard-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="dashboard()?.name ?? ('dashboards.dashboards.detail' | translate)">
      @if (dashboard()) {
        <button mat-stroked-button *appHasPermission="'dashboards.configs.update'" (click)="toggleEditMode()">
          <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
          {{ editing() ? ('common.cancel' | translate) : ('common.edit' | translate) }}
        </button>
        <button mat-stroked-button color="warn" *appHasPermission="'dashboards.configs.delete'" (click)="onDelete()">
          <mat-icon>delete</mat-icon>
          {{ 'common.delete' | translate }}
        </button>
      }
    </app-page-header>

    @if (loading() && !dashboard()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (dashboard()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'dashboards.tabs.overview' | translate">
          <div class="tab-content">
            @if (!editing()) {
              <div class="detail-grid">
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.name' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ dashboard()!.name }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.dashboardType' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content><mat-chip>{{ dashboard()!.dashboardType }}</mat-chip></mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.isShared' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ dashboard()!.isShared ? 'Yes' : 'No' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.widgetCount' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ dashboard()!.widgetCount }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.createdAt' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ dashboard()!.createdAt | date:'mediumDate' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.ownerId' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ dashboard()!.ownerId }}</mat-card-content>
                </mat-card>
              </div>
              @if (dashboard()!.description) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.description' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ dashboard()!.description }}</mat-card-content>
                </mat-card>
              }
              @if (dashboard()!.layoutJson) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'dashboards.fields.layoutJson' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content><pre class="json-preview">{{ dashboard()!.layoutJson }}</pre></mat-card-content>
                </mat-card>
              }
            } @else {
              <form [formGroup]="editForm" (ngSubmit)="onUpdateDashboard()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.name' | translate }}</mat-label>
                    <input matInput formControlName="name" />
                    @if (editForm.controls.name.hasError('required')) {
                      <mat-error>Name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.description' | translate }}</mat-label>
                    <input matInput formControlName="description" />
                  </mat-form-field>
                  <div class="toggle-row">
                    <mat-slide-toggle formControlName="isShared">
                      {{ 'dashboards.fields.isShared' | translate }}
                    </mat-slide-toggle>
                  </div>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'dashboards.fields.layoutJson' | translate }}</mat-label>
                    <textarea matInput formControlName="layoutJson" rows="4"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-button type="button" (click)="toggleEditMode()">{{ 'common.cancel' | translate }}</button>
                  <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving()">
                    @if (saving()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Widgets Tab -->
        <mat-tab [label]="'dashboards.tabs.widgets' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'dashboards.widgets.create'">
              <button mat-stroked-button (click)="toggleWidgetForm()">
                <mat-icon>{{ showWidgetForm() ? 'close' : 'add' }}</mat-icon>
                {{ showWidgetForm() ? ('common.cancel' | translate) : ('dashboards.widgets.add' | translate) }}
              </button>
            </div>

            @if (showWidgetForm()) {
              <form [formGroup]="widgetForm" (ngSubmit)="onAddWidget()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.widgetTitle' | translate }}</mat-label>
                    <input matInput formControlName="title" />
                    @if (widgetForm.controls.title.hasError('required')) {
                      <mat-error>Title is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.widgetType' | translate }}</mat-label>
                    <mat-select formControlName="widgetType">
                      @for (wt of widgetTypes; track wt) {
                        <mat-option [value]="wt">{{ wt }}</mat-option>
                      }
                    </mat-select>
                    @if (widgetForm.controls.widgetType.hasError('required')) {
                      <mat-error>Widget type is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.dataSourceModule' | translate }}</mat-label>
                    <input matInput formControlName="dataSourceModule" />
                    @if (widgetForm.controls.dataSourceModule.hasError('required')) {
                      <mat-error>Data source module is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.position' | translate }}</mat-label>
                    <input matInput formControlName="position" type="number" />
                    @if (widgetForm.controls.position.hasError('required')) {
                      <mat-error>Position is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.width' | translate }}</mat-label>
                    <input matInput formControlName="width" type="number" />
                    @if (widgetForm.controls.width.hasError('required')) {
                      <mat-error>Width is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.height' | translate }}</mat-label>
                    <input matInput formControlName="height" type="number" />
                    @if (widgetForm.controls.height.hasError('required')) {
                      <mat-error>Height is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'dashboards.fields.refreshIntervalMinutes' | translate }}</mat-label>
                    <input matInput formControlName="refreshIntervalMinutes" type="number" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'dashboards.fields.queryDefinition' | translate }}</mat-label>
                    <textarea matInput formControlName="queryDefinition" rows="3"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'dashboards.fields.displayConfig' | translate }}</mat-label>
                    <textarea matInput formControlName="displayConfig" rows="3"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="widgetForm.invalid || savingWidget()">
                    @if (savingWidget()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'dashboards.widgets.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            @if (loading() && widgets().length === 0) {
              <app-loading-spinner></app-loading-spinner>
            } @else if (widgets().length === 0) {
              <app-empty-state
                icon="widgets"
                title="No widgets found"
                message="Add a widget to this dashboard to get started.">
              </app-empty-state>
            } @else {
              <div class="widgets-list">
                @for (widget of widgets(); track widget.id) {
                  <mat-card class="widget-card">
                    <mat-card-header>
                      <mat-card-title>{{ widget.title }}</mat-card-title>
                      <mat-card-subtitle>
                        <mat-chip>{{ widget.widgetType }}</mat-chip>
                        <span class="widget-module">{{ widget.dataSourceModule }}</span>
                      </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="widget-details">
                        <span><strong>{{ 'dashboards.fields.position' | translate }}:</strong> {{ widget.position }}</span>
                        <span><strong>{{ 'dashboards.fields.width' | translate }}:</strong> {{ widget.width }}</span>
                        <span><strong>{{ 'dashboards.fields.height' | translate }}:</strong> {{ widget.height }}</span>
                        @if (widget.refreshIntervalMinutes) {
                          <span><strong>{{ 'dashboards.fields.refreshIntervalMinutes' | translate }}:</strong> {{ widget.refreshIntervalMinutes }}m</span>
                        }
                      </div>
                    </mat-card-content>
                    <mat-card-actions align="end">
                      <button mat-icon-button *appHasPermission="'dashboards.widgets.update'" (click)="onEditWidget(widget)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" *appHasPermission="'dashboards.widgets.delete'" (click)="onRemoveWidget(widget)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }

            @if (editingWidget()) {
              <div class="inline-edit-overlay">
                <mat-card class="inline-edit-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'dashboards.widgets.edit' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <form [formGroup]="editWidgetForm" (ngSubmit)="onUpdateWidget()">
                      <div class="form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'dashboards.fields.widgetTitle' | translate }}</mat-label>
                          <input matInput formControlName="title" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'dashboards.fields.position' | translate }}</mat-label>
                          <input matInput formControlName="position" type="number" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'dashboards.fields.width' | translate }}</mat-label>
                          <input matInput formControlName="width" type="number" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'dashboards.fields.height' | translate }}</mat-label>
                          <input matInput formControlName="height" type="number" />
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>{{ 'dashboards.fields.queryDefinition' | translate }}</mat-label>
                          <textarea matInput formControlName="queryDefinition" rows="3"></textarea>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>{{ 'dashboards.fields.displayConfig' | translate }}</mat-label>
                          <textarea matInput formControlName="displayConfig" rows="3"></textarea>
                        </mat-form-field>
                      </div>
                      <div class="form-actions">
                        <button mat-button type="button" (click)="cancelEditWidget()">{{ 'common.cancel' | translate }}</button>
                        <button mat-flat-button color="primary" type="submit" [disabled]="editWidgetForm.invalid || savingWidget()">
                          @if (savingWidget()) {
                            <mat-spinner diameter="20"></mat-spinner>
                          } @else {
                            {{ 'common.save' | translate }}
                          }
                        </button>
                      </div>
                    </form>
                  </mat-card-content>
                </mat-card>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="dashboard"
        title="Dashboard not found"
        message="The requested dashboard could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .tab-content { padding: 1.5rem 0; }
    .narrative-card { margin-bottom: 1rem; }
    .json-preview {
      background: var(--mat-sys-surface-variant);
      padding: 0.75rem;
      border-radius: 4px;
      font-size: 0.8125rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .edit-form { margin-bottom: 1.5rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .toggle-row {
      grid-column: 1 / -1;
      margin-bottom: 1rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .widgets-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .widget-card .widget-details {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .widget-module {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.8125rem;
      margin-left: 0.5rem;
    }
    .inline-edit-overlay {
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--mat-sys-surface-container);
      border-radius: 8px;
    }
    .inline-edit-card { box-shadow: none; }
  `,
})
export default class DashboardDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly dashboard = this.store.selectSignal(selectSelectedDashboard);
  readonly widgets = this.store.selectSignal(selectWidgets);
  readonly loading = this.store.selectSignal(selectDashboardsLoading);

  readonly activeTab = signal(0);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly showWidgetForm = signal(false);
  readonly savingWidget = signal(false);
  readonly editingWidget = signal<DashboardWidgetDto | null>(null);

  readonly widgetTypes: WidgetType[] = [
    'Chart', 'Table', 'KPI', 'Map', 'Timeline',
    'Gauge', 'PieChart', 'BarChart', 'LineChart', 'HeatMap',
  ];

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    isShared: [false],
    layoutJson: [''],
  });

  readonly widgetForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    widgetType: ['' as string, [Validators.required]],
    dataSourceModule: ['', [Validators.required]],
    position: [0, [Validators.required]],
    width: [4, [Validators.required]],
    height: [3, [Validators.required]],
    refreshIntervalMinutes: [null as number | null],
    queryDefinition: [''],
    displayConfig: [''],
  });

  readonly editWidgetForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    position: [0, [Validators.required]],
    width: [4, [Validators.required]],
    height: [3, [Validators.required]],
    queryDefinition: [''],
    displayConfig: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadDashboard({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 1 && this.widgets().length === 0) {
      this.store.dispatch(DashboardActions.loadWidgets({ dashboardId: this.id() }));
    }
  }

  toggleEditMode(): void {
    if (!this.editing()) {
      const d = this.dashboard();
      if (d) {
        this.editForm.patchValue({
          name: d.name,
          description: d.description ?? '',
          isShared: d.isShared,
          layoutJson: d.layoutJson ?? '',
        });
      }
    }
    this.editing.update((v) => !v);
  }

  onUpdateDashboard(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateDashboardRequest = {
      id: this.id(),
      name: value.name,
      description: value.description || undefined,
      isShared: value.isShared,
      layoutJson: value.layoutJson || undefined,
    };
    this.saving.set(true);
    this.store.dispatch(DashboardActions.updateDashboard({ id: this.id(), request }));
    // Reset after dispatch (effect handles notification)
    this.saving.set(false);
    this.editing.set(false);
    this.store.dispatch(DashboardActions.loadDashboard({ id: this.id() }));
  }

  onDelete(): void {
    this.store.dispatch(DashboardActions.deleteDashboard({ id: this.id() }));
    this.router.navigate(['/dashboards']);
  }

  // Widget management
  toggleWidgetForm(): void {
    this.showWidgetForm.update((v) => !v);
    if (this.showWidgetForm()) {
      this.widgetForm.reset({ position: 0, width: 4, height: 3 });
    }
  }

  onAddWidget(): void {
    if (this.widgetForm.invalid) return;
    const value = this.widgetForm.getRawValue();
    const request: AddWidgetRequest = {
      dashboardConfigId: this.id(),
      widgetType: value.widgetType as WidgetType,
      title: value.title,
      dataSourceModule: value.dataSourceModule,
      queryDefinition: value.queryDefinition || undefined,
      displayConfig: value.displayConfig || undefined,
      position: value.position,
      width: value.width,
      height: value.height,
      refreshIntervalMinutes: value.refreshIntervalMinutes ?? undefined,
    };
    this.savingWidget.set(true);
    this.store.dispatch(DashboardActions.addWidget({ dashboardId: this.id(), request }));
    this.savingWidget.set(false);
    this.showWidgetForm.set(false);
  }

  onEditWidget(widget: DashboardWidgetDto): void {
    this.editingWidget.set(widget);
    this.editWidgetForm.patchValue({
      title: widget.title,
      position: widget.position,
      width: widget.width,
      height: widget.height,
      queryDefinition: widget.queryDefinition ?? '',
      displayConfig: widget.displayConfig ?? '',
    });
  }

  cancelEditWidget(): void {
    this.editingWidget.set(null);
  }

  onUpdateWidget(): void {
    const widget = this.editingWidget();
    if (!widget || this.editWidgetForm.invalid) return;
    const value = this.editWidgetForm.getRawValue();
    const request: UpdateWidgetRequest = {
      id: widget.id,
      title: value.title,
      queryDefinition: value.queryDefinition || undefined,
      displayConfig: value.displayConfig || undefined,
      position: value.position,
      width: value.width,
      height: value.height,
    };
    this.savingWidget.set(true);
    this.store.dispatch(DashboardActions.updateWidget({ dashboardId: this.id(), widgetId: widget.id, request }));
    this.savingWidget.set(false);
    this.editingWidget.set(null);
  }

  onRemoveWidget(widget: DashboardWidgetDto): void {
    this.store.dispatch(DashboardActions.removeWidget({ dashboardId: this.id(), widgetId: widget.id }));
  }
}
