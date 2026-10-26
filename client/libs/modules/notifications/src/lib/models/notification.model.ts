export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type NotificationStatus = 'Pending' | 'Sent' | 'Read' | 'Failed' | 'Archived';

export type NotificationChannel = 'InApp' | 'Email' | 'Push' | 'Sms';

export interface NotificationDto {
  id: string;
  recipientUserId: string;
  eventType: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  channel: NotificationChannel;
  actionUrl: string | null;
  entityId: string | null;
  entityType: string | null;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface UnreadCountDto {
  count: number;
}
