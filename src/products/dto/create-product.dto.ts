import { IsUUID, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    sku: string;

    @IsUUID()
    category_id: string;

    @Type(() => Number)
    @IsNumber()
    cost_price: number;

    @Type(() => Number)
    @IsNumber()
    sale_price: number;

    @Type(() => Number)
    @IsNumber()
    stock: number;

    @IsString()
    @IsOptional()
    unit_type?: string;

    @IsBoolean()
    is_active: boolean;

    @IsBoolean()
    @IsOptional()
    is_consignment?: boolean;

    @IsBoolean()
    @IsOptional()
    has_variants?: boolean;

    @IsString()
    @IsOptional()
    barcode?: string;
}
