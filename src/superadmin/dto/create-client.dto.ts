import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty() @IsString()
  companyName: string;

  @IsOptional() @IsEmail()
  companyEmail?: string;

  @IsOptional() @IsString()
  companyPhone?: string;

  @IsOptional() @IsString()
  companyAddress?: string;

  @IsNotEmpty() @IsString()
  branchName: string;

  @IsNotEmpty() @IsString()
  adminName: string;

  @IsNotEmpty() @IsEmail()
  adminEmail: string;

  @IsNotEmpty() @IsString() @MinLength(6)
  adminPassword: string;
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  startDate: string;

  @IsOptional() @IsString()
  notes?: string;
}
