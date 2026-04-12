import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('users.manage')
  findAll(@ActiveUser() user: ActiveUserData) {
    return this.rolesService.findAll(user);
  }

  @Get('permissions')
  @Permissions('users.manage')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }
}
