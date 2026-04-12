import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /** Listar todos los roles de la empresa actual, incluyendo sus permisos */
  async findAll(user: ActiveUserData) {
    // Primero aseguramos que existan los roles por defecto para esta empresa
    await this.ensureDefaultRoles(user.companyId);

    return this.prisma.roles.findMany({
      where: { company_id: user.companyId },
      include: {
        role_permissions: {
          include: { permissions: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /** Obtener lista de todos los permisos base del sistema */
  async findAllPermissions() {
    return this.prisma.permissions.findMany({
      orderBy: { name: 'asc' }
    });
  }

  /** 
   * Lógica Central: Asegura que la empresa tenga los 3 roles predeterminados
   * con sus respectivos permisos.
   */
  async ensureDefaultRoles(companyId: string) {
    const roles = [
      { name: 'ADMIN', permissions: ['dashboard.view', 'pos.access', 'cash.manage', 'inventory.manage', 'purchases.manage', 'history.view', 'sales.cancel', 'users.manage', 'reports.view'] },
      { name: 'SUPERVISOR', permissions: ['dashboard.view', 'pos.access', 'cash.manage', 'inventory.manage', 'history.view', 'reports.view'] },
      { name: 'CAJERO', permissions: ['pos.access', 'cash.manage', 'history.view'] }
    ];

    for (const r of roles) {
      // 1. Upsert del Rol
      const role = await this.prisma.roles.upsert({
        where: { id: (await this.prisma.roles.findFirst({ where: { company_id: companyId, name: r.name } }))?.id || '00000000-0000-0000-0000-000000000000' },
        update: {},
        create: {
          name: r.name,
          company_id: companyId
        }
      });

      // 2. Sincronizar Permisos para ese Rol
      const permsInDb = await this.prisma.permissions.findMany({
        where: { key: { in: r.permissions } }
      });

      for (const p of permsInDb) {
        await this.prisma.role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: p.id
            }
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: p.id
          }
        });
      }
    }
  }
}
