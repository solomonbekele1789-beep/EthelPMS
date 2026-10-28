import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  NotificationService as UiNotificationService,
} from '@ethelpms/shared/ui';
import { NotificationTemplateService } from '../../services/notification-template.service';
import { NotificationChannel } from '../../models/notification.model';
import { CreateNotificationTemplateRequest } from '../../models/notification-template.model';

@Component({
  selector: 'ethel-template-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="'notifications.templates.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'notifications.templates.fields.eventType' | translate }}</mat-label>
            <input matInput formControlName="eventType" />
            @if (form.controls.eventType.hasError('required')) {
              <mat-error>Event type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'notifications.templates.fields.defaultChannel' | translate }}</mat-label>
            <mat-select formControlName="defaultChannel">
              @for (ch of channels; track ch) {
                <mat-option [value]="ch">{{ ch }}</mat-option>
              }
            </mat-select>
            @if (form.controls.defaultChannel.hasError('required')) {
              <mat-error>Channel is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'notifications.templates.fields.titleTemplateEn' | translate }}</mat-label>
            <input matInput formControlName="titleTemplateEn" />
            @if (form.controls.titleTemplateEn.hasError('required')) {
              <mat-error>Title template is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'notifications.templates.fields.bodyTemplateEn' | translate }}</mat-label>
            <textarea matInput formControlName="bodyTemplateEn" rows="4"></textarea>
            @if (form.controls.bodyTemplateEn.hasError('required')) {
              <mat-error>Body template is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'notifications.templates.fields.titleTemplateAm' | translate }}</mat-label>
            <input matInput formControlName="titleTemplateAm" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'notifications.templates.fields.bodyTemplateAm' | translate }}</mat-label>
            <textarea matInput formControlName="bodyTemplateAm" rows="4"></textarea>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
            @if (submitting()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 800px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class TemplateCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly templateService = inject(NotificationTemplateService);
  private readonly uiNotification = inject(UiNotificationService);

  readonly submitting = signal(false);

  readonly channels: NotificationChannel[] = ['InApp', 'Email', 'Push', 'Sms'];

  readonly form = this.fb.nonNullable.group({
    eventType: ['', [Validators.required]],
    titleTemplateEn: ['', [Validators.required]],
    bodyTemplateEn: ['', [Validators.required]],
    defaultChannel: ['InApp' as NotificationChannel, [Validators.required]],
    titleTemplateAm: [''],
    bodyTemplateAm: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const value = this.form.getRawValue();
    const request: CreateNotificationTemplateRequest = {
      eventType: value.eventType,
      titleTemplateEn: value.titleTemplateEn,
      bodyTemplateEn: value.bodyTemplateEn,
      defaultChannel: value.defaultChannel,
      titleTemplateAm: value.titleTemplateAm || undefined,
      bodyTemplateAm: value.bodyTemplateAm || undefined,
    };
    this.templateService.createTemplate(request).subscribe({
      next: () => {
        this.uiNotification.success('Template created successfully');
        this.router.navigate(['/notifications/templates']);
      },
      error: () => {
        this.submitting.set(false);
        this.uiNotification.error('Failed to create template');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/notifications/templates']);
  }
}
