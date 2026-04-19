import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { SuperAdminService } from './superadmin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';
import { CreateClientDto, CreateSubscriptionDto } from './dto/create-client.dto';

@Controller('superadmin')
@Roles(Role.SUPERADMIN)
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  @Get('clients')
  getClients() {
    return this.service.getClients();
  }

  @Get('clients/:id')
  getClientDetail(@Param('id') id: string) {
    return this.service.getClientDetail(id);
  }

  @Post('clients')
  createClient(@Body() dto: CreateClientDto) {
    return this.service.createClient(dto);
  }

  @Post('clients/:id/subscriptions')
  addSubscription(@Param('id') id: string, @Body() dto: CreateSubscriptionDto) {
    return this.service.addSubscription(id, dto);
  }

  @Patch('subscriptions/:id/status')
  updateSubscriptionStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateSubscriptionStatus(id, status);
  }
}
