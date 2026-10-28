import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  template?: TemplateRef<unknown>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatProgressBarModule, LoadingSpinnerComponent, EmptyStateComponent
  ],
  template: `
    @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

    @if (!loading && data.length === 0) {
      <app-empty-state
        [title]="emptyTitle"
        [message]="emptyMessage"
        [actionLabel]="emptyAction"
        (action)="emptyActionClick.emit()">
      </app-empty-state>
    } @else {
      <table mat-table [dataSource]="data" matSort (matSortChange)="onSort($event)">
        @for (col of columns; track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef [mat-sort-header]="col.sortable ? col.key : ''"
                [style.width]="col.width">
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              @if (col.template) {
                <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }">
                </ng-container>
              } @else {
                {{ row[col.key] }}
              }
            </td>
          </ng-container>
        }
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"
            (click)="rowClick.emit(row)" class="clickable-row"></tr>
      </table>

      <mat-paginator
        [length]="totalCount"
        [pageIndex]="page - 1"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 20, 50, 100]"
        (page)="onPage($event)">
      </mat-paginator>
    }
  `,
  styles: [`.clickable-row { cursor: pointer; } .clickable-row:hover { background: #f5f5f5; }`]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() emptyTitle = 'No items found';
  @Input() emptyMessage = '';
  @Input() emptyAction?: string;

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<{ sortBy: string; sortDir: 'asc' | 'desc' }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() emptyActionClick = new EventEmitter<void>();

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }

  onSort(event: Sort): void {
    this.sortChange.emit({
      sortBy: event.active,
      sortDir: (event.direction as 'asc' | 'desc') || 'asc'
    });
  }
}
