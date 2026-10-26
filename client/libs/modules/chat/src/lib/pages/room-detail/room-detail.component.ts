import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ChatActions } from '../../store/chat.actions';
import { selectSelectedRoom, selectMessages, selectChatLoading } from '../../store/chat.selectors';
import { ChatRoomService } from '../../services/chat-room.service';
import { ChatMessageService } from '../../services/chat-message.service';
import { ChatRoomDto } from '../../models/chat-room.model';
import { ChatMessageDto, MessageStatus, SendMessageRequest, EditMessageRequest, ReactToMessageRequest } from '../../models/chat-message.model';
import { ChatParticipantDto, PresenceStatus } from '../../models/chat-participant.model';
import { AddParticipantRequest } from '../../models/chat-room.model';

@Component({
  selector: 'ethel-room-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="room()?.name ?? ('chat.rooms.detail' | translate)">
      @if (room()) {
        <mat-chip [class.type-direct]="room()!.type === 'Direct'"
                  [class.type-group]="room()!.type === 'Group'"
                  [class.type-channel]="room()!.type === 'Channel'">
          {{ room()!.type }}
        </mat-chip>
      }
    </app-page-header>

    @if (loading() && !room()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (room()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Messages Tab -->
        <mat-tab [label]="'chat.tabs.messages' | translate">
          <div class="tab-content">
            <div class="messages-container">
              <div class="messages-list">
                @if (messages().length === 0) {
                  <app-empty-state
                    icon="chat_bubble_outline"
                    title="No messages yet"
                    message="Send the first message to start the conversation.">
                  </app-empty-state>
                } @else {
                  @for (message of messages(); track message.id) {
                    <div class="message-bubble" [class.deleted]="message.status === 'Deleted'">
                      @if (editingMessageId() === message.id) {
                        <div class="message-edit">
                          <mat-form-field appearance="outline" class="edit-field">
                            <textarea matInput [(ngModel)]="editContent" rows="2"></textarea>
                          </mat-form-field>
                          <div class="edit-actions">
                            <button mat-button (click)="cancelEdit()">{{ 'common.cancel' | translate }}</button>
                            <button mat-flat-button color="primary" (click)="saveEdit(message.id)" [disabled]="savingEdit()">
                              @if (savingEdit()) {
                                <mat-spinner diameter="16"></mat-spinner>
                              } @else {
                                {{ 'common.save' | translate }}
                              }
                            </button>
                          </div>
                        </div>
                      } @else {
                        <div class="message-header">
                          <span class="sender-name">{{ message.senderDisplayName }}</span>
                          <span class="message-time">{{ message.createdAt | date:'short' }}</span>
                          <mat-chip class="status-chip"
                                    [class.status-sent]="message.status === 'Sent'"
                                    [class.status-delivered]="message.status === 'Delivered'"
                                    [class.status-read]="message.status === 'Read'"
                                    [class.status-deleted]="message.status === 'Deleted'">
                            {{ message.status }}
                          </mat-chip>
                        </div>
                        <div class="message-content">
                          @if (message.status === 'Deleted') {
                            <em class="deleted-text">[Message deleted]</em>
                          } @else {
                            {{ message.content }}
                            @if (message.editedAt) {
                              <span class="edited-label">(edited)</span>
                            }
                          }
                        </div>
                        @if (message.threadReplyCount > 0) {
                          <button mat-button class="thread-badge" (click)="openThread(message.id)">
                            <mat-icon>forum</mat-icon>
                            {{ message.threadReplyCount }} {{ message.threadReplyCount === 1 ? 'reply' : 'replies' }}
                          </button>
                        }
                        @if (message.reaction) {
                          <div class="reactions">
                            <mat-chip class="reaction-chip">{{ message.reaction }}</mat-chip>
                          </div>
                        }
                        @if (message.status !== 'Deleted') {
                          <div class="message-actions">
                            <button mat-icon-button matTooltip="Edit" *appHasPermission="'chat.messages.edit'" (click)="startEdit(message)">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button matTooltip="Delete" *appHasPermission="'chat.messages.delete'" (click)="deleteMessage(message.id)">
                              <mat-icon>delete</mat-icon>
                            </button>
                            <button mat-icon-button [matMenuTriggerFor]="emojiMenu" matTooltip="React" *appHasPermission="'chat.messages.react'">
                              <mat-icon>add_reaction</mat-icon>
                            </button>
                            <mat-menu #emojiMenu="matMenu">
                              <button mat-menu-item (click)="reactToMessage(message.id, '👍')">&#x1F44D;</button>
                              <button mat-menu-item (click)="reactToMessage(message.id, '❤️')">&#x2764;&#xFE0F;</button>
                              <button mat-menu-item (click)="reactToMessage(message.id, '😂')">&#x1F602;</button>
                              <button mat-menu-item (click)="reactToMessage(message.id, '🎉')">&#x1F389;</button>
                              <button mat-menu-item (click)="reactToMessage(message.id, '👏')">&#x1F44F;</button>
                            </mat-menu>
                          </div>
                        }
                      }
                    </div>
                  }
                }
              </div>

              <div class="message-input-area" *appHasPermission="'chat.messages.send'">
                <mat-form-field appearance="outline" class="message-field">
                  <mat-label>{{ 'chat.messages.sendPlaceholder' | translate }}</mat-label>
                  <textarea matInput [(ngModel)]="newMessageContent" rows="2" (keydown.enter)="onSendMessage($event)"></textarea>
                </mat-form-field>
                <button mat-fab color="primary" (click)="onSendMessage()" [disabled]="!newMessageContent || sendingMessage()">
                  @if (sendingMessage()) {
                    <mat-spinner diameter="24"></mat-spinner>
                  } @else {
                    <mat-icon>send</mat-icon>
                  }
                </button>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Participants Tab -->
        <mat-tab [label]="'chat.tabs.participants' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'chat.rooms.manage'">
              <button mat-stroked-button (click)="toggleParticipantForm()">
                <mat-icon>{{ showParticipantForm() ? 'close' : 'person_add' }}</mat-icon>
                {{ showParticipantForm() ? ('common.cancel' | translate) : ('chat.participants.add' | translate) }}
              </button>
            </div>

            @if (showParticipantForm()) {
              <form [formGroup]="participantForm" (ngSubmit)="onAddParticipant()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'chat.fields.userId' | translate }}</mat-label>
                    <input matInput formControlName="userId" />
                    @if (participantForm.controls.userId.hasError('required')) {
                      <mat-error>User ID is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'chat.fields.displayName' | translate }}</mat-label>
                    <input matInput formControlName="displayName" />
                    @if (participantForm.controls.displayName.hasError('required')) {
                      <mat-error>Display name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-checkbox formControlName="isAdmin">{{ 'chat.fields.isAdmin' | translate }}</mat-checkbox>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="participantForm.invalid || savingParticipant()">
                    @if (savingParticipant()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <div class="participants-list">
              @if (participants().length === 0) {
                <app-empty-state
                  icon="group"
                  title="No participants"
                  message="Add participants to this chat room.">
                </app-empty-state>
              } @else {
                @for (p of participants(); track p.id) {
                  <div class="participant-row">
                    <div class="participant-info">
                      <span class="presence-dot"
                            [class.online]="p.presence === 'Online'"
                            [class.away]="p.presence === 'Away'"
                            [class.offline]="p.presence === 'Offline'"
                            [class.dnd]="p.presence === 'DoNotDisturb'"></span>
                      <span class="participant-name">{{ p.displayName }}</span>
                      @if (p.isAdmin) {
                        <mat-chip class="admin-chip">Admin</mat-chip>
                      }
                      <span class="presence-label">{{ p.presence === 'DoNotDisturb' ? 'Do Not Disturb' : p.presence }}</span>
                    </div>
                    <button mat-icon-button color="warn" matTooltip="Remove participant"
                            *appHasPermission="'chat.rooms.manage'" (click)="removeParticipant(p.userId)">
                      <mat-icon>person_remove</mat-icon>
                    </button>
                  </div>
                }
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="chat"
        title="Room not found"
        message="The requested chat room could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .tab-content { padding: 1.5rem 0; }
    .messages-container { display: flex; flex-direction: column; height: calc(100vh - 300px); min-height: 400px; }
    .messages-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem 0; }
    .message-bubble {
      background: #f5f5f5;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      max-width: 85%;
      position: relative;
    }
    .message-bubble.deleted { opacity: 0.6; }
    .message-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .sender-name { font-weight: 600; font-size: 0.875rem; }
    .message-time { font-size: 0.75rem; color: rgba(0, 0, 0, 0.45); }
    .status-chip { font-size: 0.625rem; min-height: 20px; padding: 0 6px; }
    .status-sent { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-delivered { --mdc-chip-elevated-container-color: #bbdefb; }
    .status-read { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-deleted { --mdc-chip-elevated-container-color: #ffcdd2; }
    .message-content { font-size: 0.9375rem; line-height: 1.5; word-break: break-word; }
    .edited-label { font-size: 0.75rem; color: rgba(0, 0, 0, 0.45); font-style: italic; margin-left: 4px; }
    .deleted-text { color: rgba(0, 0, 0, 0.45); }
    .thread-badge { font-size: 0.8125rem; color: #1976d2; margin-top: 0.25rem; }
    .reactions { display: flex; gap: 0.25rem; margin-top: 0.25rem; }
    .reaction-chip { font-size: 0.875rem; min-height: 24px; cursor: default; }
    .message-actions {
      display: flex;
      gap: 0;
      position: absolute;
      top: 4px;
      right: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .message-bubble:hover .message-actions { opacity: 1; }
    .message-actions button { width: 28px; height: 28px; font-size: 16px; }
    .message-actions mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .message-edit { display: flex; flex-direction: column; gap: 0.5rem; }
    .edit-field { width: 100%; }
    .edit-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .message-input-area { display: flex; align-items: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(0, 0, 0, 0.12); }
    .message-field { flex: 1; }
    .type-direct { --mdc-chip-elevated-container-color: #e8eaf6; color: #3f51b5; }
    .type-group { --mdc-chip-elevated-container-color: #e0f2f1; color: #009688; }
    .type-channel { --mdc-chip-elevated-container-color: #f3e5f5; color: #9c27b0; }
    .section-header { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
    .edit-form { margin-bottom: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.5rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
    .participants-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .participant-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .participant-info { display: flex; align-items: center; gap: 0.75rem; }
    .presence-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }
    .presence-dot.online { background-color: #4caf50; }
    .presence-dot.away { background-color: #ff9800; }
    .presence-dot.offline { background-color: #9e9e9e; }
    .presence-dot.dnd { background-color: #f44336; }
    .participant-name { font-weight: 500; }
    .admin-chip { font-size: 0.75rem; min-height: 22px; --mdc-chip-elevated-container-color: #fff3e0; }
    .presence-label { font-size: 0.8125rem; color: rgba(0, 0, 0, 0.5); }
  `,
})
export default class RoomDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly chatRoomService = inject(ChatRoomService);
  private readonly chatMessageService = inject(ChatMessageService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly room = this.store.selectSignal(selectSelectedRoom);
  readonly messages = this.store.selectSignal(selectMessages);
  readonly loading = this.store.selectSignal(selectChatLoading);

  readonly activeTab = signal(0);
  readonly participants = signal<ChatParticipantDto[]>([]);
  readonly showParticipantForm = signal(false);
  readonly savingParticipant = signal(false);
  readonly sendingMessage = signal(false);
  readonly editingMessageId = signal<string | null>(null);
  readonly savingEdit = signal(false);

  newMessageContent = '';
  editContent = '';

  readonly participantForm = this.fb.nonNullable.group({
    userId: ['', [Validators.required]],
    displayName: ['', [Validators.required]],
    isAdmin: [false],
  });

  ngOnInit(): void {
    this.store.dispatch(ChatActions.loadRoom({ id: this.id() }));
    this.store.dispatch(ChatActions.loadMessages({ chatRoomId: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  // --- Messages ---

  onSendMessage(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (!this.newMessageContent.trim()) return;
    const request: SendMessageRequest = {
      chatRoomId: this.id(),
      content: this.newMessageContent.trim(),
    };
    this.sendingMessage.set(true);
    this.chatMessageService.sendMessage(request).subscribe({
      next: () => {
        this.notification.success('Message sent');
        this.newMessageContent = '';
        this.sendingMessage.set(false);
        this.store.dispatch(ChatActions.loadMessages({ chatRoomId: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to send message');
        this.sendingMessage.set(false);
      },
    });
  }

  startEdit(message: ChatMessageDto): void {
    this.editingMessageId.set(message.id);
    this.editContent = message.content;
  }

  cancelEdit(): void {
    this.editingMessageId.set(null);
    this.editContent = '';
  }

  saveEdit(messageId: string): void {
    if (!this.editContent.trim()) return;
    const request: EditMessageRequest = {
      messageId,
      content: this.editContent.trim(),
    };
    this.savingEdit.set(true);
    this.chatMessageService.editMessage(messageId, request).subscribe({
      next: () => {
        this.notification.success('Message updated');
        this.editingMessageId.set(null);
        this.editContent = '';
        this.savingEdit.set(false);
        this.store.dispatch(ChatActions.loadMessages({ chatRoomId: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to update message');
        this.savingEdit.set(false);
      },
    });
  }

  deleteMessage(messageId: string): void {
    if (!confirm('Are you sure you want to delete this message?')) return;
    this.chatMessageService.deleteMessage(messageId).subscribe({
      next: () => {
        this.notification.success('Message deleted');
        this.store.dispatch(ChatActions.loadMessages({ chatRoomId: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to delete message');
      },
    });
  }

  reactToMessage(messageId: string, emoji: string): void {
    const request: ReactToMessageRequest = { messageId, emoji };
    this.chatMessageService.reactToMessage(messageId, request).subscribe({
      next: () => {
        this.notification.success('Reaction added');
        this.store.dispatch(ChatActions.loadMessages({ chatRoomId: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add reaction');
      },
    });
  }

  openThread(messageId: string): void {
    this.router.navigate(['/chat', this.id(), 'thread', messageId]);
  }

  // --- Participants ---

  toggleParticipantForm(): void {
    this.showParticipantForm.update(v => !v);
    if (this.showParticipantForm()) {
      this.participantForm.reset({ isAdmin: false });
    }
  }

  onAddParticipant(): void {
    if (this.participantForm.invalid) return;
    const value = this.participantForm.getRawValue();
    const request: AddParticipantRequest = {
      chatRoomId: this.id(),
      userId: value.userId,
      displayName: value.displayName,
      isAdmin: value.isAdmin || undefined,
    };
    this.savingParticipant.set(true);
    this.chatRoomService.addParticipant(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Participant added');
        this.showParticipantForm.set(false);
        this.participantForm.reset({ isAdmin: false });
        this.savingParticipant.set(false);
        this.participants.update(list => [
          ...list,
          {
            id: crypto.randomUUID(),
            chatRoomId: this.id(),
            userId: value.userId,
            displayName: value.displayName,
            isAdmin: value.isAdmin,
            lastReadAt: null,
            isMuted: false,
            presence: 'Offline' as PresenceStatus,
            createdAt: new Date().toISOString(),
          },
        ]);
        this.store.dispatch(ChatActions.loadRoom({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add participant');
        this.savingParticipant.set(false);
      },
    });
  }

  removeParticipant(userId: string): void {
    if (!confirm('Are you sure you want to remove this participant?')) return;
    this.chatRoomService.removeParticipant(this.id(), userId).subscribe({
      next: () => {
        this.notification.success('Participant removed');
        this.participants.update(list => list.filter(p => p.userId !== userId));
        this.store.dispatch(ChatActions.loadRoom({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to remove participant');
      },
    });
  }
}
