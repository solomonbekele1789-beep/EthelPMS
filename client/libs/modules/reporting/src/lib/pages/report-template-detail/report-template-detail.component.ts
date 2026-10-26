import { Component, inject, OnInit, signal, computed, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ReportActions } from '../../store/report.actions';
import { selectReportTemplates, selectReportingLoading } from '../../store/report.selectors';
import { ReportType, SectionType } from '../../models/report.model';
import {
  ReportTemplateDto,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
  AddTemplateSectionRequest,
} from '../../models/report-template.model';
import { ReportTemplateService } from '../../services/report-template.service';

@Component({
  selector: 'ethel-report-template-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatListModule,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="isCreateMode() ? ('reporting.templates.create' | translate) : (template()?.name ?? ('reporting.templates.title' | translate))">
    </app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSave()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.templates.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.fields.reportType' | translate }}</mat-label>
            <mat-select formControlName="reportType">
              @for (type of reportTypes; track type) {
                <mat-option [value]="type">{{ 'reporting.reportType.' + type | translate }}</mat-option>
              }
            </mat-select>
            @if (form.controls.reportType.hasError('required')) {
              <mat-error>Report type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'reporting.templates.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.templates.approvalLevels' | translate }}</mat-label>
            <input matInput formControlName="requiredApprovalLevels" type="number" min="1" />
            @if (form.controls.requiredApprovalLevels.hasError('required')) {
              <mat-error>Required</mat-error>
            } @else if (form.controls.requiredApprovalLevels.hasError('min')) {
              <mat-error>Must be at least 1</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'reporting.templates.deadlineDays' | translate }}</mat-label>
            <input matInput formControlName="submissionDeadlineDays" type="number" min="1" />
            @if (form.controls.submissionDeadlineDays.hasError('required')) {
              <mat-error>Required</mat-error>
            } @else if (form.controls.submissionDeadlineDays.hasError('min')) {
              <mat-error>Must be at least 1</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          @if (isCreateMode()) {
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading()"
              *appHasPermission="'reporting.reports.create'">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'common.create' | translate }}
              }
            </button>
          } @else {
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading()"
              *appHasPermission="'reporting.reports.update'">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'common.save' | translate }}
              }
            </button>
          }
        </div>
      </form>
    </div>

    <!-- Section Management (only in edit mode) -->
    @if (!isCreateMode() && template()) {
      <div class="sections-container">
        <h3 class="section-title">{{ 'reporting.templates.sections' | translate }}</h3>

        @if (template()!.sections && template()!.sections.length > 0) {
          <mat-list>
            @for (section of template()!.sections; track section.id) {
              <mat-list-item>
                <mat-icon matListItemIcon>article</mat-icon>
                <span matListItemTitle>{{ section.title }}</span>
                <span matListItemLine>
                  {{ section.sectionType }} |
                  {{ 'reporting.templates.sortOrder' | translate }}: {{ section.sortOrder }} |
                  {{ 'reporting.templates.required' | translate }}: {{ section.isRequired ? 'Yes' : 'No' }}
                  @if (section.instructions) {
                    | {{ section.instructions }}
                  }
                </span>
              </mat-list-item>
            }
          </mat-list>
        } @else {
          <app-empty-state
            icon="article"
            title="No sections"
            message="Add template sections below.">
          </app-empty-state>
        }

        <!-- Add Section Inline Form -->
        <div class="add-section-form">
          <h4>{{ 'reporting.templates.addSection' | translate }}</h4>
          <form [formGroup]="sectionForm" (ngSubmit)="onAddSection()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.fields.title' | translate }}</mat-label>
                <input matInput formControlName="title" />
                @if (sectionForm.controls.title.hasError('required')) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.templates.sectionType' | translate }}</mat-label>
                <mat-select formControlName="sectionType">
                  @for (type of sectionTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
                @if (sectionForm.controls.sectionType.hasError('required')) {
                  <mat-error>Section type is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reporting.templates.sortOrder' | translate }}</mat-label>
                <input matInput formControlName="sortOrder" type="number" min="0" />
                @if (sectionForm.controls.sortOrder.hasError('required')) {
                  <mat-error>Sort order is required</mat-error>
                }
              </mat-form-field>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="isRequired">
                  {{ 'reporting.templates.required' | translate }}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'reporting.templates.instructions' | translate }}</mat-label>
                <textarea matInput formControlName="instructions" rows="2"></textarea>
              </mat-form-field>
            </div>

            <button mat-flat-button color="accent" type="submit" [disabled]="sectionForm.invalid || sectionAdding()">
              @if (sectionAdding()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>add</mat-icon>
                {{ 'common.add' | translate }}
              }
            </button>
          </form>
        </div>
      </div>
    }
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
    .sections-container { margin-top: 2rem; max-width: 800px; }
    .section-title {
      margin: 1.5rem 0 0.75rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .add-section-form { margin-top: 1.5rem; }
    .toggle-field {
      display: flex;
      align-items: center;
      padding: 0.75rem 0;
    }
  `,
})
export default class ReportTemplateDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly templateService = inject(ReportTemplateService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly templates = this.store.selectSignal(selectReportTemplates);
  readonly loading = this.store.selectSignal(selectReportingLoading);

  readonly isCreateMode = computed(() => this.id() === 'new');
  readonly template = computed(() => {
    if (this.isCreateMode()) return undefined;
    return this.templates().find(t => t.id === this.id());
  });

  readonly sectionAdding = signal(false);

  readonly reportTypes: ReportType[] = ['Activity', 'Weekly', 'Monthly', 'Quarterly', 'BiAnnual', 'Annual', 'Incident'];
  readonly sectionTypes: SectionType[] = ['Narrative', 'Financial', 'Indicator', 'Beneficiary', 'Risk', 'Challenge', 'Custom'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    reportType: ['' as string, [Validators.required]],
    description: [''],
    requiredApprovalLevels: [1, [Validators.required, Validators.min(1)]],
    submissionDeadlineDays: [7, [Validators.required, Validators.min(1)]],
  });

  readonly sectionForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    sectionType: ['' as string, [Validators.required]],
    sortOrder: [0, [Validators.required]],
    isRequired: [false],
    instructions: [''],
  });

  constructor() {
    effect(() => {
      const tmpl = this.template();
      if (tmpl) {
        this.form.patchValue({
          name: tmpl.name,
          reportType: tmpl.reportType,
          description: tmpl.description ?? '',
          requiredApprovalLevels: tmpl.requiredApprovalLevels,
          submissionDeadlineDays: tmpl.submissionDeadlineDays,
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ReportActions.loadTemplates({}));
  }

  onSave(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    if (this.isCreateMode()) {
      const request: CreateReportTemplateRequest = {
        name: value.name,
        reportType: value.reportType as ReportType,
        description: value.description || undefined,
        requiredApprovalLevels: value.requiredApprovalLevels,
        submissionDeadlineDays: value.submissionDeadlineDays,
      };
      this.store.dispatch(ReportActions.createTemplate({ request }));
    } else {
      const request: UpdateReportTemplateRequest = {
        templateId: this.id(),
        name: value.name,
        description: value.description || undefined,
        requiredApprovalLevels: value.requiredApprovalLevels,
        submissionDeadlineDays: value.submissionDeadlineDays,
      };
      this.store.dispatch(ReportActions.updateTemplate({ id: this.id(), request }));
    }
  }

  onAddSection(): void {
    if (this.sectionForm.invalid) return;
    this.sectionAdding.set(true);
    const value = this.sectionForm.getRawValue();
    const request: AddTemplateSectionRequest = {
      reportTemplateId: this.id(),
      title: value.title,
      sectionType: value.sectionType as SectionType,
      sortOrder: value.sortOrder,
      isRequired: value.isRequired,
      instructions: value.instructions || undefined,
    };
    this.templateService.addSection(this.id(), request).subscribe({
      next: () => {
        this.sectionForm.reset({ title: '', sectionType: '', sortOrder: 0, isRequired: false, instructions: '' });
        this.sectionAdding.set(false);
        this.notification.success('Section added successfully');
        this.store.dispatch(ReportActions.loadTemplates({}));
      },
      error: () => {
        this.sectionAdding.set(false);
        this.notification.error('Failed to add section');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/reporting/templates']);
  }
}
