import { Controller, Get, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('branches')
@UseGuards(PermissionsGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Permissions('users.manage') // O cualquier permiso general de lectura
  findAll(@ActiveUser() user: ActiveUserData) {
    return this.branchesService.findAll(user);
  }
}
