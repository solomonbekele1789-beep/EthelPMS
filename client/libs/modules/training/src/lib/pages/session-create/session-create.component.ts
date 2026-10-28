import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { TrainingActions } from '../../store/training.actions';
import { selectPrograms, selectTrainingLoading } from '../../store/training.selectors';
import { CreateTrainingSessionRequest } from '../../models/training-session.model';

@Component({
  selector: 'ethel-session-create',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'training.sessions.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.trainingProgramId' | translate }}</mat-label>
            <mat-select formControlName="trainingProgramId">
              @for (program of programs(); track program.id) {
                <mat-option [value]="program.id">{{ program.title }}</mat-option>
              }
            </mat-select>
            @if (form.controls.trainingProgramId.hasError('required')) {
              <mat-error>Training program is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.title' | translate }}</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.hasError('required')) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.scheduledDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="scheduledPicker" formControlName="scheduledDate" />
            <mat-datepicker-toggle matIconSuffix [for]="scheduledPicker"></mat-datepicker-toggle>
            <mat-datepicker #scheduledPicker></mat-datepicker>
            @if (form.controls.scheduledDate.hasError('required')) {
              <mat-error>Scheduled date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.venue' | translate }}</mat-label>
            <input matInput formControlName="venue" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.endDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'training.fields.maxParticipants' | translate }}</mat-label>
            <input matInput formControlName="maxParticipants" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'training.fields.notes' | translate }}</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
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
export default class SessionCreateComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly programs = this.store.selectSignal(selectPrograms);
  readonly loading = this.store.selectSignal(selectTrainingLoading);

  readonly form = this.fb.nonNullable.group({
    trainingProgramId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    scheduledDate: ['', [Validators.required]],
    venue: [''],
    endDate: [''],
    maxParticipants: [null as number | null],
    notes: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(TrainingActions.loadPrograms({ page: 1, pageSize: 100 }));

    const programId = this.route.snapshot.queryParamMap.get('programId');
    if (programId) {
      this.form.patchValue({ trainingProgramId: programId });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateTrainingSessionRequest = {
      trainingProgramId: value.trainingProgramId,
      title: value.title,
      scheduledDate: value.scheduledDate,
      venue: value.venue || undefined,
      endDate: value.endDate || undefined,
      maxParticipants: value.maxParticipants ?? undefined,
      notes: value.notes || undefined,
    };
    this.store.dispatch(TrainingActions.createSession({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/training/sessions']);
  }
}
