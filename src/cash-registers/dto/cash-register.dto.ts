import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashDto {
    @IsNumber()
    @Min(0)
    opening_amount: number;

    @IsOptional()
    @IsString()
    name?: string;
}

export class CloseCashDto {
    @IsNumber()
    @Min(0)
    closing_amount: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class AddExpenseDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    reason: string;
}
