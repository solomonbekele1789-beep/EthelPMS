export type ChatRoomType = 'Direct' | 'Group' | 'Channel';

export interface ChatRoomDto {
  id: string;
  name: string | null;
  type: ChatRoomType;
  description: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdByUserId: string | null;
  participantCount: number;
  lastMessagePreview: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface CreateChatRoomRequest {
  type: ChatRoomType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  participantUserIds?: string[];
}

export interface AddParticipantRequest {
  chatRoomId: string;
  userId: string;
  displayName: string;
  isAdmin?: boolean;
}
