import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { CreateClientDto, CreateSubscriptionDto } from './dto/create-client.dto';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  async getClients() {
    const companies = await this.prisma.companies.findMany({
      include: {
        branches: { select: { id: true, name: true, is_active: true } },
        _count: { select: { users: true } },
        subscriptions: {
          orderBy: { end_date: 'desc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return companies.map(c => {
      const lastSub = c.subscriptions[0] ?? null;
      const now = new Date();
      let subscriptionStatus = 'sin_suscripcion';
      let daysRemaining: number | null = null;

      if (lastSub) {
        const end = new Date(lastSub.end_date);
        daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (lastSub.status === 'suspended') subscriptionStatus = 'suspended';
        else if (daysRemaining <= 0) subscriptionStatus = 'expired';
        else if (daysRemaining <= 30) subscriptionStatus = 'expiring_soon';
        else subscriptionStatus = 'active';
      }

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        createdAt: c.created_at,
        users: c._count.users,
        branches: c.branches,
        subscriptionStatus,
        daysRemaining,
        lastSubscription: lastSub,
      };
    });
  }

  async getClientDetail(companyId: string) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      include: {
        branches: { orderBy: { created_at: 'asc' } },
        users: {
          include: { user_roles: { include: { roles: true } } },
          orderBy: { created_at: 'desc' },
        },
        subscriptions: { orderBy: { start_date: 'desc' } },
      },
    });

    if (!company) throw new NotFoundException('Cliente no encontrado');
    return company;
  }

  async createClient(dto: CreateClientDto) {
    const existingUser = await this.prisma.users.findUnique({ where: { email: dto.adminEmail.toLowerCase() } });
    if (existingUser) throw new BadRequestException('Ya existe un usuario con ese email');

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.companies.create({
        data: {
          name: dto.companyName,
          email: dto.companyEmail,
          phone: dto.companyPhone,
          address: dto.companyAddress,
        },
      });

      const branch = await tx.branches.create({
        data: {
          company_id: company.id,
          name: dto.branchName,
          code: `${company.id.slice(0, 8).toUpperCase()}-MAIN`,
          is_main: true,
          is_active: true,
        },
      });

      const perms = await tx.permissions.findMany();
      const adminRole = await tx.roles.create({
        data: {
          name: 'ADMIN',
          company_id: company.id,
          role_permissions: {
            create: perms.map(p => ({ permission_id: p.id })),
          },
        },
      });

      const password_hash = await bcrypt.hash(dto.adminPassword, 10);
      const adminUser = await tx.users.create({
        data: {
          company_id: company.id,
          name: dto.adminName,
          user_name: dto.adminName.split(' ')[0],
          email: dto.adminEmail.toLowerCase(),
          password_hash,
          is_active: true,
          user_roles: { create: { role_id: adminRole.id } },
          user_branches: { create: { branch_id: branch.id } },
        },
      });

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const subscription = await tx.subscriptions.create({
        data: {
          company_id: company.id,
          start_date: startDate,
          end_date: endDate,
          amount: 800000,
          status: 'active',
        },
      });

      return { company, branch, adminUser, subscription };
    });
  }

  async addSubscription(companyId: string, dto: CreateSubscriptionDto) {
    const company = await this.prisma.companies.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Cliente no encontrado');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    return this.prisma.subscriptions.create({
      data: {
        company_id: companyId,
        start_date: startDate,
        end_date: endDate,
        amount: 800000,
        status: 'active',
        notes: dto.notes,
      },
    });
  }

  async updateSubscriptionStatus(subscriptionId: string, status: string) {
    return this.prisma.subscriptions.update({
      where: { id: subscriptionId },
      data: { status },
    });
  }
}
