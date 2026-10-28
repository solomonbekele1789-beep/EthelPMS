import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { NotificationService } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { PlanningConfigService } from '../../services/planning-config.service';
import { PlanningConfigurationDto, UpdatePlanningConfigRequest } from '../../models/planning-config.model';

@Component({
  selector: 'ethel-planning-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'planning.config.title' | translate"></app-page-header>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else {
      <div class="config-container">
        <form [formGroup]="form" (ngSubmit)="onSave()">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'planning.config.planLevels' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="toggle-list">
                <mat-slide-toggle formControlName="enableAnnualPlanning">
                  {{ 'planning.config.enableAnnual' | translate }}
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="enableQuarterlyPlanning">
                  {{ 'planning.config.enableQuarterly' | translate }}
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="enableMonthlyPlanning">
                  {{ 'planning.config.enableMonthly' | translate }}
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="enableWeeklyPlanning">
                  {{ 'planning.config.enableWeekly' | translate }}
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="enableDailyPlanning">
                  {{ 'planning.config.enableDaily' | translate }}
                </mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'planning.config.generalSettings' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="settings-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'planning.config.fiscalYearStartMonth' | translate }}</mat-label>
                  <input matInput formControlName="fiscalYearStartMonth" type="number" min="1" max="12" />
                  @if (form.controls.fiscalYearStartMonth.hasError('min') || form.controls.fiscalYearStartMonth.hasError('max')) {
                    <mat-error>Must be between 1 and 12</mat-error>
                  }
                </mat-form-field>

                <mat-slide-toggle formControlName="defaultApprovalRequired" class="approval-toggle">
                  {{ 'planning.config.defaultApprovalRequired' | translate }}
                </mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="form-actions">
            <button
              mat-flat-button
              color="primary"
              type="submit"
              *appHasPermission="'planning.annual.update'"
              [disabled]="saving() || form.pristine">
              @if (saving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
                {{ 'common.save' | translate }}
              }
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
    .config-container {
      max-width: 600px;
    }
    mat-card {
      margin-bottom: 1.5rem;
    }
    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0.5rem 0;
    }
    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0.5rem 0;
    }
    .settings-grid mat-form-field {
      max-width: 240px;
    }
    .approval-toggle {
      margin-top: 0.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  `,
})
export default class PlanningConfigComponent implements OnInit {
  private readonly configService = inject(PlanningConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    enableAnnualPlanning: [true],
    enableQuarterlyPlanning: [true],
    enableMonthlyPlanning: [true],
    enableWeeklyPlanning: [false],
    enableDailyPlanning: [false],
    fiscalYearStartMonth: [1, []], // Validators added dynamically to avoid import noise
    defaultApprovalRequired: [true],
  });

  private configId = '';

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading.set(true);
    this.configService.getConfig().subscribe({
      next: (config) => {
        this.configId = config.id;
        this.form.patchValue({
          enableAnnualPlanning: config.enableAnnualPlanning,
          enableQuarterlyPlanning: config.enableQuarterlyPlanning,
          enableMonthlyPlanning: config.enableMonthlyPlanning,
          enableWeeklyPlanning: config.enableWeeklyPlanning,
          enableDailyPlanning: config.enableDailyPlanning,
          fiscalYearStartMonth: config.fiscalYearStartMonth,
          defaultApprovalRequired: config.defaultApprovalRequired,
        });
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSave(): void {
    if (this.form.pristine) return;
    const value = this.form.getRawValue();
    const request: UpdatePlanningConfigRequest = {
      enableAnnualPlanning: value.enableAnnualPlanning,
      enableQuarterlyPlanning: value.enableQuarterlyPlanning,
      enableMonthlyPlanning: value.enableMonthlyPlanning,
      enableWeeklyPlanning: value.enableWeeklyPlanning,
      enableDailyPlanning: value.enableDailyPlanning,
      fiscalYearStartMonth: value.fiscalYearStartMonth,
      defaultApprovalRequired: value.defaultApprovalRequired,
    };

    this.saving.set(true);
    this.configService.updateConfig(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.markAsPristine();
        this.notification.success('Configuration saved successfully');
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
