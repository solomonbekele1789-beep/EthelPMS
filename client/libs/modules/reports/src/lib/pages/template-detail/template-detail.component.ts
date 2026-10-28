import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, LoadingSpinnerComponent, StatusBadgeComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ReportsActions } from '../../store/reports.actions';
import { selectSelectedTemplate, selectReportsLoading } from '../../store/reports.selectors';
import { UpdateReportTemplateRequest } from '../../models/report-template.model';

@Component({
  selector: 'ethel-template-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    @if (loading() && !template()) {
      <app-loading-spinner [overlay]="true" message="Loading template..."></app-loading-spinner>
    } @else if (template(); as tpl) {
      <app-page-header [title]="tpl.name">
        <button mat-flat-button color="primary" *appHasPermission="'reports.generated.create'" (click)="onGenerate()">
          <mat-icon>play_arrow</mat-icon>
          {{ 'reports.templates.detail.generateButton' | translate }}
        </button>
      </app-page-header>

      <mat-tab-group>
        <mat-tab [label]="'reports.templates.detail.overviewTab' | translate">
          <div class="tab-content">
            <div class="detail-header">
              <div class="detail-meta">
                <span class="meta-item">
                  <strong>{{ 'reports.templates.fields.module' | translate }}:</strong> {{ tpl.module }}
                </span>
                <span class="meta-item">
                  <strong>{{ 'reports.templates.fields.reportFormat' | translate }}:</strong> {{ tpl.reportFormat }}
                </span>
                <span class="meta-item">
                  <strong>{{ 'reports.templates.fields.createdAt' | translate }}:</strong> {{ tpl.createdAt | date:'mediumDate' }}
                </span>
                <span class="meta-item">
                  <app-status-badge [status]="tpl.isActive ? 'Active' : 'Inactive'" [label]="tpl.isActive ? 'Active' : 'Inactive'"></app-status-badge>
                </span>
              </div>
            </div>

            <div class="edit-form" *appHasPermission="'reports.templates.update'">
              <form [formGroup]="form" (ngSubmit)="onUpdate()">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'reports.templates.fields.name' | translate }}</mat-label>
                    <input matInput formControlName="name" />
                    @if (form.controls.name.hasError('required')) {
                      <mat-error>Template name is required</mat-error>
                    }
                  </mat-form-field>

                  <div class="toggle-field">
                    <mat-slide-toggle formControlName="isActive">
                      {{ 'reports.templates.fields.isActive' | translate }}
                    </mat-slide-toggle>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'reports.templates.fields.description' | translate }}</mat-label>
                    <textarea matInput formControlName="description" rows="2"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'reports.templates.fields.queryDefinition' | translate }}</mat-label>
                    <textarea matInput formControlName="queryDefinition" rows="6"></textarea>
                    @if (form.controls.queryDefinition.hasError('required')) {
                      <mat-error>Query definition is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'reports.templates.fields.templateContent' | translate }}</mat-label>
                    <textarea matInput formControlName="templateContent" rows="6"></textarea>
                  </mat-form-field>
                </div>

                <div class="form-actions">
                  <button mat-button type="button" (click)="onBack()">
                    {{ 'common.back' | translate }}
                  </button>
                  <button mat-flat-button color="warn" type="button" *appHasPermission="'reports.templates.delete'" (click)="onDelete()">
                    <mat-icon>delete</mat-icon>
                    {{ 'common.delete' | translate }}
                  </button>
                  <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
                    @if (loading()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    :host { display: block; }
    .tab-content { padding: 1.5rem 0; }
    .detail-header { margin-bottom: 1.5rem; }
    .detail-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: center;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .edit-form { max-width: 800px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .toggle-field {
      display: flex;
      align-items: center;
      padding-top: 0.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class TemplateDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly template = this.store.selectSignal(selectSelectedTemplate);
  readonly loading = this.store.selectSignal(selectReportsLoading);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    queryDefinition: ['', [Validators.required]],
    templateContent: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.dispatch(ReportsActions.loadTemplate({ id }));

    // Patch form when template loads
    const interval = setInterval(() => {
      const tpl = this.template();
      if (tpl) {
        this.form.patchValue({
          name: tpl.name,
          description: tpl.description ?? '',
          queryDefinition: '',
          templateContent: '',
          isActive: tpl.isActive,
        });
        clearInterval(interval);
      }
    }, 100);
  }

  onUpdate(): void {
    if (this.form.invalid) return;
    const id = this.route.snapshot.paramMap.get('id')!;
    const value = this.form.getRawValue();
    const request: UpdateReportTemplateRequest = {
      id,
      name: value.name,
      description: value.description || undefined,
      queryDefinition: value.queryDefinition,
      templateContent: value.templateContent || undefined,
      isActive: value.isActive,
    };
    this.store.dispatch(ReportsActions.updateTemplate({ id, request }));
  }

  onGenerate(): void {
    const tpl = this.template();
    if (tpl) {
      this.store.dispatch(ReportsActions.generateReport({ request: { reportTemplateId: tpl.id } }));
    }
  }

  onDelete(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.dispatch(ReportsActions.deleteTemplate({ id }));
    this.router.navigate(['/reports/templates']);
  }

  onBack(): void {
    this.router.navigate(['/reports/templates']);
  }
}
