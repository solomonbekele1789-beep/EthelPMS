import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { OfficeActions } from '../../store/office.actions';
import { selectSelectedOffice, selectOfficesLoading } from '../../store/office.selectors';
import { OfficeService } from '../../services/office.service';
import { OfficeListItemDto } from '../../models/office.model';

@Component({
  selector: 'ethel-office-detail',
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
    <app-page-header [title]="isEditMode() ? (office()?.name ?? 'Edit Office') : 'Create Office'"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSave()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'offices.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
              <mat-error>Office name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'offices.fields.code' | translate }}</mat-label>
            <input matInput formControlName="code" />
            @if (form.controls.code.hasError('required')) {
              <mat-error>Office code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'offices.fields.parentOffice' | translate }}</mat-label>
            <mat-select formControlName="parentOfficeId">
              <mat-option value="">-- None --</mat-option>
              @for (office of parentOffices(); track office.id) {
                <mat-option [value]="office.id">{{ office.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="location-placeholder">
            <mat-icon>location_on</mat-icon>
            <span>{{ 'offices.detail.locationComingSoon' | translate }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ isEditMode() ? ('common.save' | translate) : ('common.create' | translate) }}
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .location-placeholder {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
      color: var(--text-secondary, #666);
      font-size: 0.875rem;
    }
  `,
})
export default class OfficeDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly officeService = inject(OfficeService);

  readonly officeId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.officeId());

  readonly office = this.store.selectSignal(selectSelectedOffice);
  readonly loading = this.store.selectSignal(selectOfficesLoading);

  readonly parentOffices = signal<OfficeListItemDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    parentOfficeId: [''],
  });

  constructor() {
    effect(() => {
      const office = this.office();
      if (office && this.isEditMode()) {
        this.form.patchValue({
          name: office.name,
          code: office.code,
          parentOfficeId: office.parentOfficeId ?? '',
        });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.officeId.set(id);
      this.store.dispatch(OfficeActions.loadOffice({ id }));
    }
    this.officeService.listOffices(1, 100).subscribe(r => this.parentOffices.set(r.items));
  }

  onSave(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request = {
      name: value.name,
      code: value.code,
      parentOfficeId: value.parentOfficeId || undefined,
      locationId: undefined,
    };

    if (this.isEditMode()) {
      this.store.dispatch(OfficeActions.updateOffice({ id: this.officeId()!, request }));
    } else {
      this.store.dispatch(OfficeActions.createOffice({ request }));
    }
  }

  onCancel(): void {
    this.router.navigate(['/offices']);
  }
}
