import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  NotificationService as UiNotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { NotificationsActions } from '../../store/notifications.actions';
import {
  selectTemplates,
  selectTemplatesTotalCount,
  selectNotificationsLoading,
} from '../../store/notifications.selectors';
import { NotificationTemplateService } from '../../services/notification-template.service';
import { NotificationTemplateDto } from '../../models/notification-template.model';
import { NotificationChannel } from '../../models/notification.model';

@Component({
  selector: 'ethel-template-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'notifications.templates.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'notifications.templates.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'notifications.templates.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'notifications.templates.activeFilter' | translate }}</mat-label>
          <mat-select [value]="activeFilter()" (selectionChange)="onActiveFilter($event.value)">
            <mat-option value="">{{ 'common.all' | translate }}</mat-option>
            <mat-option value="true">Active</mat-option>
            <mat-option value="false">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="templates()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No templates"
        emptyMessage="Create your first notification template."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    @if (selectedTemplate()) {
      <div class="edit-panel" *appHasPermission="'notifications.templates.update'">
        <h3>{{ 'notifications.templates.edit' | translate }}: {{ selectedTemplate()!.eventType }}</h3>
        <form [formGroup]="editForm" (ngSubmit)="onSaveEdit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Title Template (EN)</mat-label>
              <input matInput formControlName="titleTemplateEn" />
              @if (editForm.controls.titleTemplateEn.hasError('required')) {
                <mat-error>Title template is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Default Channel</mat-label>
              <mat-select formControlName="defaultChannel">
                @for (ch of channels; track ch) {
                  <mat-option [value]="ch">{{ ch }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Body Template (EN)</mat-label>
              <textarea matInput formControlName="bodyTemplateEn" rows="3"></textarea>
              @if (editForm.controls.bodyTemplateEn.hasError('required')) {
                <mat-error>Body template is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Title Template (AM)</mat-label>
              <input matInput formControlName="titleTemplateAm" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Body Template (AM)</mat-label>
              <textarea matInput formControlName="bodyTemplateAm" rows="3"></textarea>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="onCancelEdit()">
              {{ 'common.cancel' | translate }}
            </button>
            <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving()">
              {{ 'common.save' | translate }}
            </button>
          </div>
        </form>
      </div>
    }

    <ng-template #channelTpl let-row>
      <span class="chip chip-channel">{{ row.defaultChannel }}</span>
    </ng-template>

    <ng-template #activeTpl let-row>
      <span class="chip" [class]="row.isActive ? 'chip-active' : 'chip-inactive'">
        {{ row.isActive ? 'Active' : 'Inactive' }}
      </span>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'medium' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; }
    .filter-row mat-form-field { min-width: 180px; }
    .edit-panel {
      margin-top: 1.5rem; padding: 1.5rem; border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px; background: var(--surface-card, #fafafa);
    }
    .edit-panel h3 { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 500; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.5rem; }
    .full-width { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
    .chip {
      display: inline-block; padding: 0.25rem 0.75rem; border-radius: 16px;
      font-size: 0.75rem; font-weight: 500; line-height: 1.2;
    }
    .chip-channel { background: #e1bee7; color: #6a1b9a; }
    .chip-active { background: #c8e6c9; color: #2e7d32; }
    .chip-inactive { background: #e0e0e0; color: #616161; }
  `,
})
export default class TemplateListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly templateService = inject(NotificationTemplateService);
  private readonly uiNotification = inject(UiNotificationService);

  readonly templates = this.store.selectSignal(selectTemplates);
  readonly totalCount = this.store.selectSignal(selectTemplatesTotalCount);
  readonly loading = this.store.selectSignal(selectNotificationsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly activeFilter = signal<string>('');
  readonly selectedTemplate = signal<NotificationTemplateDto | null>(null);
  readonly saving = signal(false);

  readonly channels: NotificationChannel[] = ['InApp', 'Email', 'Push', 'Sms'];

  readonly editForm = this.fb.nonNullable.group({
    titleTemplateEn: ['', [Validators.required]],
    bodyTemplateEn: ['', [Validators.required]],
    defaultChannel: ['InApp' as NotificationChannel, [Validators.required]],
    titleTemplateAm: [''],
    bodyTemplateAm: [''],
  });

  readonly channelTpl = viewChild<TemplateRef<unknown>>('channelTpl');
  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'eventType', label: 'Event Type', sortable: true },
    { key: 'titleTemplateEn', label: 'Title Template' },
    { key: 'defaultChannel', label: 'Channel', template: this.channelTpl() },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
    { key: 'createdAt', label: 'Created', sortable: true, template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    const isActive = this.activeFilter() === '' ? undefined : this.activeFilter() === 'true';
    this.store.dispatch(
      NotificationsActions.loadTemplates({
        page: this.page(),
        pageSize: this.pageSize(),
        isActive,
      })
    );
  }

  onActiveFilter(value: string): void {
    this.activeFilter.set(value);
    this.page.set(1);
    this.loadTemplates();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadTemplates();
  }

  onRowClick(row: NotificationTemplateDto): void {
    this.selectedTemplate.set(row);
    this.editForm.patchValue({
      titleTemplateEn: row.titleTemplateEn,
      bodyTemplateEn: row.bodyTemplateEn,
      defaultChannel: row.defaultChannel,
      titleTemplateAm: row.titleTemplateAm ?? '',
      bodyTemplateAm: row.bodyTemplateAm ?? '',
    });
  }

  onSaveEdit(): void {
    if (this.editForm.invalid || !this.selectedTemplate()) return;
    this.saving.set(true);
    const value = this.editForm.getRawValue();
    this.templateService.updateTemplate(this.selectedTemplate()!.id, {
      id: this.selectedTemplate()!.id,
      titleTemplateEn: value.titleTemplateEn,
      bodyTemplateEn: value.bodyTemplateEn,
      defaultChannel: value.defaultChannel,
      titleTemplateAm: value.titleTemplateAm || undefined,
      bodyTemplateAm: value.bodyTemplateAm || undefined,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.selectedTemplate.set(null);
        this.uiNotification.success('Template updated successfully');
        this.loadTemplates();
      },
      error: () => {
        this.saving.set(false);
        this.uiNotification.error('Failed to update template');
      },
    });
  }

  onCancelEdit(): void {
    this.selectedTemplate.set(null);
  }

  onCreate(): void {
    this.router.navigate(['/notifications/templates/create']);
  }
}
