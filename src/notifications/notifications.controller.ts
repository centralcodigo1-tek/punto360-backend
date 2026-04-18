import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  getNotifications(@ActiveUser() user: ActiveUserData) {
    return this.service.getNotifications(user);
  }
}
