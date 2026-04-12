import { Controller, Post, Body, Get, Query, Put, Param } from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  createSale(
    @Body() dto: CreateSaleDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.salesService.createSale(dto, user);
  }

  @Get('stats')
  getSalesStats(@ActiveUser() user: ActiveUserData) {
    return this.salesService.getSalesStats(user);
  }

  @Get()
  getSalesHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.salesService.getSalesHistory(startDate, endDate, user);
  }

  @Put(':id/cancel')
  cancelSale(
      @Param('id') id: string,
      @ActiveUser() user: ActiveUserData,
  ) {
      return this.salesService.cancelSale(id, user);
  }
}
