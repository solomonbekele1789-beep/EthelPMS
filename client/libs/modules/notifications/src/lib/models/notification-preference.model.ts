export interface UserNotificationPreferenceDto {
  id: string;
  userId: string;
  eventType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  createdAt: string;
}

export interface UpdateNotificationPreferenceRequest {
  eventType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}
