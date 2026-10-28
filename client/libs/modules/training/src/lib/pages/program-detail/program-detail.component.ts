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
import { selectPrograms, selectSessions, selectSessionsTotalCount, selectTrainingLoading } from '../../store/training.selectors';
import { TrainingProgramService } from '../../services/training-program.service';
import { TrainingMaterialService } from '../../services/training-material.service';
import { TrainingProgramDto, TrainingCategory, UpdateTrainingProgramRequest } from '../../models/training-program.model';
import { TrainingMaterialDto, AddTrainingMaterialRequest } from '../../models/training-material.model';

@Component({
  selector: 'ethel-program-detail',
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
    <app-page-header [title]="program()?.title ?? ('training.programs.detail' | translate)">
      @if (program()) {
        <mat-chip [highlighted]="program()!.isActive">
          {{ program()!.isActive ? 'Active' : 'Inactive' }}
        </mat-chip>
      }
    </app-page-header>

    @if (loading() && !program()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (program()) {
      <div class="detail-grid">
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.title' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ program()!.title }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.category' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ program()!.category }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.projectId' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ program()!.projectId }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.totalSessions' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ program()!.totalSessions }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.status' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ program()!.isActive ? 'Active' : 'Inactive' }}</mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>{{ 'training.fields.createdAt' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>{{ program()!.createdAt | date:'mediumDate' }}</mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Program Info Tab -->
        <mat-tab [label]="'training.programs.info' | translate">
          <div class="tab-content">
            @if (program()!.description) {
              <mat-card class="narrative-card">
                <mat-card-header><mat-card-title>{{ 'training.fields.description' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ program()!.description }}</mat-card-content>
              </mat-card>
            }

            <div class="section-header" *appHasPermission="'training.programs.update'">
              <button mat-stroked-button (click)="toggleEditMode()">
                <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
                {{ editing() ? ('common.cancel' | translate) : ('common.edit' | translate) }}
              </button>
            </div>

            @if (editing()) {
              <form [formGroup]="editForm" (ngSubmit)="onUpdateProgram()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'training.fields.title' | translate }}</mat-label>
                    <input matInput formControlName="title" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'training.fields.category' | translate }}</mat-label>
                    <mat-select formControlName="category">
                      @for (cat of categories; track cat) {
                        <mat-option [value]="cat">{{ cat }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'training.fields.totalSessions' | translate }}</mat-label>
                    <input matInput formControlName="totalSessions" type="number" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'training.fields.description' | translate }}</mat-label>
                    <textarea matInput formControlName="description" rows="3"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving()">
                    @if (saving()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Sessions Tab -->
        <mat-tab [label]="'training.sessions.title' | translate">
          <div class="tab-content">
            <div class="section-header">
              <button mat-flat-button color="primary" *appHasPermission="'training.sessions.create'" (click)="onCreateSession()">
                <mat-icon>add</mat-icon>
                {{ 'training.sessions.createButton' | translate }}
              </button>
            </div>

            <app-data-table
              [columns]="sessionColumns()"
              [data]="sessions()"
              [loading]="loading()"
              [totalCount]="sessionsTotalCount()"
              [page]="sessionsPage()"
              [pageSize]="sessionsPageSize()"
              emptyTitle="No sessions found"
              emptyMessage="Create a session for this training program."
              (pageChange)="onSessionsPageChange($event)"
              (rowClick)="onSessionRowClick($event)">
            </app-data-table>
          </div>

          <ng-template #sessionStatusTpl let-row>
            <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
          </ng-template>

          <ng-template #sessionDateTpl let-row>
            {{ row.scheduledDate | date:'mediumDate' }}
          </ng-template>
        </mat-tab>

        <!-- Materials Tab -->
        <mat-tab [label]="'training.materials.title' | translate">
          <div class="tab-content">
            @if (materials().length > 0) {
              <div class="materials-list">
                @for (material of materials(); track material.id) {
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>{{ material.title }}</mat-card-title>
                      <mat-card-subtitle>{{ material.materialType }}</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      @if (material.description) {
                        <p>{{ material.description }}</p>
                      }
                      @if (material.fileUrl) {
                        <a [href]="material.fileUrl" target="_blank">{{ material.fileUrl }}</a>
                      }
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            } @else {
              <app-empty-state
                icon="library_books"
                title="No materials"
                message="Add training materials for this program.">
              </app-empty-state>
            }

            <div class="section-header" *appHasPermission="'training.materials.create'">
              <button mat-stroked-button (click)="toggleMaterialForm()">
                <mat-icon>{{ showMaterialForm() ? 'close' : 'add' }}</mat-icon>
                {{ showMaterialForm() ? ('common.cancel' | translate) : ('training.materials.add' | translate) }}
              </button>
            </div>

            @if (showMaterialForm()) {
              <form [formGroup]="materialForm" (ngSubmit)="onAddMaterial()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'training.fields.title' | translate }}</mat-label>
                    <input matInput formControlName="title" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'training.fields.materialType' | translate }}</mat-label>
                    <mat-select formControlName="materialType">
                      @for (type of materialTypes; track type) {
                        <mat-option [value]="type">{{ type }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'training.fields.description' | translate }}</mat-label>
                    <textarea matInput formControlName="description" rows="2"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'training.fields.fileUrl' | translate }}</mat-label>
                    <input matInput formControlName="fileUrl" />
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="materialForm.invalid || savingMaterial()">
                    @if (savingMaterial()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="school"
        title="Program not found"
        message="The requested training program could not be found.">
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
    .tab-content { padding: 1.5rem 0; }
    .narrative-card { margin-bottom: 1rem; }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .edit-form { margin-top: 1rem; }
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
      margin-top: 1rem;
    }
    .materials-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }
  `,
})
export default class ProgramDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly programService = inject(TrainingProgramService);
  private readonly materialService = inject(TrainingMaterialService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly programs = this.store.selectSignal(selectPrograms);
  readonly sessions = this.store.selectSignal(selectSessions);
  readonly sessionsTotalCount = this.store.selectSignal(selectSessionsTotalCount);
  readonly loading = this.store.selectSignal(selectTrainingLoading);

  readonly program = computed<TrainingProgramDto | undefined>(
    () => this.programs().find(p => p.id === this.id())
  );

  readonly activeTab = signal(0);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly showMaterialForm = signal(false);
  readonly savingMaterial = signal(false);
  readonly materials = signal<TrainingMaterialDto[]>([]);
  readonly sessionsPage = signal(1);
  readonly sessionsPageSize = signal(20);

  readonly categories: TrainingCategory[] = ['Technical', 'LifeSkills', 'Financial', 'Health', 'Agriculture', 'Other'];
  readonly materialTypes = ['Document', 'Video', 'Presentation', 'Handout', 'Guide', 'Other'];

  readonly editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    totalSessions: [1, [Validators.required, Validators.min(1)]],
    description: [''],
  });

  readonly materialForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    materialType: ['', [Validators.required]],
    description: [''],
    fileUrl: [''],
  });

  readonly sessionStatusTpl = viewChild<TemplateRef<unknown>>('sessionStatusTpl');
  readonly sessionDateTpl = viewChild<TemplateRef<unknown>>('sessionDateTpl');

  readonly sessionColumns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'scheduledDate', label: 'Scheduled Date', template: this.sessionDateTpl() },
    { key: 'status', label: 'Status', template: this.sessionStatusTpl() },
    { key: 'maxParticipants', label: 'Max Participants' },
  ]);

  ngOnInit(): void {
    this.store.dispatch(
      TrainingActions.loadPrograms({ page: 1, pageSize: 100 })
    );
    this.loadSessions();
  }

  loadSessions(): void {
    this.store.dispatch(
      TrainingActions.loadSessions({
        programId: this.id(),
        page: this.sessionsPage(),
        pageSize: this.sessionsPageSize(),
      })
    );
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  toggleEditMode(): void {
    if (!this.editing()) {
      const p = this.program();
      if (p) {
        this.editForm.patchValue({
          title: p.title,
          category: p.category,
          totalSessions: p.totalSessions,
          description: p.description ?? '',
        });
      }
    }
    this.editing.update(v => !v);
  }

  onUpdateProgram(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateTrainingProgramRequest = {
      programId: this.id(),
      title: value.title,
      category: value.category as TrainingCategory,
      totalSessions: value.totalSessions,
      description: value.description || undefined,
    };
    this.saving.set(true);
    this.programService.updateProgram(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Program updated successfully');
        this.editing.set(false);
        this.saving.set(false);
        this.store.dispatch(TrainingActions.loadPrograms({ page: 1, pageSize: 100 }));
      },
      error: () => {
        this.notification.error('Failed to update program');
        this.saving.set(false);
      },
    });
  }

  toggleMaterialForm(): void {
    this.showMaterialForm.update(v => !v);
    if (this.showMaterialForm()) {
      this.materialForm.reset();
    }
  }

  onAddMaterial(): void {
    if (this.materialForm.invalid) return;
    const value = this.materialForm.getRawValue();
    const request: AddTrainingMaterialRequest = {
      trainingProgramId: this.id(),
      title: value.title,
      materialType: value.materialType,
      description: value.description || undefined,
      fileUrl: value.fileUrl || undefined,
    };
    this.savingMaterial.set(true);
    this.materialService.addMaterial(request).subscribe({
      next: (result) => {
        this.notification.success('Material added successfully');
        this.materials.update(list => [
          ...list,
          {
            id: result.id,
            trainingProgramId: this.id(),
            title: value.title,
            materialType: value.materialType,
            description: value.description || undefined,
            fileUrl: value.fileUrl || undefined,
            createdAt: new Date().toISOString(),
          },
        ]);
        this.materialForm.reset();
        this.showMaterialForm.set(false);
        this.savingMaterial.set(false);
      },
      error: () => {
        this.notification.error('Failed to add material');
        this.savingMaterial.set(false);
      },
    });
  }

  onCreateSession(): void {
    this.router.navigate(['/training/sessions/create'], {
      queryParams: { programId: this.id() },
    });
  }

  onSessionsPageChange(event: { page: number; pageSize: number }): void {
    this.sessionsPage.set(event.page);
    this.sessionsPageSize.set(event.pageSize);
    this.loadSessions();
  }

  onSessionRowClick(row: any): void {
    this.router.navigate(['/training/sessions', row.id]);
  }
}
