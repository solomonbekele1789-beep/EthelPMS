import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService, PagedResult } from '@ethelpms/shared/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { ProjectActions } from '../../store/project.actions';
import { selectProjectsLoading } from '../../store/project.selectors';
import { CreateProjectRequest } from '../../models/project.model';

export interface DropdownItem {
  id: string;
  name: string;
}

export const CURRENCIES: DropdownItem[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'ETB - Ethiopian Birr' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'USD - US Dollar' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'EUR - Euro' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'GBP - British Pound' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'KES - Kenyan Shilling' },
];

function toIsoDate(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  return new Date(val as string | number).toISOString();
}

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) {
      return { dateRangeInvalid: true };
    }
  }
  return null;
}

@Component({
  selector: 'ethel-project-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="'projects.create.title' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.code' | translate }}</mat-label>
            <input matInput formControlName="code" />
            @if (form.controls.code.hasError('required')) {
              <mat-error>Project code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Project name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'projects.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.startDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            @if (form.controls.startDate.hasError('required')) {
              <mat-error>Start date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.endDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            @if (form.controls.endDate.hasError('required')) {
              <mat-error>End date is required</mat-error>
            } @else if (form.hasError('dateRangeInvalid')) {
              <mat-error>End date must be after start date</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.budget' | translate }}</mat-label>
            <input matInput formControlName="totalBudget" type="number" />
            @if (form.controls.totalBudget.hasError('required')) {
              <mat-error>Budget is required</mat-error>
            } @else if (form.controls.totalBudget.hasError('min')) {
              <mat-error>Budget must be zero or greater</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Currency</mat-label>
            <mat-select formControlName="currencyId">
              @for (c of currencies; track c.id) {
                <mat-option [value]="c.id">{{ c.name }}</mat-option>
              }
            </mat-select>
            @if (form.controls.currencyId.hasError('required')) {
              <mat-error>Currency is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.donor' | translate }}</mat-label>
            <input matInput formControlName="donorName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.sector' | translate }}</mat-label>
            <input matInput formControlName="sector" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.programPillar' | translate }}</mat-label>
            <input matInput formControlName="programPillar" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.office' | translate }}</mat-label>
            <mat-select formControlName="officeId">
              <mat-option value="">None</mat-option>
              @for (off of offices(); track off.id) {
                <mat-option [value]="off.id">{{ off.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'projects.fields.projectManager' | translate }}</mat-label>
            <mat-select formControlName="projectManagerId">
              <mat-option value="">None</mat-option>
              @for (pm of projectManagers(); track pm.id) {
                <mat-option [value]="pm.id">{{ pm.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
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
export default class ProjectCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly loading = this.store.selectSignal(selectProjectsLoading);
  readonly currencies = CURRENCIES;
  readonly offices = signal<DropdownItem[]>([]);
  readonly projectManagers = signal<DropdownItem[]>([]);

  readonly form = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    totalBudget: [0, [Validators.required, Validators.min(0)]],
    currencyId: ['11111111-1111-1111-1111-111111111111', [Validators.required]],
    donorName: [''],
    sector: [''],
    programPillar: [''],
    officeId: [''],
    projectManagerId: [''],
  }, { validators: [dateRangeValidator] });

  ngOnInit(): void {
    this.api.get<PagedResult<{ id: string; name: string }>>('/offices').pipe(
      catchError(() => of({ items: [] } as unknown as PagedResult<{ id: string; name: string }>))
    ).subscribe((res) => {
      if (res?.items) {
        this.offices.set(res.items);
      }
    });

    this.api.get<PagedResult<{ id: string; fullName?: string; email: string }>>('/users').pipe(
      catchError(() => of({ items: [] } as unknown as PagedResult<{ id: string; fullName?: string; email: string }>))
    ).subscribe((res) => {
      if (res?.items) {
        this.projectManagers.set(
          res.items.map((u) => ({ id: u.id, name: u.fullName || u.email }))
        );
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    const start = toIsoDate(value.startDate);
    const end = toIsoDate(value.endDate);

    const request: CreateProjectRequest = {
      code: (value.code || '').trim(),
      name: (value.name || '').trim(),
      description: value.description?.trim() || undefined,
      startDate: start,
      endDate: end,
      totalBudget: Number(value.totalBudget),
      currencyId: value.currencyId || '11111111-1111-1111-1111-111111111111',
      donorName: value.donorName?.trim() || undefined,
      sector: value.sector?.trim() || undefined,
      programPillar: value.programPillar?.trim() || undefined,
      officeId: value.officeId && value.officeId.length > 0 ? value.officeId : undefined,
      projectManagerId: value.projectManagerId && value.projectManagerId.length > 0 ? value.projectManagerId : undefined,
    };
    this.store.dispatch(ProjectActions.createProject({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/projects']);
  }
}
