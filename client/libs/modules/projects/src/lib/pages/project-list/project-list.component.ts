import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
  StatusBadgeComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProjectActions } from '../../store/project.actions';
import { selectProjects, selectProjectTotalCount, selectProjectsLoading } from '../../store/project.selectors';
import { ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'ethel-project-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'projects.list.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'projects.projects.create'" (click)="onCreateProject()">
        <mat-icon>add</mat-icon>
        {{ 'projects.list.createButton' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <app-search-input placeholder="Search projects..." (search)="onSearch($event)"></app-search-input>

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
        [data]="projects()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No projects found"
        emptyMessage="Get started by creating your first project."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #statusTpl let-row>
      <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.startDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #endDateTpl let-row>
      {{ row.endDate | date:'mediumDate' }}
    </ng-template>

    <ng-template #budgetTpl let-row>
      {{ row.totalBudget | currency:'USD':'symbol':'1.0-0' }}
    </ng-template>

    <ng-template #beneficiariesTpl let-row>
      {{ row.totalDirectBeneficiaries | number }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-chips { display: flex; align-items: center; gap: 0.5rem; }
  `,
})
export default class ProjectListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly projects = this.store.selectSignal(selectProjects);
  readonly totalCount = this.store.selectSignal(selectProjectTotalCount);
  readonly loading = this.store.selectSignal(selectProjectsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<ProjectStatus | undefined>(undefined);
  readonly sortBy = signal<string | undefined>(undefined);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly statuses: ProjectStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly endDateTpl = viewChild<TemplateRef<unknown>>('endDateTpl');
  readonly budgetTpl = viewChild<TemplateRef<unknown>>('budgetTpl');
  readonly beneficiariesTpl = viewChild<TemplateRef<unknown>>('beneficiariesTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'donorName', label: 'Donor' },
    { key: 'startDate', label: 'Start Date', sortable: true, template: this.dateTpl() },
    { key: 'endDate', label: 'End Date', sortable: true, template: this.endDateTpl() },
    { key: 'totalBudget', label: 'Budget', sortable: true, template: this.budgetTpl() },
    { key: 'totalDirectBeneficiaries', label: 'Beneficiaries', template: this.beneficiariesTpl() },
  ]);

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.store.dispatch(
      ProjectActions.loadProjects({
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
    this.loadProjects();
  }

  onStatusFilter(status: ProjectStatus | undefined): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadProjects();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadProjects();
  }

  onSortChange(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy.set(event.sortBy);
    this.sortDir.set(event.sortDir);
    this.loadProjects();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/projects', row.id]);
  }

  onCreateProject(): void {
    this.router.navigate(['/projects/create']);
  }
}
