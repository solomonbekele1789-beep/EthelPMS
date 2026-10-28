import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, NotificationService } from '@ethelpms/shared/ui';
import { OrganizationService } from '../../services/organization.service';
import { OrganizationDto } from '../../models/organization.model';

@Component({
  selector: 'ethel-organization-settings',
  standalone: true,
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
    <app-page-header title="Organization Settings"></app-page-header>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else {
      <div class="form-container">
        <form [formGroup]="form" (ngSubmit)="onSave()">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="full-span">
              <mat-label>{{ 'organization.settings.nameLabel' | translate }}</mat-label>
              <input matInput formControlName="name" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>Organization name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'organization.settings.timezoneLabel' | translate }}</mat-label>
              <mat-select formControlName="timezone">
                @for (tz of timezones; track tz) {
                  <mat-option [value]="tz">{{ tz }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'organization.settings.calendarLabel' | translate }}</mat-label>
              <mat-select formControlName="calendarPreference">
                @for (opt of calendarOptions; track opt.value) {
                  <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="logo-placeholder full-span">
              <mat-icon>image</mat-icon>
              <div>
                <p class="logo-title">{{ 'organization.settings.logoLabel' | translate }}</p>
                <p class="logo-hint">File upload coming soon</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              @if (saving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'common.save' | translate }}
              }
            </button>
          </div>

          @if (organization()) {
            <div class="org-stats">
              <div class="stat">
                <span class="stat-value">{{ organization()!.userCount }}</span>
                <span class="stat-label">{{ 'organization.settings.users' | translate }}</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ organization()!.officeCount }}</span>
                <span class="stat-label">{{ 'organization.settings.offices' | translate }}</span>
              </div>
            </div>
          }
        </form>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 800px; }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-span { grid-column: 1 / -1; }
    .logo-placeholder {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border: 2px dashed var(--border-color, #e0e0e0);
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .logo-placeholder mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--text-secondary, #999);
    }
    .logo-title { font-weight: 500; margin: 0; }
    .logo-hint { font-size: 0.875rem; color: var(--text-secondary, #666); margin: 0.25rem 0 0; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .org-stats {
      display: flex;
      gap: 2rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #e0e0e0);
    }
    .stat { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 600; color: var(--text-primary, #333); }
    .stat-label { font-size: 0.875rem; color: var(--text-secondary, #666); }
  `,
})
export default class OrganizationSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orgService = inject(OrganizationService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly organization = signal<OrganizationDto | null>(null);

  readonly timezones = [
    'Africa/Addis_Ababa',
    'Africa/Nairobi',
    'Africa/Cairo',
    'Africa/Lagos',
    'Africa/Johannesburg',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Dubai',
    'UTC',
  ];

  readonly calendarOptions = [
    { value: 'Gregorian', label: 'Gregorian' },
    { value: 'Ethiopian', label: 'Ethiopian' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    timezone: ['Africa/Addis_Ababa'],
    calendarPreference: ['Gregorian'],
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.orgService.getOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        this.form.patchValue({
          name: org.name,
          timezone: org.timezone,
          calendarPreference: org.calendarPreference,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.orgService.updateOrganization({
      name: value.name,
      timezone: value.timezone,
      calendarPreference: value.calendarPreference,
    }).subscribe({
      next: (org) => {
        this.organization.set(org);
        this.saving.set(false);
        this.notification.success('Organization settings saved successfully');
      },
      error: () => {
        this.saving.set(false);
        this.notification.error('Failed to save organization settings');
      },
    });
  }
}
