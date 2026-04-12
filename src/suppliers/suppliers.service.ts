import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) {}

    findAll(user: ActiveUserData) {
        return this.prisma.suppliers.findMany({
            where: { company_id: user.companyId },
            orderBy: { name: 'asc' },
        });
    }

    create(dto: CreateSupplierDto, user: ActiveUserData) {
        return this.prisma.suppliers.create({
            data: {
                company_id: user.companyId,
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
            },
        });
    }

    update(id: string, dto: UpdateSupplierDto, user: ActiveUserData) {
        return this.prisma.suppliers.update({
            where: { id },
            data: {
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
            },
        });
    }
}
