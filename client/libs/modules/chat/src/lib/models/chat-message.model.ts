export type MessageStatus = 'Sent' | 'Delivered' | 'Read' | 'Deleted';

export interface ChatMessageDto {
  id: string;
  chatRoomId: string;
  senderUserId: string;
  senderDisplayName: string;
  content: string;
  status: MessageStatus;
  parentMessageId: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  reaction: string | null;
  editedAt: string | null;
  threadReplyCount: number;
  createdAt: string;
  createdBy: string | null;
}

export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
  parentMessageId?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface EditMessageRequest {
  messageId: string;
  content: string;
}

export interface ReactToMessageRequest {
  messageId: string;
  emoji: string;
}
