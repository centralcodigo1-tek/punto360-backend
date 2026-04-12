import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Injectable()
export class CategoriesService {

  constructor(private prisma: PrismaService) {}

  async findAll(user: ActiveUserData) {
    return this.prisma.categories.findMany({
      where: {
        company_id: user.companyId,
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, user: ActiveUserData) {
    return this.prisma.categories.create({
      data: { 
        name,
        company_id: user.companyId,
      },
    });
  }
}
