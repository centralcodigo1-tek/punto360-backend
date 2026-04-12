import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('reports')
@UseGuards(PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial')
  @Permissions('reports.view')
  getFinancialSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.reportsService.getFinancialSummary(startDate, endDate, user);
  }

  @Get('sales-trend')
  @Permissions('reports.view')
  getSalesTrend(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.reportsService.getSalesTrend(startDate, endDate, user);
  }

  @Get('top-products')
  @Permissions('reports.view')
  getTopProducts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.reportsService.getTopProducts(startDate, endDate, user, limit);
  }

  @Get('category-stats')
  @Permissions('reports.view')
  getCategoryStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.reportsService.getCategoryStats(startDate, endDate, user);
  }
}
