import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface ListQuery {
  page: number;
  limit: number;
  unreadOnly: boolean;
}

interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  channel: 'PUSH' | 'SMS' | 'IN_APP' | 'EMAIL';
  data?: Record<string, any>;
}

interface RegisterDeviceDto {
  token: string;
  platform: 'IOS' | 'ANDROID';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly db: DatabaseService) {}

  async list(userId: string, query: ListQuery) {
    const { page, limit, unreadOnly } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = { userId };
    if (unreadOnly) {
      where.readAt = null;
    }

    const [notifications, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          title: true,
          body: true,
          channel: true,
          readAt: true,
          data: true,
          createdAt: true,
        },
      }),
      this.db.notification.count({ where }),
    ]);

    return {
      data: notifications.map((n) => ({
        ...n,
        isRead: !!n.readAt,
      })),
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.db.notification.count({
      where: { userId, readAt: null },
    });

    return { unreadCount: count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.db.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.db.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    const result = await this.db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return {
      message: `${result.count} notifications marked as read`,
      count: result.count,
    };
  }

  async send(dto: SendNotificationDto) {
    // TODO: Validate target user exists
    // TODO: Based on channel, dispatch to appropriate service:
    //   - PUSH: Send via FCM/APNs
    //   - SMS: Send via SMS gateway (Orange, Twilio)
    //   - EMAIL: Send via email provider (SendGrid, SES)
    //   - IN_APP: Store in database (always done)

    const notification = await this.db.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        channel: dto.channel,
        data: dto.data ? JSON.stringify(dto.data) : null,
      },
    });

    // TODO: Dispatch to external channel
    switch (dto.channel) {
      case 'PUSH':
        // TODO: Fetch device tokens for user, send via FCM
        this.logger.log(`Push notification queued for user ${dto.userId}`);
        break;
      case 'SMS':
        // TODO: Send SMS via provider
        this.logger.log(`SMS notification queued for user ${dto.userId}`);
        break;
      case 'EMAIL':
        // TODO: Send email via provider
        this.logger.log(`Email notification queued for user ${dto.userId}`);
        break;
      case 'IN_APP':
        this.logger.log(`In-app notification created for user ${dto.userId}`);
        break;
    }

    return {
      notificationId: notification.id,
      channel: dto.channel,
      status: 'SENT',
    };
  }

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    // TODO: Upsert device token (replace old token for same device)
    // TODO: Subscribe to relevant FCM topics

    await this.db.deviceToken.upsert({
      where: {
        userId_platform: { userId, platform: dto.platform },
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
      },
      update: {
        token: dto.token,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Device registered for user ${userId} (${dto.platform})`);

    return { message: 'Device registered for push notifications' };
  }
}
