import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
    // Company Data
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
    companyName: string;

    @IsString()
    @IsOptional()
    documentNumber?: string;

    @IsString()
    @IsOptional()
    companyPhone?: string;

    @IsString()
    @IsOptional()
    companyEmail?: string;

    @IsString()
    @IsOptional()
    companyAddress?: string;

    // Branch Data
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
    branchName: string;

    @IsString()
    @IsOptional()
    branchAddress?: string;

    // Admin User Data
    @IsString()
    @IsNotEmpty({ message: 'El nombre del usuario administrador es obligatorio' })
    userName: string;

    @IsEmail({}, { message: 'El correo debe tener un formato válido' })
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
    userEmail: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    userPassword: string;
}
