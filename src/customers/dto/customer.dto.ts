import { IsString, IsOptional, IsNumber, IsEmail, Min } from 'class-validator';

export class CreateCustomerDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    credit_limit?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    credit_limit?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class AddCustomerPaymentDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsOptional()
    @IsString()
    method?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
