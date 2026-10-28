export type PresenceStatus = 'Online' | 'Away' | 'Offline' | 'DoNotDisturb';

export interface ChatParticipantDto {
  id: string;
  chatRoomId: string;
  userId: string;
  displayName: string;
  isAdmin: boolean;
  lastReadAt: string | null;
  isMuted: boolean;
  presence: PresenceStatus;
  createdAt: string;
}
