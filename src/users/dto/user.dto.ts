import { IsString, IsEmail, IsArray, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  user_name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  roleIds: string[];

  @IsArray()
  branchIds: string[];
}

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() user_name?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsArray() roleIds?: string[];
  @IsOptional() @IsArray() branchIds?: string[];
  @IsOptional() @IsBoolean() is_active?: boolean;
}
