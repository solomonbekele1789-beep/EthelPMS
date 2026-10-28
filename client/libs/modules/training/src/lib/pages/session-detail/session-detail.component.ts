import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { TrainingActions } from '../../store/training.actions';
import { selectSelectedSession, selectTrainingLoading } from '../../store/training.selectors';
import { TrainingSessionService } from '../../services/training-session.service';
import { TrainingParticipantDto, AttendanceStatus } from '../../models/training-session.model';

@Component({
  selector: 'ethel-session-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="session()?.title ?? ('training.sessions.detail' | translate)">
      @if (session()) {
        <app-status-badge [status]="session()!.status" [label]="session()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !session()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (session()) {
      <div class="detail-grid">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.title' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ session()!.title }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.venue' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ session()!.venue || '-' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.scheduledDate' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ session()!.scheduledDate | date:'mediumDate' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.endDate' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ session()!.endDate ? (session()!.endDate | date:'mediumDate') : '-' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.status' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <app-status-badge [status]="session()!.status" [label]="session()!.status"></app-status-badge>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.maxParticipants' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ session()!.maxParticipants ?? '-' }}</mat-card-content>
        </mat-card>
      </div>

      @if (session()!.notes) {
        <mat-card class="narrative-card">
          <mat-card-header><mat-card-title>{{ 'training.fields.notes' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ session()!.notes }}</mat-card-content>
        </mat-card>
      }

      <!-- Actions Bar -->
      <div class="action-buttons">
        @if (session()!.status === 'InProgress' || session()!.status === 'Scheduled') {
          <button
            mat-flat-button
            color="primary"
            *appHasPermission="'training.sessions.update'"
            [disabled]="completing()"
            (click)="onCompleteSession()">
            @if (completing()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>check_circle</mat-icon>
              {{ 'training.sessions.complete' | translate }}
            }
          </button>
        }
        <button mat-button (click)="goBack()">
          {{ 'common.back' | translate }}
        </button>
      </div>

      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Participants Tab -->
        <mat-tab [label]="'training.sessions.participants' | translate">
          <div class="tab-content">
            <!-- Register Participant Form -->
            <div class="section-header" *appHasPermission="'training.sessions.update'">
              <button mat-stroked-button (click)="toggleRegisterForm()">
                <mat-icon>{{ showRegisterForm() ? 'close' : 'person_add' }}</mat-icon>
                {{ showRegisterForm() ? ('common.cancel' | translate) : ('training.sessions.registerParticipant' | translate) }}
              </button>
            </div>

            @if (showRegisterForm()) {
              <form [formGroup]="registerForm" (ngSubmit)="onRegisterParticipant()" class="inline-form">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'training.fields.fullName' | translate }}</mat-label>
                    <input matInput formControlName="fullName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'training.fields.participantId' | translate }}</mat-label>
                    <input matInput formControlName="participantId" />
                  </mat-form-field>
                  <button mat-flat-button color="primary" type="submit" [disabled]="registerForm.invalid || registering()">
                    @if (registering()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <app-data-table
              [columns]="participantColumns()"
              [data]="participants()"
              [loading]="loading()"
              [totalCount]="participants().length"
              [page]="1"
              [pageSize]="100"
              emptyTitle="No participants"
              emptyMessage="Register participants for this training session.">
            </app-data-table>
          </div>

          <ng-template #participantStatusTpl let-row>
            <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
          </ng-template>

          <ng-template #attendanceActionTpl let-row>
            @if (editingParticipantId() === row.id) {
              <div class="attendance-form">
                <mat-select
                  [value]="attendanceStatus()"
                  (selectionChange)="attendanceStatus.set($event.value)"
                  class="attendance-select">
                  <mat-option value="Attended">Attended</mat-option>
                  <mat-option value="Absent">Absent</mat-option>
                </mat-select>
                <button mat-icon-button color="primary" (click)="onSaveAttendance(row)">
                  <mat-icon>check</mat-icon>
                </button>
                <button mat-icon-button (click)="onCancelAttendance()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            } @else {
              <button mat-icon-button *appHasPermission="'training.sessions.update'" (click)="onRecordAttendance(row)">
                <mat-icon>how_to_reg</mat-icon>
              </button>
            }
          </ng-template>
        </mat-tab>

        <!-- Session Info Tab -->
        <mat-tab [label]="'training.sessions.info' | translate">
          <div class="tab-content">
            <div class="info-grid">
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'training.fields.programId' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ session()!.trainingProgramId }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'training.fields.createdAt' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ session()!.createdAt | date:'medium' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'training.fields.participantCount' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ session()!.participants.length }}</mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="event"
        title="Session not found"
        message="The requested training session could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .narrative-card { margin-bottom: 1rem; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .tab-content { padding: 1.5rem 0; }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .inline-form { margin-bottom: 1rem; }
    .form-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .form-row mat-form-field { flex: 1; min-width: 200px; }
    .attendance-form {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .attendance-select { width: 120px; }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
  `,
})
export default class SessionDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly sessionService = inject(TrainingSessionService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly session = this.store.selectSignal(selectSelectedSession);
  readonly loading = this.store.selectSignal(selectTrainingLoading);

  readonly participants = computed<TrainingParticipantDto[]>(
    () => this.session()?.participants ?? []
  );

  readonly activeTab = signal(0);
  readonly completing = signal(false);
  readonly showRegisterForm = signal(false);
  readonly registering = signal(false);
  readonly editingParticipantId = signal<string | null>(null);
  readonly attendanceStatus = signal<AttendanceStatus>('Attended');

  readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    participantId: [''],
  });

  readonly participantStatusTpl = viewChild<TemplateRef<unknown>>('participantStatusTpl');
  readonly attendanceActionTpl = viewChild<TemplateRef<unknown>>('attendanceActionTpl');

  readonly participantColumns = computed<TableColumn[]>(() => [
    { key: 'fullName', label: 'Full Name' },
    { key: 'status', label: 'Status', template: this.participantStatusTpl() },
    { key: 'preTestScore', label: 'Pre-Test Score' },
    { key: 'postTestScore', label: 'Post-Test Score' },
    { key: 'certificateNumber', label: 'Certificate #' },
    { key: 'actions', label: 'Actions', template: this.attendanceActionTpl() },
  ]);

  ngOnInit(): void {
    this.store.dispatch(TrainingActions.loadSession({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  onCompleteSession(): void {
    const session = this.session();
    if (!session) return;
    this.completing.set(true);
    this.sessionService.completeSession(session.id).subscribe({
      next: () => {
        this.notification.success('Session completed successfully');
        this.store.dispatch(TrainingActions.loadSession({ id: this.id() }));
        this.completing.set(false);
      },
      error: () => {
        this.notification.error('Failed to complete session');
        this.completing.set(false);
      },
    });
  }

  toggleRegisterForm(): void {
    this.showRegisterForm.update(v => !v);
    if (this.showRegisterForm()) {
      this.registerForm.reset();
    }
  }

  onRegisterParticipant(): void {
    if (this.registerForm.invalid) return;
    const value = this.registerForm.getRawValue();
    this.registering.set(true);
    this.sessionService
      .registerParticipant(this.id(), {
        trainingSessionId: this.id(),
        fullName: value.fullName,
        participantId: value.participantId || undefined,
      })
      .subscribe({
        next: () => {
          this.notification.success('Participant registered successfully');
          this.registerForm.reset();
          this.showRegisterForm.set(false);
          this.registering.set(false);
          this.store.dispatch(TrainingActions.loadSession({ id: this.id() }));
        },
        error: () => {
          this.notification.error('Failed to register participant');
          this.registering.set(false);
        },
      });
  }

  onRecordAttendance(participant: TrainingParticipantDto): void {
    this.editingParticipantId.set(participant.id);
    this.attendanceStatus.set('Attended');
  }

  onCancelAttendance(): void {
    this.editingParticipantId.set(null);
  }

  onSaveAttendance(participant: TrainingParticipantDto): void {
    this.sessionService
      .recordAttendance(participant.id, {
        trainingParticipantId: participant.id,
        status: this.attendanceStatus(),
      })
      .subscribe({
        next: () => {
          this.notification.success('Attendance recorded successfully');
          this.editingParticipantId.set(null);
          this.store.dispatch(TrainingActions.loadSession({ id: this.id() }));
        },
        error: () => {
          this.notification.error('Failed to record attendance');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/training/sessions']);
  }
}
