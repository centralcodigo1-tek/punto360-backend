import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: ActiveUserData) {
    return this.prisma.branches.findMany({
      where: {
        company_id: user.companyId,
        is_active: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
