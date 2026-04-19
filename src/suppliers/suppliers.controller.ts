import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Controller('suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) {}

    @Get()
    findAll(@ActiveUser() user: ActiveUserData) {
        return this.suppliersService.findAll(user);
    }

    @Get(':id/purchases')
    findOnePurchases(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
        return this.suppliersService.findOnePurchases(id, user);
    }

    @Post()
    create(@Body() dto: CreateSupplierDto, @ActiveUser() user: ActiveUserData) {
        return this.suppliersService.create(dto, user);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateSupplierDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.suppliersService.update(id, dto, user);
    }
}
