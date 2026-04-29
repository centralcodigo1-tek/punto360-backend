import { IsArray, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportProductItemDto {
    @IsString()
    @IsOptional()
    reference?: string;

    @IsString()
    nombre: string;

    @IsNumber()
    @Type(() => Number)
    precio_compra: number;

    @IsNumber()
    @Type(() => Number)
    precio_venta: number;

    @IsNumber()
    @Type(() => Number)
    stock: number;

    @IsString()
    @IsOptional()
    categoria?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    tipo_venta?: number;
}

export class ImportProductsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportProductItemDto)
    productos: ImportProductItemDto[];
}
