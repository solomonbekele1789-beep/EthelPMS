import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ParticipantsActions } from '../../store/participants.actions';
import {
  selectParticipants,
  selectParticipantsTotalCount,
  selectParticipantsLoading,
} from '../../store/participants.selectors';
import { ParticipantStatus } from '../../models/participant.model';

@Component({
  selector: 'ethel-participant-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'participants.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'participants.profiles.create'" (click)="onRegister()">
        <mat-icon>person_add</mat-icon>
        {{ 'participants.register' | translate }}
      </button>
      <button mat-stroked-button (click)="onGraduationPipeline()">
        <mat-icon>school</mat-icon>
        {{ 'participants.graduation.pipeline' | translate }}
      </button>
      <button mat-stroked-button (click)="onBenchmarks()">
        <mat-icon>tune</mat-icon>
        {{ 'participants.graduation.benchmarks' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <app-search-input placeholder="Search participants..." (search)="onSearch($event)"></app-search-input>

      <div class="filter-chips">
        <mat-chip-set>
          <mat-chip
            [highlighted]="!statusFilter()"
            (click)="onStatusFilter(undefined)">
            {{ 'common.all' | translate }}
          </mat-chip>
          @for (status of statuses; track status) {
            <mat-chip
              [highlighted]="statusFilter() === status"
              (click)="onStatusFilter(status)">
              <app-status-badge [status]="status" [label]="status"></app-status-badge>
            </mat-chip>
          }
        </mat-chip-set>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="participants()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No participants found"
        emptyMessage="Get started by registering your first participant."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.registrationDate | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class ParticipantListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly participants = this.store.selectSignal(selectParticipants);
  readonly totalCount = this.store.selectSignal(selectParticipantsTotalCount);
  readonly loading = this.store.selectSignal(selectParticipantsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<ParticipantStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: ParticipantStatus[] = ['Active', 'Inactive', 'Graduated', 'Exited'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'participantCode', label: 'Code', sortable: true },
    { key: 'gender', label: 'Gender' },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'woreda', label: 'Woreda' },
    { key: 'registrationDate', label: 'Registered', sortable: true, template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadParticipants();
  }

  loadParticipants(): void {
    this.store.dispatch(
      ParticipantsActions.loadParticipants({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
        status: this.statusFilter(),
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadParticipants();
  }

  onStatusFilter(status: ParticipantStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadParticipants();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadParticipants();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
    this.loadParticipants();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/participants', row.id]);
  }

  onRegister(): void {
    this.router.navigate(['/participants/create']);
  }

  onGraduationPipeline(): void {
    this.router.navigate(['/participants/graduation/pipeline']);
  }

  onBenchmarks(): void {
    this.router.navigate(['/participants/graduation/benchmarks']);
  }
}
