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
  channel: 'push' | 'sms' | 'in_app' | 'email';
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly db: DatabaseService) {}

  async list(userId: string, query: ListQuery): Promise<any> {
    const { page, limit, unreadOnly } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          titleFr: true,
          bodyFr: true,
          channel: true,
          isRead: true,
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
        title: n.titleFr,
        body: n.bodyFr,
      })),
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.db.notification.count({
      where: { userId, isRead: false },
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
      data: { isRead: true, readAt: new Date() },
    });

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    const result = await this.db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return {
      message: `${result.count} notifications marked as read`,
      count: result.count,
    };
  }

  async send(dto: SendNotificationDto) {
    // TODO: Validate target user exists
    // TODO: Based on channel, dispatch to appropriate service:
    //   - push: Send via FCM/APNs
    //   - sms: Send via SMS gateway (Orange, Twilio)
    //   - email: Send via email provider (SendGrid, SES)
    //   - in_app: Store in database (always done)

    const notification = await this.db.notification.create({
      data: {
        userId: dto.userId,
        titleFr: dto.title,
        bodyFr: dto.body,
        channel: dto.channel,
        data: dto.data ? (dto.data as any) : undefined,
      },
    });

    // TODO: Dispatch to external channel
    switch (dto.channel) {
      case 'push':
        // TODO: Fetch device tokens for user, send via FCM
        this.logger.log(`Push notification queued for user ${dto.userId}`);
        break;
      case 'sms':
        // TODO: Send SMS via provider
        this.logger.log(`SMS notification queued for user ${dto.userId}`);
        break;
      case 'email':
        // TODO: Send email via provider
        this.logger.log(`Email notification queued for user ${dto.userId}`);
        break;
      case 'in_app':
        this.logger.log(`In-app notification created for user ${dto.userId}`);
        break;
    }

    return {
      notificationId: notification.id,
      channel: dto.channel,
      status: 'SENT',
    };
  }

  async registerDevice(userId: string, dto: { token: string; platform: string }) {
    // TODO: Upsert device token using UserDevice model
    // TODO: Subscribe to relevant FCM topics

    await this.db.userDevice.upsert({
      where: {
        userId_deviceId: { userId, deviceId: dto.token },
      },
      create: {
        userId,
        deviceId: dto.token,
        platform: dto.platform,
        pushToken: dto.token,
        isActive: true,
      },
      update: {
        pushToken: dto.token,
        isActive: true,
        lastLoginAt: new Date(),
      },
    });

    this.logger.log(`Device registered for user ${userId} (${dto.platform})`);

    return { message: 'Device registered for push notifications' };
  }
}
