export type NotificationType =
  | 'MORNING_BRIEFING'
  | 'HOMECOMING_BRIEFING'
  | 'PRODUCT_CYCLE';

export type NotificationStatus = 'PENDING' | 'COMPLETED' | 'LATER' | 'DISMISSED';

export interface NotificationItem {
  id: number | string;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  productId?: number | null;
  productName?: string;
  createdAt: string; // ISO datetime
  processedAt?: string | null;
}
