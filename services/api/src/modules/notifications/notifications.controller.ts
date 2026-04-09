import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List notifications',
    description: 'Returns paginated notifications for the authenticated user.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean, description: 'Filter to unread only' })
  @ApiOkResponse({ description: 'Notifications returned' })
  async list(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('unreadOnly') unreadOnly = false,
  ) {
    return this.notificationsService.list(req.user?.id, { page, limit, unreadOnly });
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Returns the number of unread notifications.',
  })
  @ApiOkResponse({ description: 'Unread count returned' })
  async getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user?.id);
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a specific notification as read.',
  })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiOkResponse({ description: 'Notification marked as read' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user?.id, id);
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications for the authenticated user as read.',
  })
  @ApiOkResponse({ description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user?.id);
  }

  @Post('send')
  @ApiOperation({
    summary: 'Send a notification (internal/admin)',
    description:
      'Sends a notification to a specific user via push, SMS, or in-app channel. Requires admin privileges.',
  })
  @ApiCreatedResponse({ description: 'Notification sent' })
  async send(
    @Body()
    dto: {
      userId: string;
      title: string;
      body: string;
      channel: 'PUSH' | 'SMS' | 'IN_APP' | 'EMAIL';
      data?: Record<string, any>;
    },
  ) {
    return this.notificationsService.send(dto);
  }

  @Post('register-device')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register device for push notifications',
    description: 'Registers a device push token (FCM/APNs) for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Device registered' })
  async registerDevice(
    @Request() req: any,
    @Body() dto: { token: string; platform: 'IOS' | 'ANDROID' },
  ) {
    return this.notificationsService.registerDevice(req.user?.id, dto);
  }
}
