import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ParticipantsActions } from '../../store/participants.actions';
import { selectParticipantsLoading } from '../../store/participants.selectors';
import { RegisterParticipantRequest, Gender } from '../../models/participant.model';

@Component({
  selector: 'ethel-participant-create',
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
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'participants.register' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'participants.fields.firstName' | translate }}</mat-label>
            <input matInput formControlName="firstName" />
            @if (form.controls.firstName.hasError('required')) {
              <mat-error>First name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'participants.fields.lastName' | translate }}</mat-label>
            <input matInput formControlName="lastName" />
            @if (form.controls.lastName.hasError('required')) {
              <mat-error>Last name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'participants.fields.middleName' | translate }}</mat-label>
            <input matInput formControlName="middleName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'participants.fields.gender' | translate }}</mat-label>
            <mat-select formControlName="gender">
              @for (g of genderOptions; track g) {
                <mat-option [value]="g">{{ g }}</mat-option>
              }
            </mat-select>
            @if (form.controls.gender.hasError('required')) {
              <mat-error>Gender is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'participants.fields.dateOfBirth' | translate }}</mat-label>
            <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth" />
            <mat-datepicker-toggle matIconSuffix [for]="dobPicker"></mat-datepicker-toggle>
            <mat-datepicker #dobPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'participants.fields.idNumber' | translate }}</mat-label>
            <input matInput formControlName="idNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'participants.fields.phone' | translate }}</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'participants.profiles.create'">
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class ParticipantCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.store.selectSignal(selectParticipantsLoading);

  readonly genderOptions: Gender[] = ['Male', 'Female', 'Other'];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    middleName: [''],
    gender: ['', [Validators.required]],
    dateOfBirth: [''],
    idNumber: [''],
    phone: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: RegisterParticipantRequest = {
      firstName: value.firstName,
      lastName: value.lastName,
      gender: value.gender as Gender,
      middleName: value.middleName || undefined,
      dateOfBirth: value.dateOfBirth || undefined,
      idNumber: value.idNumber || undefined,
      phone: value.phone || undefined,
    };
    this.store.dispatch(ParticipantsActions.registerParticipant({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/participants']);
  }
}
