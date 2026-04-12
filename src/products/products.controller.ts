import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Put
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('next-sku')
    getNextSku(@ActiveUser() user: ActiveUserData) {
        return this.productsService.getNextSku(user);
    }
    
    @Get()
    findAll(@ActiveUser() user: ActiveUserData) {
        return this.productsService.findAll(user);
    }
    
    @Post()
    async create(
        @Body() dto: CreateProductDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.productsService.create(dto, user);
    }
    
    @Patch(':id/toggle')
    toggleStatus(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
        return this.productsService.toggleStatus(id, user);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() dto: CreateProductDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.productsService.update(id, dto, user);
    }
}
