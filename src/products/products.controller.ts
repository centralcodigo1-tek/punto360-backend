"use strict";
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ImportProductsDto } from './dto/import-products.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('next-sku')
    getNextSku(@ActiveUser() user: ActiveUserData) {
        return this.productsService.getNextSku(user);
    }

    @Post('import')
    importProducts(@Body() dto: ImportProductsDto, @ActiveUser() user: ActiveUserData) {
        return this.productsService.importProducts(dto, user);
    }

    @Get()
    findAll(@ActiveUser() user: ActiveUserData) {
        return this.productsService.findAll(user);
    }

    @Post()
    create(@Body() dto: CreateProductDto, @ActiveUser() user: ActiveUserData) {
        return this.productsService.create(dto, user);
    }

    @Patch(':id/toggle')
    toggleStatus(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
        return this.productsService.toggleStatus(id, user);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: CreateProductDto, @ActiveUser() user: ActiveUserData) {
        return this.productsService.update(id, dto, user);
    }
}
