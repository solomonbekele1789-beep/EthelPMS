import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { TrainingActions } from '../../store/training.actions';
import { selectPrograms, selectProgramsTotalCount, selectTrainingLoading } from '../../store/training.selectors';
import { TrainingCategory } from '../../models/training-program.model';

@Component({
  selector: 'ethel-program-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
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
    <app-page-header [title]="'training.programs.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'training.programs.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'training.programs.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="project-filter">
          <mat-label>{{ 'training.fields.projectId' | translate }}</mat-label>
          <input matInput [value]="projectIdFilter()" (keyup.enter)="onProjectIdSearch($event)" />
        </mat-form-field>
      </div>

      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!categoryFilter()"
            (click)="onCategoryFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (cat of categories; track cat) {
            <mat-chip
              [highlighted]="categoryFilter() === cat"
              (click)="onCategoryFilter(cat)">
              {{ cat }}
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="programs()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No training programs found"
        emptyMessage="Get started by creating your first training program."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #activeTpl let-row>
      <mat-chip [highlighted]="row.isActive" [class.active-chip]="row.isActive">
        {{ row.isActive ? 'Active' : 'Inactive' }}
      </mat-chip>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; align-items: center; gap: 1rem; }
    .project-filter { width: 280px; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
    .active-chip { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
  `,
})
export default class ProgramListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly programs = this.store.selectSignal(selectPrograms);
  readonly totalCount = this.store.selectSignal(selectProgramsTotalCount);
  readonly loading = this.store.selectSignal(selectTrainingLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly projectIdFilter = signal('');
  readonly categoryFilter = signal<TrainingCategory | undefined>(undefined);

  readonly categories: TrainingCategory[] = ['Technical', 'LifeSkills', 'Financial', 'Health', 'Agriculture', 'Other'];

  readonly activeTpl = viewChild<TemplateRef<unknown>>('activeTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'projectId', label: 'Project ID' },
    { key: 'totalSessions', label: 'Total Sessions' },
    { key: 'isActive', label: 'Status', template: this.activeTpl() },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.store.dispatch(
      TrainingActions.loadPrograms({
        page: this.page(),
        pageSize: this.pageSize(),
        projectId: this.projectIdFilter() || undefined,
        category: this.categoryFilter(),
      })
    );
  }

  onProjectIdSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectIdFilter.set(value);
    this.page.set(1);
    this.loadPrograms();
  }

  onCategoryFilter(category: TrainingCategory | undefined): void {
    this.categoryFilter.set(category);
    this.page.set(1);
    this.loadPrograms();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadPrograms();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/training/programs', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/training/programs/create']);
  }
}
