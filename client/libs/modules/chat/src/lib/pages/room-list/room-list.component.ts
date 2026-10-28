import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
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
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ChatActions } from '../../store/chat.actions';
import {
  selectRooms,
  selectRoomsTotalCount,
  selectChatLoading,
} from '../../store/chat.selectors';
import { ChatRoomDto } from '../../models/chat-room.model';

@Component({
  selector: 'ethel-room-list',
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
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'chat.rooms.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'chat.rooms.create'" (click)="onCreate()">
        <mat-icon>add</mat-icon>
        {{ 'chat.rooms.create' | translate }}
      </button>
    </app-page-header>

    <div class="list-container">
      <div class="filter-row">
        <app-search-input placeholder="Search rooms..." (search)="onSearch($event)"></app-search-input>
      </div>

      <app-data-table
        [columns]="columns()"
        [data]="rooms()"
        [loading]="loading()"
        [totalCount]="totalCount()"
        [page]="page()"
        [pageSize]="pageSize()"
        emptyTitle="No chat rooms found"
        emptyMessage="Get started by creating your first chat room."
        (pageChange)="onPageChange($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>

    <ng-template #nameTpl let-row>
      <span class="room-name">{{ row.name || 'Direct' }}</span>
    </ng-template>

    <ng-template #typeTpl let-row>
      <mat-chip [class.type-direct]="row.type === 'Direct'"
                [class.type-group]="row.type === 'Group'"
                [class.type-channel]="row.type === 'Channel'">
        {{ row.type }}
      </mat-chip>
    </ng-template>

    <ng-template #previewTpl let-row>
      <span class="message-preview">{{ row.lastMessagePreview ? (row.lastMessagePreview.length > 50 ? row.lastMessagePreview.substring(0, 50) + '...' : row.lastMessagePreview) : '-' }}</span>
    </ng-template>

    <ng-template #dateTpl let-row>
      {{ row.createdAt | date:'mediumDate' }}
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .room-name { font-weight: 500; }
    .message-preview { color: rgba(0, 0, 0, 0.6); font-size: 0.875rem; }
    .type-direct { --mdc-chip-elevated-container-color: #e8eaf6; color: #3f51b5; }
    .type-group { --mdc-chip-elevated-container-color: #e0f2f1; color: #009688; }
    .type-channel { --mdc-chip-elevated-container-color: #f3e5f5; color: #9c27b0; }
  `,
})
export default class RoomListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly rooms = this.store.selectSignal(selectRooms);
  readonly totalCount = this.store.selectSignal(selectRoomsTotalCount);
  readonly loading = this.store.selectSignal(selectChatLoading);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');

  readonly nameTpl = viewChild<TemplateRef<unknown>>('nameTpl');
  readonly typeTpl = viewChild<TemplateRef<unknown>>('typeTpl');
  readonly previewTpl = viewChild<TemplateRef<unknown>>('previewTpl');
  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'Name', template: this.nameTpl() },
    { key: 'type', label: 'Type', template: this.typeTpl() },
    { key: 'participantCount', label: 'Participants' },
    { key: 'lastMessagePreview', label: 'Last Message', template: this.previewTpl() },
    { key: 'createdAt', label: 'Created', template: this.dateTpl() },
  ]);

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.store.dispatch(
      ChatActions.loadRooms({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || undefined,
      })
    );
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadRooms();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadRooms();
  }

  onRowClick(row: ChatRoomDto): void {
    this.router.navigate(['/chat', row.id]);
  }

  onCreate(): void {
    this.router.navigate(['/chat/create']);
  }
}
