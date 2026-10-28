import { NotificationChannel } from './notification.model';

export interface NotificationTemplateDto {
  id: string;
  eventType: string;
  titleTemplateEn: string;
  bodyTemplateEn: string;
  titleTemplateAm: string | null;
  bodyTemplateAm: string | null;
  defaultChannel: NotificationChannel;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
}

export interface CreateNotificationTemplateRequest {
  eventType: string;
  titleTemplateEn: string;
  bodyTemplateEn: string;
  defaultChannel: NotificationChannel;
  titleTemplateAm?: string;
  bodyTemplateAm?: string;
}

export interface UpdateNotificationTemplateRequest {
  id: string;
  titleTemplateEn: string;
  bodyTemplateEn: string;
  defaultChannel: NotificationChannel;
  titleTemplateAm?: string;
  bodyTemplateAm?: string;
}
