import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  SearchInputComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DocumentsActions } from '../../store/documents.actions';
import {
  selectDocuments,
  selectDocumentsTotalCount,
  selectDocumentsLoading,
} from '../../store/documents.selectors';
import { DocumentCategory, DocumentStatus } from '../../models/document.model';

@Component({
  selector: 'ethel-document-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'documents.documents.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'documents.documents.create'" (click)="onUpload()">
        <mat-icon>upload</mat-icon>
        {{ 'documents.documents.upload' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <app-search-input placeholder="Search documents..." (search)="onSearch($event)"></app-search-input>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'documents.fields.folderId' | translate }}</mat-label>
          <input matInput [value]="folderIdFilter()" (change)="onFolderIdFilter($any($event.target).value)" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'documents.fields.category' | translate }}</mat-label>
          <mat-select [value]="categoryFilter()" (selectionChange)="onCategoryFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (cat of categories; track cat) {
              <mat-option [value]="cat">{{ cat }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'documents.fields.status' | translate }}</mat-label>
          <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilter($event.value)">
            <mat-option [value]="''">{{ 'common.all' | translate }}</mat-option>
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ s }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="onFolders()">
          <mat-icon>folder</mat-icon>
          {{ 'documents.folders.title' | translate }}
        </button>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="documents()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No documents found"
        emptyMessage="Get started by uploading your first document."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #categoryTpl let-row>
      <mat-chip>{{ row.category }}</mat-chip>
    </ng-template>

    <ng-template #statusTpl let-row>
      <mat-chip [class.status-draft]="row.status === 'Draft'"
                [class.status-published]="row.status === 'Published'"
                [class.status-archived]="row.status === 'Archived'">
        {{ row.status }}
      </mat-chip>
    </ng-template>

    <ng-template #sizeTpl let-row>
      {{ formatFileSize(row.fileSizeBytes) }}
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-field { width: 180px; }
    .status-draft { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-published { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-archived { --mdc-chip-elevated-container-color: #ffe0b2; }
  `,
})
export default class DocumentListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly documents = this.store.selectSignal(selectDocuments);
  readonly totalCount = this.store.selectSignal(selectDocumentsTotalCount);
  readonly loading = this.store.selectSignal(selectDocumentsLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly folderIdFilter = signal('');
  readonly categoryFilter = signal('');
  readonly statusFilter = signal('');

  readonly categories: DocumentCategory[] = ['General', 'Policy', 'Report', 'Contract', 'Template', 'Training', 'Procurement', 'Financial', 'Other'];
  readonly statuses: DocumentStatus[] = ['Draft', 'Published', 'Archived'];

  readonly categoryTpl = viewChild<TemplateRef<unknown>>('categoryTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly sizeTpl = viewChild<TemplateRef<unknown>>('sizeTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'fileName', label: 'File Name', sortable: true },
    { key: 'displayName', label: 'Display Name' },
    { key: 'category', label: 'Category', template: this.categoryTpl() },
    { key: 'status', label: 'Status', template: this.statusTpl() },
    { key: 'fileSizeBytes', label: 'Size', template: this.sizeTpl() },
    { key: 'currentVersion', label: 'Version' },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.store.dispatch(
      DocumentsActions.loadDocuments({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
        folderId: this.folderIdFilter() || undefined,
        category: this.categoryFilter() || undefined,
        status: this.statusFilter() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadDocuments();
  }

  onFolderIdFilter(value: string): void {
    this.folderIdFilter.set(value);
    this.page.set(1);
    this.loadDocuments();
  }

  onCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
    this.page.set(1);
    this.loadDocuments();
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.loadDocuments();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadDocuments();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/documents', row.id]);
  }

  onUpload(): void {
    this.router.navigate(['/documents/upload']);
  }

  onFolders(): void {
    this.router.navigate(['/documents/folders']);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
