import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ChatMessageService } from '../../services/chat-message.service';
import { ChatMessageDto, SendMessageRequest } from '../../models/chat-message.model';

@Component({
  selector: 'ethel-message-thread',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'chat.thread.title' | translate">
      <button mat-stroked-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'chat.thread.backToRoom' | translate }}
      </button>
    </app-page-header>

    @if (loadingMessages()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="thread-container">
        <!-- Parent Message -->
        @if (parentMessage()) {
          <div class="parent-message">
            <div class="message-header">
              <span class="sender-name">{{ parentMessage()!.senderDisplayName }}</span>
              <span class="message-time">{{ parentMessage()!.createdAt | date:'short' }}</span>
              <mat-chip class="status-chip"
                        [class.status-sent]="parentMessage()!.status === 'Sent'"
                        [class.status-delivered]="parentMessage()!.status === 'Delivered'"
                        [class.status-read]="parentMessage()!.status === 'Read'"
                        [class.status-deleted]="parentMessage()!.status === 'Deleted'">
                {{ parentMessage()!.status }}
              </mat-chip>
            </div>
            <div class="message-content">
              @if (parentMessage()!.status === 'Deleted') {
                <em class="deleted-text">[Message deleted]</em>
              } @else {
                {{ parentMessage()!.content }}
                @if (parentMessage()!.editedAt) {
                  <span class="edited-label">(edited)</span>
                }
              }
            </div>
            @if (parentMessage()!.reaction) {
              <div class="reactions">
                <mat-chip class="reaction-chip">{{ parentMessage()!.reaction }}</mat-chip>
              </div>
            }
          </div>

          <div class="thread-divider">
            <span class="divider-text">{{ replies().length }} {{ replies().length === 1 ? 'reply' : 'replies' }}</span>
          </div>
        } @else {
          <app-empty-state
            icon="chat_bubble_outline"
            title="Message not found"
            message="The parent message could not be found.">
          </app-empty-state>
        }

        <!-- Thread Replies -->
        <div class="replies-list">
          @for (reply of replies(); track reply.id) {
            <div class="reply-bubble">
              <div class="message-header">
                <span class="sender-name">{{ reply.senderDisplayName }}</span>
                <span class="message-time">{{ reply.createdAt | date:'short' }}</span>
              </div>
              <div class="message-content">
                @if (reply.status === 'Deleted') {
                  <em class="deleted-text">[Message deleted]</em>
                } @else {
                  {{ reply.content }}
                  @if (reply.editedAt) {
                    <span class="edited-label">(edited)</span>
                  }
                }
              </div>
              @if (reply.reaction) {
                <div class="reactions">
                  <mat-chip class="reaction-chip">{{ reply.reaction }}</mat-chip>
                </div>
              }
            </div>
          }
        </div>

        <!-- Reply Input -->
        <div class="reply-input-area" *appHasPermission="'chat.messages.send'">
          <mat-form-field appearance="outline" class="reply-field">
            <mat-label>{{ 'chat.thread.replyPlaceholder' | translate }}</mat-label>
            <textarea matInput [(ngModel)]="replyContent" rows="2" (keydown.enter)="onSendReply($event)"></textarea>
          </mat-form-field>
          <button mat-fab color="primary" (click)="onSendReply()" [disabled]="!replyContent || sendingReply()">
            @if (sendingReply()) {
              <mat-spinner diameter="24"></mat-spinner>
            } @else {
              <mat-icon>send</mat-icon>
            }
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .thread-container { display: flex; flex-direction: column; gap: 1rem; max-width: 900px; }
    .parent-message {
      background: #e3f2fd;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      border-left: 4px solid #1976d2;
    }
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
    .reactions { display: flex; gap: 0.25rem; margin-top: 0.5rem; }
    .reaction-chip { font-size: 0.875rem; min-height: 24px; }
    .thread-divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0.5rem 0;
    }
    .thread-divider::before,
    .thread-divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .divider-text { font-size: 0.8125rem; color: rgba(0, 0, 0, 0.5); white-space: nowrap; }
    .replies-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .reply-bubble {
      background: #f5f5f5;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-left: 1.5rem;
    }
    .reply-input-area {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      margin-top: 0.5rem;
    }
    .reply-field { flex: 1; }
  `,
})
export default class MessageThreadComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly chatMessageService = inject(ChatMessageService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();
  readonly messageId = input.required<string>();

  readonly loadingMessages = signal(true);
  readonly allMessages = signal<ChatMessageDto[]>([]);
  readonly sendingReply = signal(false);

  replyContent = '';

  readonly parentMessage = computed(() => {
    return this.allMessages().find(m => m.id === this.messageId()) ?? null;
  });

  readonly replies = computed(() => {
    return this.allMessages().filter(m => m.parentMessageId === this.messageId());
  });

  ngOnInit(): void {
    this.loadMessages();
  }

  private loadMessages(): void {
    this.loadingMessages.set(true);
    this.chatMessageService.listMessages({ chatRoomId: this.id(), pageSize: 200 }).subscribe({
      next: (result) => {
        this.allMessages.set(result.items);
        this.loadingMessages.set(false);
      },
      error: () => {
        this.loadingMessages.set(false);
      },
    });
  }

  onSendReply(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (!this.replyContent.trim()) return;
    const request: SendMessageRequest = {
      chatRoomId: this.id(),
      content: this.replyContent.trim(),
      parentMessageId: this.messageId(),
    };
    this.sendingReply.set(true);
    this.chatMessageService.sendMessage(request).subscribe({
      next: () => {
        this.notification.success('Reply sent');
        this.replyContent = '';
        this.sendingReply.set(false);
        this.loadMessages();
      },
      error: () => {
        this.notification.error('Failed to send reply');
        this.sendingReply.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/chat', this.id()]);
  }
}
